import { Controller } from "@wisdom-serve/serve";
import sql from "./sql-commit-function";
import { Ollama } from "ollama";
import { v4 as createUuid } from "uuid";
import { createHmac, createHash } from "crypto";
import axios from "axios";
import { get } from "lodash";
import * as FormData from "form-data";
import * as fs from "fs-extra";
import * as path from "path";
const ollamaChatModel = process.env.model || "llama3.1";
const ollama = new Ollama({
  host: process.env.api_host || "http://127.0.0.1:11434",
});
const ragHost = "http://223.94.45.209:36580";
// 本地文件目录
const uploadDir = path.resolve(process.cwd(), "static/upload");
fs.mkdirSync(uploadDir, { recursive: true });
// 应用id
const appId = "67297119008e9638a2540ada";
// 知识库id
const datasetId = "67296f0a008e9638a254068c";
const token =
  "fastgpt-fHgK4Dbe1ijgh6gbE7rPKiupNVII98vpW9sXQbdx5HoLkgEcPlAbfOxejs3P6T";
const Authorization = `Bearer ${token}`;
export const send_dingding = async function (data: any) {
  const timestamp = Date.now();
  const access_token = process.env.dingtalk_access_token;
  const secret = process.env.dingtalk_secret;
  const sign = createHmac("sha256", secret)
    .update(`${timestamp}\n${secret}`, "utf8")
    .digest("base64");
  try {
    const res = await axios({
      url: "https://oapi.dingtalk.com/robot/send",
      method: "post",
      params: {
        access_token,
        timestamp,
        sign: encodeURIComponent(sign),
      },
      data: {
        msgtype: "markdown",
        markdown: data,
        at: {
          atMobiles: [],
        },
      },
    });
    if (
      res.data &&
      typeof res.data.errcode === "number" &&
      res.data.errcode === 0
    ) {
      console.log("【钉钉消息】发送成功");
    } else {
      console.error("【钉钉消息】发送成功", res.data);
    }
  } catch (err) {
    console.error("【钉钉消息】发送失败", err.message);
  }
};
export const chatAuthInterceptor = async function () {
  try {
    let currUserInfo = {}
    if (this.$url === "/api/v1/chat") {
      const chatToken = this.$Serialize.get(true, this.$query, "t");
      const sqls = sql("./chat.sql");
      const {
        results: [info],
      } = await this.$DB_$chat.query(sqls.query_chat_info_by_token, [
        chatToken,
      ]);
      if (!info) {
        this.$error("Unauthorized");
        return Promise.reject("Unauthorized");
      }
      currUserInfo = info
    } else {
      const sqls = sql("./sql.sql");
      const {
        headers: { authorization },
      } = this.request;
      if (!authorization) {
        this.$error("Unauthorized");
        return Promise.reject("Unauthorized");
      }
      const userInfo = (
        await this.$DB.query(sqls.query_user_info_by_token, [authorization])
      ).results?.[0];
      if (!userInfo) {
        this.$error("Unauthorized");
        return Promise.reject("Unauthorized");
      }
      currUserInfo = userInfo
    }
    const {
      data: {
        data: { token },
      },
    } = await axios({
      baseURL: ragHost,
      url: "/api/support/user/account/loginByPassword",
      method: "post",
      data: {
        username: "root",
        password: createHash("sha256").update("1234").digest("hex"),
      },
    });
    return Promise.resolve({
      userInfo:currUserInfo,
      token,
    });
  } catch (err) {
    console.error(err);
    this.$error(err.err || err.message);
  }
} as Controller;

export const chat = async function (req, res, chatAuthInterceptorData, ...args:string[]) {
  const { userInfo:{token:fastgpt_token} } = chatAuthInterceptorData
  let isSetChatResponseHead = false;
  const setChatResponseHead = () => {
    if (!isSetChatResponseHead) {
      isSetChatResponseHead = true;
      this.response.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "*",
        "access-control-allow-headers": "*",
      });
    }
  };
  try {
    let systemMessages = "";
    let body = {
      tags: [],
      modelValue: "",
    };
    const chatToken = this.$Serialize.get(true, this.$query, "t");
    const sqlsInfo = sql("./chat.sql");
    const {
      results: [info],
    } = await this.$DB_$chat.query(sqlsInfo.query_chat_info_by_token, [
      chatToken,
    ]);
    if (!info) {
      return this.$error("该会话不存在！", {
        message: "no session",
      });
    }
    try {
      body = JSON.parse(info.message);
    } catch (err) {
      console.error(err);
    }
    const messages: any[] = [];
    const infoMessages: any[] = [];
    const taskQueue = [];
    const sqls = sql("./sql.sql");
    const typeMap = {
      // 获取会议信息
      m_id: async ({ value: conference_id }: any) => {
        const { results } = await this.$DB.query(sqls.conf_base_info, [
          conference_id,
        ]);
        await axios({
          baseURL: ragHost,
          url: "/api/core/dataset/collection/create/text",
          method: "post",
          headers: {
            cookie: `fastgpt_token=${fastgpt_token}`,
          },
          data: {
            datasetId,
            name: `【${get(results, `[0]['会议名称']`, "")}】会议信息`,
            text: ((data: any) => {
              let text = "";
              for (const key in data) {
                text += `${key}: ${data[key]}\n`;
              }
              return text;
            })(results[0] || {}),
          },
        });
      },
      // 快捷指令
      quick: async ({ prompt }: any) => {
        if (prompt) {
          infoMessages.push({ role: "user", content: prompt });
        }
      },
      // 助理提示词
      assistant: async ({ prompt }: any) => {
        if (prompt) {
          infoMessages.push({ role: "assistant", content: prompt });
        }
      },
      // 发送钉钉消息
      send_dingding: async ({ prompt }: any) => {
        if (prompt) {
          infoMessages.push({ role: "user", content: prompt });
        }
        taskQueue.push(async (data: any) => {
          await send_dingding({
            title: "无纸化会议AI助手",
            text: data.systemMessages || '暂无消息！',
          });
        });
      },
      // 手动上传文件
      file: async ({ label, value }: any) => {
        const buff = fs.readFileSync(path.resolve(uploadDir, value));
        const name = createUuid() + "___t___" + label;
        const form = new FormData();
        const data = {
          file: buff,
          data: JSON.stringify({
            datasetId,
            trainingType: "chunk",
          }),
        };
        for (const k in data) {
          form.append(
            k,
            data[k],
            k === "file"
              ? {
                  filename: encodeURIComponent(name),
                }
              : {}
          );
        }
        const collection = await axios({
          baseURL: ragHost,
          url: "/api/core/dataset/collection/create/localFile",
          method: "post",
          headers: {
            ...form.getHeaders(),
            cookie: `fastgpt_token=${fastgpt_token}`,
          },
          data: form,
        });
        const collectionId = collection.data.data.collectionId;
        const insertLen = collection.data.data.results.insertLen;
        let trainingAmount = 0;
        while (trainingAmount < insertLen) {
          const collectionList = await axios({
            baseURL: ragHost,
            url: "/api/core/dataset/collection/list",
            method: "post",
            headers: {
              cookie: `fastgpt_token=${fastgpt_token}`,
            },
            data: {
              datasetId,
              pageNum: 1,
              pageSize: 1,
              searchText: name,
            },
          });
          trainingAmount =
            insertLen - collectionList.data.data.data[0].trainingAmount;
          setChatResponseHead();
          this.response.write(`event: flowNodeStatus\n`);
          this.response.write(
            `data: ${JSON.stringify({
              status: "running",
              name: `训练中(进度：${(
                (trainingAmount / insertLen) *
                100
              ).toFixed(2)}%、已训:${trainingAmount}、共:${insertLen}) `,
            })}\n\n`
          );
        }
        // 文件重命名
        await axios({
          baseURL: ragHost,
          url: "/api/core/dataset/collection/update",
          method: "post",
          headers: {
            cookie: `fastgpt_token=${fastgpt_token}`,
          },
          data: {
            id: collectionId,
            name: label,
          },
        });
      },
    };
    // 先助理
    await Promise.all(
      body.tags
        .filter((e) => ["assistant"].includes(e.type))
        .map(async (item: any) => {
          return typeMap[item.type] && (await typeMap[item.type]?.(item));
        })
    );
    // 后系统
    await Promise.all(
      body.tags
        .filter((e) => !["assistant", "user"].includes(e.type))
        .map(async (item: any) => {
          return typeMap[item.type] && (await typeMap[item.type]?.(item));
        })
    );
    // 用户
    await Promise.all(
      body.tags
        .filter((e) => ["user"].includes(e.type))
        .map(async (item: any) => {
          return typeMap[item.type] && (await typeMap[item.type]?.(item));
        })
    );
    if (
      typeof body.modelValue === "string" &&
      body.modelValue.trim() &&
      body.modelValue.trim().length > 0
    ) {
      infoMessages.push({ role: "user", content: body.modelValue || "" });
    }
    messages.push(...infoMessages);
    // 执行任务队列
    const taskExec = async ()=>{
      await Promise.allSettled(
        taskQueue.map(async (task) => {
          await task({
            messages,
            systemMessages,
            info,
          });
        })
      );
    }
    if (messages.length === 0) {
      setChatResponseHead();
      if(taskQueue.length === 0){
        this.response.write("event: answer\n");
        this.response.write(
          `data: ${JSON.stringify({
            choices: [
              {
                delta: {
                  content:
                    "您还未输入任何提问，请输入问题后再提问！我将期待您的提问！",
                  role: "assistant",
                },
              },
            ],
          })}\n\n`
        );
      }else{
        this.response.write(`event: flowNodeStatus\n`);
          this.response.write(
          `data: ${JSON.stringify({
            status: "running",
            name: `执行指令中,请稍等...`,
          })}\n\n`
        );
        this.$query.append("chat_id", info.chat_id)
        systemMessages = get((await (getChatHistory as any).call(this, req, res, {
          ...chatAuthInterceptorData,
          isReturn:true
        }, ...args)).filter(e=>e.obj === 'AI').at(-1) || {},'value[0].text.content', '')
        await taskExec()
        this.response.write("event: answer\n");
        this.response.write(
          `data: ${JSON.stringify({
            choices: [
              {
                delta: {
                  content:
                    "指令执行成功",
                  role: "assistant",
                },
              },
            ],
          })}\n\n`
        );
      }
      this.response.end();
      return false;
    }
    const completionsRes = await axios({
      baseURL: ragHost,
      url: "/api/v1/chat/completions",
      method: "post",
      responseType: "stream",
      headers: {
        cookie: `fastgpt_token=${fastgpt_token}`,
      },
      data: {
        messages: messages.map((e) => ({
          ...e,
          dataId: chatToken,
        })),
        variables: {
          cTime: Date.now(),
        },
        appId,
        chatId: info.chat_id,
        detail: true,
        stream: true,
      },
    });
    let isAnswerData = false;
    setChatResponseHead();
    completionsRes.data.on("data", (e) => {
      const data = e.toString().trim();
      if (/event: answer/.test(data)) {
        isAnswerData = true;
      } else {
        if (isAnswerData) {
          try {
            systemMessages += get(
              JSON.parse(data.replace(/^\s*data:\s*/, "")),
              "choices[0].delta.content",
              ""
            );
          } catch (err) {
            //err
          }
        }
        isAnswerData = false;
      }
      this.response.write(e);
    });
    completionsRes.data.on("end", async () => {
      this.response.end();
      // 执行任务队列
      await taskExec()
    });
    return false;
  } catch (err) {
    console.error(err);
    this.$error(err.err || err.message);
  }
} as Controller;

export const pdfParse = async function () {
  try {
    const sqls = sql("./sql.sql");
    this.$success(
      (await this.$DB.query(sqls.query_file_path_by_doc_id, ["27869125914656"]))
        .results
    );
  } catch (err) {
    console.error(err);
    this.$error(err.err || err.message);
  }
} as Controller;

export const getChatToken = async function (req, res, { userInfo: {userInfo} }) {
  try {
    const sqls = sql("./chat.sql");
    const uuid = createUuid();
    const aiAssistantChatId = this.$Serialize.get(
      true,
      this.$body,
      "aiAssistantChatId"
    );
    const data = this.$Serialize.get(true, this.$body, "data");
    data.tags = data.tags.map((e: any) => {
      if (e.type === "file") {
        const fileName = `${createUuid()}${path.parse(e.label).ext}`;
        const buff = Buffer.from(
          e.value.replace(/^data:.*;base64,/, "") as any,
          "base64"
        ) as any;
        fs.writeFileSync(path.resolve(uploadDir, `./${fileName}`), buff);
        e.value = fileName;
      }
      return e;
    });
    await this.$DB_$chat.query(sqls.getChatToken, [
      aiAssistantChatId,
      uuid,
      JSON.stringify(data),
      userInfo.id,
      userInfo.default_tenant_id,
    ]);
    this.$success(uuid);
  } catch (err) {
    console.error(err);
    this.$error(err.err || err.message);
  }
} as Controller;

export const history = async function (req, res, { userInfo: {token:fastgpt_token, userInfo} }) {
  try {
    const { data } = await axios({
      baseURL: ragHost,
      url: "/api/core/chat/getHistories",
      method: "post",
      headers: {
        cookie: `fastgpt_token=${fastgpt_token}`,
      },
      data: {
        appId,
      },
    });
    const sqls = sql("./chat.sql");
    const {results} = await this.$DB_$chat.query(sqls.getHistoryByFastGPT, [
      userInfo.id,
      userInfo.default_tenant_id,
    ]);
    const chatIdMap = results.reduce((pre, cur) => {
      pre[cur.chat_id] = cur;
      return pre;
    }, {});
    this.$success(data.data.filter((e:any)=>chatIdMap[e.chatId]));
  } catch (err) {
    console.error(err);
    this.$error(err.err || err.message);
  }
} as Controller;

export const createHistory = async function () {
  try {
    const uuid = createUuid();
    this.$success(uuid);
  } catch (err) {
    console.error(err);
    this.$error(err.err || err.message);
  }
} as Controller;

export const getChatHistory = async function (
  req,
  res,
  { userInfo: {token:fastgpt_token}, isReturn }
) {
  try {
    const { data } = await axios({
      baseURL: ragHost,
      url: "/api/core/chat/init",
      method: "get",
      headers: {
        cookie: `fastgpt_token=${fastgpt_token}`,
      },
      params: {
        appId,
        chatId: this.$query.get("chat_id"),
      },
    });

    const sqls = sql("./chat.sql");
    const results = await Promise.all(
      data.data.history.map(async (e: any) => {
        if (e.obj === "System" || e.obj === "Human") {
          const {
            results: [info],
          } = await this.$DB_$chat.query(sqls.query_chat_info_by_token, [
            e.dataId,
          ]);
          if (info) {
            return {
              ...e,
              id: e.dataId,
              message: info.message,
            };
          }
        }
        return e;
      })
    )
    if(isReturn){
      return results
    }
    this.$success(results);
  } catch (err) {
    console.error(err);
    if(isReturn){
      return []
    }
    this.$error(err.err || err.message);
  }
} as Controller;
export const chat_test = async function () {
  try {
    const res: any = await ollama.chat({
      stream: true,
      model: ollamaChatModel,
      messages: [
        {
          role: "user",
          content: "你好",
        },
      ],
    });
    let data = "";
    for await (const part of res) {
      if (!part.done) {
        data += part.message.content;
      }
    }
    this.$success(data);
  } catch (err) {
    console.error(err);
    this.$error(err.err || err.message);
  }
} as Controller;

export const collectionId = async function (
  req,
  res,
  { userInfo: {token:fastgpt_token} }
) {
  const collectionId = this.$Serialize.get(true, this.$query, "collectionId");
  const { data } = await axios({
    baseURL: ragHost,
    url: "/api/core/dataset/collection/read",
    method: "get",
    headers: {
      cookie: `fastgpt_token=${fastgpt_token}`,
    },
    params: {
      appId,
      collectionId,
    },
  });
  const { data: buff, headers } = await axios({
    baseURL: ragHost,
    url: data.data.value,
    method: "get",
    responseType: "arraybuffer",
    headers: {
      cookie: `fastgpt_token=${fastgpt_token}`,
    },
    params: {
      appId,
      collectionId,
    },
  });
  this.$send(buff, {
    headers: {
      ...headers,
      "access-control-allow-origin": this.request.headers.origin || "*",
      "access-control-allow-methods": "*",
      "access-control-allow-headers": this.options.corsHeaders || "*",
    },
  } as any);
} as Controller;
