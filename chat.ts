import { Controller } from "@wisdom-serve/serve"
import { DBSql } from "@wisdom-serve/core-plug/mysql"
import sql from "./sql-commit-function"
import ollama from 'ollama'
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
    const sqls = sql("./sql.sql")
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
            { role: 'system', content: '接下来我将给出我所有的问题，请先展示不要作出任何回答，等我说“可以回答了”你再回答' },
            ...(info.conference_info ? [{ role: 'system', content: JSON.stringify(info.conference_info) }] :[]),
            ...info.userMessage,
            { role: 'user', content: body.modelValue || '' },
            { role: 'user', content: '可以回答了' },
        ],
    })
    this.response.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    // 终止事件发送的条件
    this.response.on('close', () => {
        this.response.end(); // 关闭响应
    });
    for await (const part of response) {
        if(part.done){
            this.response.end(); // 关闭响应
        }else{
            this.response.write(`data: ${JSON.stringify(part)}\n\n`)
        }
    }
}) as Controller