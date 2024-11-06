import { Controller } from "@wisdom-serve/serve";
import sql from "./sql-commit-function";
import { Ollama } from "ollama";
import { v4 as createUuid } from "uuid";
import { createHmac, createHash } from "crypto";
import axios from "axios";
const ollamaChatModel = process.env.model || "llama3.1";
const ollama = new Ollama({
  host: process.env.api_host || "http://127.0.0.1:11434",
});
const ragHost = "http://223.94.45.209:36580";
const appId = "67297119008e9638a2540ada";
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
    const sqls = sql("./chat.sql");
    const {
        results: [info],
      } = await this.$DB_$chat.query(sqls.query_chat_info_by_token, [
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
    const completionsRes = await axios({
      baseURL: ragHost,
      url: "/api/v1/chat/completions",
      method: "post",
      responseType: "stream",
      headers: {
        cookie: `fastgpt_token=${fastgpt_token}`,
      },
      data: {
        messages: [
          {
            dataId: "hLSkfX6IgO6SYKnnUqYxr84o",
            role: "user",
            content: body.modelValue,
          },
        ],
        variables: {
          cTime: "2024-11-05 10:59:00 Tuesday",
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
    completionsRes.data.on("data", (e) => {
      this.response.write(e);
    });
    completionsRes.data.on("end", () => {
      this.response.end();
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
    const {data} = await axios({
      baseURL: ragHost,
      url: "/api/core/chat/getHistories",
      method: "post",
      headers: {
        cookie: `fastgpt_token=${fastgpt_token}`,
      },
      data:{
        appId
      }
    });
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

export const getChatHistory = async function (req, res, { userInfo: fastgpt_token }) {
  try {
    const {data} =await axios({
      baseURL: ragHost,
      url: "/api/core/chat/init",
      method: "get",
      headers: {
        cookie: `fastgpt_token=${fastgpt_token}`,
      },
      params:{
        appId,
        chatId: this.$query.get("chat_id"),
      }
    })
    this.$success(data.data.history);
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
