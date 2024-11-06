import { Controller } from "@wisdom-serve/serve";
import sql from "./sql-commit-function";
import { Ollama } from "ollama";
import { v4 as createUuid } from "uuid";
import { createHmac, createHash } from "crypto";
import axios from "axios";
import * as pdf from "pdf-parse";
import {get} from "lodash";
const ollamaChatModel = process.env.model || "llama3.1";
const ollama = new Ollama({
  host: process.env.api_host || "http://127.0.0.1:11434",
});
const ragHost = "http://223.94.45.209:36580";
const appId = "67297119008e9638a2540ada";
const token = "fastgpt-fHgK4Dbe1ijgh6gbE7rPKiupNVII98vpW9sXQbdx5HoLkgEcPlAbfOxejs3P6T";
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
    return Promise.resolve(token);
  } catch (err) {
    console.error(err);
    this.$error(err.err || err.message);
  }
} as Controller;
export const chat = async function (req, res, { userInfo: fastgpt_token }) {
  try {
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
        infoMessages.push({
          role: "system",
          content: JSON.stringify(results[0] || {}),
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
            text: data.systemMessages,
          });
        });
      },
      // 手动上传文件
      file: async ({ label, value }: any) => {
        // const filePath = resolve(__dirname,'static/upload',Date.now()+'_'+ label)
        // mkdirSync(resolve(filePath,'..'),{recursive:true})
        const buff = Buffer.from(
          value.replace(/^data:.*;base64,/, "") as any,
          "base64"
        ) as any;
        if (/\.pdf$/.test(label)) {
          const text = await pdf(buff, {}).then((res) => res.text);
          if (text) {
            infoMessages.push({
              role: "system",
              content: ` <Data>文件标题：【${label}】 </Data>`,
            });
            infoMessages.push({
              role: "system",
              content: `<Data>${label}文件内容如下： </Data>`,
            });
            infoMessages.push({ role: "system", content: `<Data>${text}</Data>` });
          }
        }
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
    console.log(messages);
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

    this.response.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "*",
      "access-control-allow-headers": "*",
    });
    let systemMessages = ''
    let isAnswerData = false
    completionsRes.data.on("data", (e) => {
      const data = e.toString().trim();
      if(/event: answer/.test(data)){
        isAnswerData = true
        // systemMessages = data.replace(/event: answer\n/,'').replace(/data: /,'')
      }else{
        if(isAnswerData){
          try{
            systemMessages += get(JSON.parse(data.replace(/^\s*data:\s*/,'')),'choices[0].delta.content','')
          }catch(err){
            //err
          }
        }
        isAnswerData = false
      }
      this.response.write(e);
    });
    completionsRes.data.on("end", async () => {
      this.response.end();
      await Promise.allSettled(taskQueue.map(async task=>{
          await task({
              messages,
              systemMessages,
              info,
          })
      }))
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

export const getChatToken = async function () {
  try {
    const sqls = sql("./chat.sql");
    const uuid = createUuid();
    const aiAssistantChatId = this.$Serialize.get(
      true,
      this.$body,
      "aiAssistantChatId"
    );
    await this.$DB_$chat.query(sqls.getChatToken, [
      aiAssistantChatId,
      uuid,
      JSON.stringify(this.$Serialize.get(true, this.$body, "data")),
    ]);
    this.$success(uuid);
  } catch (err) {
    console.error(err);
    this.$error(err.err || err.message);
  }
} as Controller;

export const history = async function (req, res, { userInfo: fastgpt_token }) {
  try {
    const { data, request } = await axios({
      baseURL: ragHost,
      url: "/api/core/chat/getHistories",
      method: "post",
      headers: {
        cookie: `fastgpt_token=${fastgpt_token}`,
        // Authorization
      },
      data: {
        appId,
      },
    });
    console.log(request._header)
    console.log(data);
    this.$success(data.data);
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
  { userInfo: fastgpt_token }
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
    this.$success(await Promise.all(data.data.history.map(async (e:any)=>{
      if(e.obj === 'System' || e.obj === 'Human'){
        const {
          results: [info],
        } = await this.$DB_$chat.query(sqls.query_chat_info_by_token, [
          e.dataId,
        ]);
        if(info){
          return {
            ...e,
            id:e.dataId,
            message:info.message
          }
        }
      }
      return e;
    })));
  } catch (err) {
    console.error(err);
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
    console.log(data);
    this.$success(data);
  } catch (err) {
    console.error(err);
    this.$error(err.err || err.message);
  }
} as Controller;

export const collectionId = async function (
  req,
  res,
  { userInfo: fastgpt_token }
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
