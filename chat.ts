import { Controller } from "@wisdom-serve/serve"
import { DBSql } from "@wisdom-serve/core-plug/mysql"
import sql from "./sql-commit-function"
import ollama from 'ollama'
export const chat = (async function () {
    const info:any = {
        userMessage:[]
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
        async m_id({value:conference_id}:any){
            const {results} = await db.query(sqls.conf_base_info,[conference_id])
            info.conference_info = results[0] || {}
        },
        async quick({prompt}:any){
            info.userMessage.push({ role: 'user', content: prompt },)
        }
    }
    await Promise.all(this.$body.tags.map(async (item:any)=>{
        return typeMap[item.type] && await typeMap[item.type]?.(item)
    }))
    const response = await ollama.chat({
        model: 'llama3.1',
        messages: [
            { role: 'assistant', content: '你是会议助手，擅长处理会议相关问题及整理相关信息' },
            { role: 'system', content: JSON.stringify(info.conference_info) },
            ...info.userMessage,
            { role: 'user', content: this.$body.modelValue || '' },
        ],
      })
    this.$success(response.message.content) 
}) as Controller