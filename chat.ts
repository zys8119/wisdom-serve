import { Controller } from "@wisdom-serve/serve"
import { DBSql } from "@wisdom-serve/core-plug/mysql"
import sql from "./sql-commit-function"
import ollama from 'ollama'
import { v4 as createUuid } from 'uuid'
export const chatAuthInterceptor = (async function () {
    try {
        if(this.$url === '/api/v1/chat'){
            const chatToken  = this.$Serialize.get(true, this.$query, 't')
            const sqls = sql("./chat.sql");
            const {results:[info]} = await this.$DB_$chat.query(sqls.query_chat_info_by_token, [chatToken])
            if(!info){
                this.$error('Unauthorized')
                return Promise.reject("Unauthorized")
            }
            return Promise.resolve(info)
        }else{
            const sqls = sql("./sql.sql");
            const {
                headers: {
                    authorization
                }
            } = this.request
            
            if (!authorization) {
                this.$error('Unauthorized')
                return Promise.reject("Unauthorized")
            }
            const userInfo = (await this.$DB.query(sqls.query_user_info_by_token, [authorization])).results?.[0]
            if (!userInfo) {
                this.$error('Unauthorized')
                return Promise.reject("Unauthorized")
            }
            return Promise.resolve(userInfo)
        }
    } catch (err) {
        console.error(err)
        this.$error(err.err || err.message)
    }
    
    
}) as Controller
export const chat = (async function (req, res, {userInfo:info}) {
    let body = {
        tags: [],
        modelValue: ''
    }
    try {
        body = JSON.parse(info.message)
    } catch (e) {
        //
    }
    // 查询历史聊天记录
    const chatSqls = sql("./chat.sql");
    const chatHistoryId = createUuid()
    await this.$DB_$chat.query(chatSqls.update_chat_token_status, [info.token])
    await this.$DB_$chat.query(chatSqls.createChatHistory, [chatHistoryId, info.chat_id, info.message, 'user'])
    const {results} = await this.$DB_$chat.query(chatSqls.query_chat_history_by_chat_id, [info.chat_id])
    const messages = results
    console.log(messages)
    // const info: any = {
    //     userMessage: []
    // }
    // const sqls = sql("./sql.sql");
    // const typeMap = {
    //     // 获取会议信息
    //     async m_id({ value: conference_id }: any) {
    //         const { results } = await this.$DB.query(sqls.conf_base_info, [conference_id])
    //         info.conference_info = results[0] || {}
    //     },
    //     async quick({ prompt }: any) {
    //         info.userMessage.push({ role: 'user', content: prompt },)
    //     }
    // }
    // await Promise.all(body.tags.map(async (item: any) => {
    //     return typeMap[item.type] && await typeMap[item.type]?.(item)
    // }))
    const response: any = await ollama.chat({
        stream: true,
        model: 'llama3.1',
        messages,
    })
    this.response.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "*",
        "access-control-allow-headers": "*",
    });

    // 终止事件发送的条件
    this.response.on('close', () => {
        this.response.end(); // 关闭响应
    });
    for await (const part of response) {
        if (part.done) {
            this.response.end(); // 关闭响应
        } else {
            this.response.write(`data: ${JSON.stringify(part)}\n\n`)
        }
    }
}) as Controller

export const pdfParse = (async function () {
    try {
        const sqls = sql("./sql.sql");
        this.$success((await this.$DB.query(sqls.query_file_path_by_doc_id,['27869125914656'])).results);
    } catch (err) {
        console.error(err)
        this.$error(err.err || err.message)
    }
}) as Controller

export const getChatToken = (async function (req,res,{userInfo:{uid,tid}}) {
    try {
        const sqls = sql("./chat.sql");
        const uuid = createUuid()
        await this.$DB_$chat.query(sqls.getChatToken,[
            this.$Serialize.get(true, this.$body,'aiAssistantChatId'),
            uuid,
            JSON.stringify(this.$Serialize.get(true, this.$body,'data')),
        ])
        this.$success(uuid);
    } catch (err) {
        console.error(err)
        this.$error(err.err || err.message)
    }
}) as Controller

export const history = (async function (req,res,{userInfo:{uid,tid}}) {
    try {
        const sqls = sql("./chat.sql");
        this.$success((await this.$DB_$chat.query(sqls.query_history,[uid,tid])).results);
    } catch (err) {
        console.error(err)
        this.$error(err.err || err.message)
    }
}) as Controller

export const createHistory = (async function (req,res,{userInfo:{uid,tid}}) {
    try {
        const uuid = createUuid()
        const sqls = sql("./chat.sql");
        await this.$DB_$chat.query(sqls.createHistory,[uuid, uid,tid, this.$Serialize.get(true, this.$body,'title')])
        this.$success(uuid);
    } catch (err) {
        console.error(err)
        this.$error(err.err || err.message)
    }
}) as Controller