import { Controller } from "@wisdom-serve/serve"
import sql from "./sql-commit-function"
import {Ollama} from 'ollama'
import { v4 as createUuid } from 'uuid'
import { createHmac } from "crypto";
import {resolve} from "path";
import axios from "axios";
import {writeFileSync, mkdirSync} from "fs-extra";
import * as pdf from "pdf-parse";
const ollamaChatModel = process.env.model || "llama3.1:8b"
const ollama = new Ollama({
    host: "http://192.168.110.46:11434",
});
export const send_dingding = async function (data:any){
    const timestamp = Date.now();
    const access_token = process.env.dingtalk_access_token;
    const secret = process.env.dingtalk_secret;
    const sign = createHmac('sha256', secret)
        .update(`${timestamp}\n${secret}`, "utf8")
        .digest('base64');
    try {
        const res = await axios({
            url:"https://oapi.dingtalk.com/robot/send",
            method:"post",
            params:{
                access_token,
                timestamp,
                sign:encodeURIComponent(sign),
            },
            data:{
                "msgtype":"markdown",
                "markdown":data,
                at:{
                    atMobiles:[],
                }
            }
        })
        if(res.data && typeof res.data.errcode === "number" && res.data.errcode === 0){
            console.log("【钉钉消息】发送成功")
        }else {
            console.error("【钉钉消息】发送成功",res.data)
        }
    }catch(err){
        console.error("【钉钉消息】发送失败",err.message)
    }
}
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
    // 查询历史聊天记录
    const chatSqls = sql("./chat.sql");
    const {results:[chatSession]} = await this.$DB_$chat.query(chatSqls.query_history_details, [info.chat_id])
    if(!chatSession){
        return this.$error("该会话不存在！",{
            message:'no session'
        })
    }
    await this.$DB_$chat.query(chatSqls.update_chat_token_status, [info.token])
    await this.$DB_$chat.query(chatSqls.createChatHistory, [createUuid(), info.chat_id, info.message, 'user'])
    const messages:any[] = []
    const taskQueue = []
    // 获取内置assistant 信息
    const {results:assistantResults} = await this.$DB_$chat.query(chatSqls.query_system_assistant, [info.chat_id])
    assistantResults.forEach(element => {
        messages.push({role:element.role || 'system', content:element.message || 0})
    });
    const {results} = await this.$DB_$chat.query(chatSqls.query_chat_history_by_chat_id, [info.chat_id])
    let rowChatInfoIndex = 0
    while(rowChatInfoIndex < results.length){
        const rowChatInfo = results[rowChatInfoIndex]
        const infoMessages:any[] = []
        let body = {
            tags: [],
            modelValue: ''
        }
        try {
            body = JSON.parse(rowChatInfo.message)
        } catch (e) {
            //
        }
        const sqls = sql("./sql.sql");
        const typeMap = {
            // 获取会议信息
            m_id:async ({ value: conference_id }: any) => {
                const { results } = await this.$DB.query(sqls.conf_base_info, [conference_id])
                infoMessages.push({role: 'system', content:JSON.stringify(results[0] || {})})
            },
            // 快捷指令
            quick:async ({ prompt }: any)=> {
                if(prompt){
                    infoMessages.push({ role: 'user', content: prompt })
                }
            },
            // 助理提示词
            assistant:async({ prompt }: any)=> {
                if(prompt){
                    infoMessages.push({ role: 'assistant', content: prompt })
                }
            },
            // 发送钉钉消息
            send_dingding:async({prompt}:any)=>{
                if(prompt){
                    infoMessages.push({ role: 'user', content: prompt })
                }
                taskQueue.push(async (data:any)=>{
                    await send_dingding({
                        title:"会议助手",
                        text:data.systemMessages
                    },)
                })
            },
            // 手动上传文件
            file:async ({label, value}:any)=>{
                const filePath = resolve(__dirname,'static/upload',Date.now()+'_'+ label)
                mkdirSync(resolve(filePath,'..'),{recursive:true})
                const buff = Buffer.from(value.replace(/^data:.*;base64,/,'') as any,'base64') as any
                if(/\.pdf$/.test(label)){
                    const text = await pdf(buff,{}).then(res=>res.text)
                    if(text){
                        infoMessages.push({ role: 'assistant', content: `你是文件分析大师，请根据用户提问分析文件内容，并给出分析结果。` })
                        infoMessages.push({ role: 'system', content: `文件标题：【${label}】` })
                        infoMessages.push({ role: 'system', content: `${label}文件内容如下：` })
                        infoMessages.push({ role: 'system', content: text })
                    }
                }
                writeFileSync(filePath, buff)
            }
        }
        if(rowChatInfo.role === 'user'){
            // 先助理
            await Promise.all(body.tags.filter(e=>['assistant'].includes(e.type)).map(async (item: any) => {
                return typeMap[item.type] && await typeMap[item.type]?.(item)
            }))
            // 后系统
            await Promise.all(body.tags.filter(e=>!['assistant','user'].includes(e.type)).map(async (item: any) => {
                return typeMap[item.type] && await typeMap[item.type]?.(item)
            }))
            // 用户
            await Promise.all(body.tags.filter(e=>['user'].includes(e.type)).map(async (item: any) => {
                return typeMap[item.type] && await typeMap[item.type]?.(item)
            }))
            infoMessages.push({role: 'user', content: body.modelValue || ''})
            messages.push(...infoMessages)
        }else if(rowChatInfo.role === 'system'){
            messages.push({role:'system', content:rowChatInfo.message})
        }else if(rowChatInfo.role === 'assistant'){
            messages.push({role:'assistant', content:rowChatInfo.message})
        }
        rowChatInfoIndex += 1
    }
    const response: any = await ollama.chat({
        stream: true,
        model: ollamaChatModel,
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
    let systemMessages = ''
    let isAdd = false
    const close = async ()=>{
        if(!isAdd){
            // 防止重复添加回答消息
            await this.$DB_$chat.query(chatSqls.createChatHistory, [createUuid(), info.chat_id, systemMessages, 'assistant'])
            // 更新历史标题
            const {results} = await this.$DB_$chat.query(chatSqls.query_chat_history_need_update, [info.chat_id])
            if(results?.[0]){
                let newTitle = ''
                const response: any = await ollama.chat({
                    stream: true,
                    model: ollamaChatModel,
                    messages:messages.concat([
                        { role: 'assistant', content: systemMessages },
                        { role: 'user', content: "以上对话请总结出一个标题，请纯文字的形式返回一句话，且不要输出markdown格式，尽可能的简洁明了，语句通顺" },
                    ]),
                })
                for await (const part of response) {
                    if (part.done) {
                        await this.$DB_$chat.query(chatSqls.update_chat_history_title, [newTitle, info.chat_id])
                    } else {
                        newTitle += part?.message?.content
                    }
                }
                return true
            }
            await Promise.allSettled(taskQueue.map(async task=>{
                await task({
                    messages,
                    systemMessages,
                    info,
                })
            }))
        }
        isAdd = true
    }
    // 终止事件发送的条件
    this.response.on('close', async () => {
        const isNeedUpdateTitle = await close()
        if(isNeedUpdateTitle){
            this.response.write(`data: ${JSON.stringify({isNeedUpdateTitle:true})}\n\n`)
        }
        this.response.end(); // 关闭响应
    });
    for await (const part of response) {
        if (part.done) {
            const isNeedUpdateTitle =  await close()
            if(isNeedUpdateTitle){
                this.response.write(`data: ${JSON.stringify({isNeedUpdateTitle:true})}\n\n`)
            }
            this.response.end(); // 关闭响应
        } else {
            systemMessages += part?.message?.content
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
        const aiAssistantChatId = this.$Serialize.get(true, this.$body,'aiAssistantChatId')
        const {results:[chatSession]} = await this.$DB_$chat.query(sqls.query_history_details, [aiAssistantChatId])
        if(!chatSession){
            return this.$error("该会话不存在！",{
                message:'no session'
            })
        }
        await this.$DB_$chat.query(sqls.getChatToken,[
            aiAssistantChatId,
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
        const title = this.$Serialize.get(true, this.$body,'title')
        await this.$DB_$chat.query(sqls.createHistory,[uuid, uid,tid, title, title])
        this.$success(uuid);
    } catch (err) {
        console.error(err)
        this.$error(err.err || err.message)
    }
}) as Controller

export const getChatHistory = (async function () {
    try {
        const sqls = sql("./chat.sql");
        const {results} = await this.$DB_$chat.query(sqls.query_chat_history_by_chat_id,[this.$Serialize.get(true, this.$query,'chat_id')])
        this.$success(results);
    } catch (err) {
        console.error(err)
        this.$error(err.err || err.message)
    }
}) as Controller
export const chat_test = (async function () {
    try {
        const res:any = await ollama.chat({
            stream: true,
            model:ollamaChatModel,
            messages:[
                {
                    role:'user',
                    content:"你好"
                }
            ]
        })
        console.log(res)
        let data = ''
        for await(const part of res){
            if(!part.done){
                data += part.message.content
            }
        }
        console.log(data)
        this.$success(data);
    } catch (err) {
        console.error(err)
        this.$error(err.err || err.message)
    }
}) as Controller