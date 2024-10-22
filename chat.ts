import { Controller } from "@wisdom-serve/serve"
import { DBSql } from "@wisdom-serve/core-plug/mysql"
import sql from "./sql-commit-function"
import ollama from 'ollama'
import { readFileSync } from 'fs'
import * as pdf from 'pdf-parse'
export const chatAuthInterceptor = (async function () {
    try {
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
    } catch (err) {
        console.error(err)
        this.$error(err.err || err.message)
    }
    
    
}) as Controller
export const chat = (async function () {
    let body = {
        tags: [],
        modelValue: ''
    }
    try {
        body = JSON.parse(decodeURIComponent(atob(this.$query.get('data'))))
    } catch (e) {
        //
    }
    const info: any = {
        userMessage: []
    }
    const sqls = sql("./sql.sql");
    const db = new DBSql(this, this.request, this.response, '242', {
        connectionLimit: 100,
        host: '192.168.110.242',
        user: 'root',
        password: 'Ul6WI12AuZomj76Kvl700-',
        port: 3306,
    })
    const typeMap = {
        // 获取会议信息
        async m_id({ value: conference_id }: any) {
            const { results } = await db.query(sqls.conf_base_info, [conference_id])
            info.conference_info = results[0] || {}
        },
        async quick({ prompt }: any) {
            info.userMessage.push({ role: 'user', content: prompt },)
        }
    }
    await Promise.all(body.tags.map(async (item: any) => {
        return typeMap[item.type] && await typeMap[item.type]?.(item)
    }))
    const response: any = await ollama.chat({
        stream: true,
        model: 'llama3.1',
        messages: [
            { role: 'assistant', content: '你是会议助手，擅长处理会议相关问题及整理相关信息' },
            { role: 'assistant', content: '你是代码助手，擅长处理代码相关的问题' },
            { role: 'system', content: '请严谨回答每个问题，尽可能的真实有效，同时请直接返回结果，不要过多的描述，可以给出代码的直接给出代码，不要给出解释' },
            { role: 'system', content: '当后续询问基本信息时请勿返回会议id，且格式以卡片形式，标题加粗，内容正常，时间格式化成“年月日时分 星期几 上下午”' },
            { role: 'system', content: '今天2024年10月11 周四' },
            { role: 'system', content: '现在时间9点25分' },
            { role: 'system', content: '当询问该会议大概内容或什么会议时，请列出会议议程，时间，主次人，参与人，及关于XXX的会议，请先列出会议标题且以卡片格式标题加粗，内容正常，时间格式化成“年月日时分 星期几 上下午' },
            { role: 'system', content: '当询问（议程、主持人、会议地点、会议时间、参会人员、会议文件）请返回对应结果，直接返回内容，不要卡片形式，多条内容请以换行形式，不要过多描述' },
            { role: 'system', content: '当询问有无、是吗问题，直接返回有或无或是或不是，不要卡片形式，不要过多描述' },
            ...(info.conference_info ? [{ role: 'system', content: JSON.stringify(info.conference_info) }] : []),
            ...info.userMessage,
            { role: 'user', content: '可以回答了' },
            { role: 'user', content: body.modelValue || '' },
        ],
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

export const history = (async function () {
    try {
        const sqls = sql("./chat.sql");
        this.$success((await this.$DB_$chat.query(sqls.query_history)).results);
    } catch (err) {
        console.error(err)
        this.$error(err.err || err.message)
    }
}) as Controller

export const createHistory = (async function (req,res,{userInfo:{uid,tid}}) {
    try {
        const sqls = sql("./chat.sql");
        this.$success((await this.$DB_$chat.query(sqls.createHistory,[uid,tid, this.$Serialize.get(true, this.$body,'title')])).results);
    } catch (err) {
        console.error(err)
        this.$error(err.err || err.message)
    }
}) as Controller