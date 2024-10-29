import {Controller} from "@wisdom-serve/serve"
import axios from "axios"
import { createHmac, createHash } from "crypto";
import * as jquery from "jquery";
import {JSDOM} from "jsdom"
import * as FormData from "form-data"
export const zentao = async function (){
    if(this.$body.objectType !== 'bug'){
        return this.$error()
    }
    const timestamp = Date.now();
    const access_token = "6c244e66dc34b7345c8af92fb609603337575d1b1107a50b0095df403510a9d6";
    const secret = 'SEC1be17e2f00537c8755160788e7d78ba222efe5fbe0c98d3a55d2494c3a84c60a';
    const sign = createHmac('sha256', secret)
        .update(`${timestamp}\n${secret}`, "utf8")
        .digest('base64');
    try {
        const bugRes = await axios({
            url:'http://223.94.45.209:36582/zentao-login',
            method:"get",
            params:{
                account:"admin",
                password:"Zj123456@",
                host:"https://zentao.zhijiasoft.com",
                bug:this.$body.objectID,
            }
        })
        const data = {
            url:"https://oapi.dingtalk.com/robot/send",
            method:"post",
            params:{
                access_token,
                timestamp,
                sign:encodeURIComponent(sign),
            },
            data:{
                "msgtype":"markdown",
                "markdown":{
                    title:"asdas",
                    text:`#### [${bugRes.data.data.title}](${bugRes.data.data.bugUrl})\n\n> 描述：${bugRes.data.data.lastInfo.comment}\n\n 时间：${bugRes.data.data.lastInfo.time}\n\n 操作：${bugRes.data.data.lastInfo.atMessage}`
                },
                at:{
                    atMobiles:(bugRes.data.data.lastInfo.atMessage.match(/@\d+/g) || []).map(e=>e.replace(/^@/,'')),
                }
            }
        }
        const res:any = await axios(data)
        if(res.data && typeof res.data.errcode === "number" && res.data.errcode === 0){
            console.log("【钉钉消息】发送成功")
        }else {
            console.error("【钉钉消息】发送成功",res.data)
        }
    }catch(err){
        console.error("【钉钉消息】发送失败",err.message)
    }
    this.$success()
} as Controller
function computePasswordStrength(b) {
    if (b.length == 0) {
        return 0
    }
    let h = 0;
    const e = b.length;
    let c = "";
    const a = new Array<any>();
    let letter = null
    for (let i = 0; i < e; i++) {
        letter = b.charAt(i);
        const d = letter.charCodeAt();
        if (d >= 48 && d <= 57) {
            a[2] = 2
        } else {
            if ((d >= 65 && d <= 90)) {
                a[1] = 2
            } else {
                if (d >= 97 && d <= 122) {
                    a[0] = 1
                } else {
                    a[3] = 3
                }
            }
        }
        if (c.indexOf(letter) == -1) {
            c += letter
        }
    }
    if (c.length > 4) {
        h += c.length - 4
    }
    let g = 0;
    let f = 0;
    for (const i in a) {
        f += 1;
        g += a[i]
    }
    h += g + (2 * (f - 1));
    if (e < 6 && h >= 10) {
        h = 9
    }
    h = h > 29 ? 29 : h;
    h = Math.floor(h / 10);
    return h
}
function getzentaosid(headers:any){
    return headers['set-cookie'].find(e=>/zentaosid/.test(e)).replace(/zentaosid=([^;]+).*/,'$1')
}
export const zentaoLogin = async function () {
    try{
        const host = this.$query.get('host')
        const {data:text, headers} = await axios({
            url:`${host}/zentao/user-login.html`
        })
        let $ = jquery(new JSDOM(text).window) as unknown as JQueryStatic
        const md5 = (str:any)=> createHash("md5").update(str).digest("hex")
        const account          = this.$query.get('account');
        const password         = this.$query.get('password');
        const passwordStrength = computePasswordStrength(password);
        const rand        = $('input#verifyRand').val();
        const referer     = $('#referer').val();
        const keepLogin   = $('#keepLoginon').attr('checked') == 'checked' ? 1 : 0;
        const form = new FormData();
        const data = {
            "account": account, 
            "password": md5(md5(password) + rand), 
            'passwordStrength' : passwordStrength,
            'referer' : referer,
            'verifyRand' : rand,
            'keepLogin' : keepLogin,
        }
        for(const k in data){
            form.append(k, data[k])
        }
        const zentaosid = getzentaosid(headers)
        const headersData = {
            'cookie':`zentaosid=${zentaosid};`
        }
        await axios({
            url:`${host}/zentao/user-login.html`,
            method:"post",
            headers: {
                ...form.getHeaders(),
                ...headersData
            }, 
            data:form
        })
        const bugUrl = `${host}/zentao/bug-view-${this.$query.get('bug')}.html`
        const res = await axios({
            url:bugUrl,
            method:"get",
            headers:headersData
        })
        $ = jquery(new JSDOM(res.data).window) as unknown as JQueryStatic
        await axios({
            url:`${host}/zentao/user-logout.html`,
            method:'get',
            headers:headersData
        })

        const baseInfo = $('#legendBasicInfo tr').map((_,e)=>({
            label:$(e).find('th').text().split("\n").filter(e=>e.trim()).join(''),
            text:$(e).find('td').text().split("\n").filter(e=>e.trim()).join('')
        }))
        const createInfo = $('#legendLife tr').map((_,e)=>({
            label:$(e).find('th').text().split("\n").filter(e=>e.trim()).join(''),
            text:$(e).find('td').text().split("\n").filter(e=>e.trim()).join('')
        }))
        const creator = createInfo?.[0]?.text?.replace?.(/(\s*)([^\s]*)(\s*于.*)/,'$2')
        const baseInfoAssign:any = [...baseInfo].find((e:any)=> e.label === '当前指派') || {}
        baseInfoAssign.user = (baseInfoAssign.text || '').replace(/([^\s]*)?(\s*于.*)/,'$1').trim()
        baseInfoAssign.time = (baseInfoAssign.text || '').replace(/([^\s]*)?(\s*于.*)/,'$2').replace(/于\s*/,'')
        const results = {
            detail:$(".detail-content.article-content").text(),
            bug:$(".page-title .label-id").text(),
            title:$(".page-title .text").text(),
            baseInfo,
            creator,
            createInfo,
            baseInfoAssign,
            list:[],
            lastInfo:{},
            bugUrl
        }
        const atMap = [
            {
                name:"解义胜",
                phone:"13777230757",
                role:"test"
            },
            {
                name:"疏娟",
                phone:"16651108661",
                role:"test"
            },
            {
                name:"姜勋奇",
                phone:"13566864843",
                role:"app"
            },
            {
                name:"竺章强",
                phone:"18758327079",
                role:"app"
            },
            {
                name:"娄文涛",
                phone:"13486026195",
                role:"product"
            },
            {
                name:"韩璐",
                phone:"13397909087",
                role:"product"
            },
            {
                name:"朱露强",
                phone:"18306773625",
                role:"frontend"
            },
            {
                name:"李星辉",
                phone:"17393561735",
                role:"frontend"
            },
            {
                name:"张云山",
                phone:"18768527014",
                role:"frontend"
            },
            {
                name:"郭猛猛",
                phone:"15518636757",
                role:"backend"
            },
            {
                name:"李昂",
                phone:"15757821872",
                role:"backend"
            },
            {
                name:"奚萌焕",
                phone:"18758394901",
                role:"backend"
            },
            {
                name:"徐义",
                phone:"15372618221",
                role:"admin"
            },
        ]
        const test = atMap.filter((e:any)=>e.role === 'test').map(e=>`@${e.phone}`).join(" ")
        const product = atMap.filter((e:any)=>e.role === 'product').map(e=>`@${e.phone}`).join(" ")
        const app = atMap.filter((e:any)=>e.role === 'app').map(e=>`@${e.phone}`).join(" ")
        const frontend = atMap.filter((e:any)=>e.role === 'frontend').map(e=>`@${e.phone}`).join(" ")
        const backend = atMap.filter((e:any)=>e.role === 'backend').map(e=>`@${e.phone}`).join(" ")
        const currAssign = atMap.filter((e:any)=>e.name === baseInfoAssign.user).map(e=>`@${e.phone}`).join(" ")
        const currCreator = atMap.filter((e:any)=>e.name === creator).map(e=>`@${e.phone}`).join(" ")
        const atRule = [
            // {
            //     reg:/由.*(创建|激活|解决|关闭|编辑)|方案为.*(延期处理|无法重现|延期处理|不予解决)/,
            //     exec(){
            //         return test
            //     }
            // },
            {
                reg:/方案为.*(已解决|延期处理|无法重现|延期处理|不予解决)/,
                exec(){
                    return currCreator
                }
            },
            {
                reg:/由.*(创建|编辑)/,
                exec(){
                    return currAssign
                }
            },
            {
                reg:/方案为.*延期处理/,
                exec(){
                    return product
                }
            },
            // {
            //     reg(str){
            //         return /【APP/.test(results.title) &&  /由.*(创建|编辑)/.test(str)
            //     },
            //     exec(){
            //         return app
            //     }
            // },
            // {
            //     reg(str){
            //         return /【(web|h5)/.test(results.title) &&  /由.*(创建|编辑)/.test(str)
            //     },
            //     exec(){
            //         return frontend
            //     }
            // },
            // {
            //     reg(str){
            //         return /【后端/.test(results.title) &&  /由.*(创建|编辑)/.test(str)
            //     },
            //     exec(){
            //         return backend
            //     }
            // },
        ]
        const getAtMessage = (str:any)=>{
            const stt2 = str
            atMap.forEach(({name, phone})=>{
                str = str.replace(name, "@"+phone)
            })
            atRule.forEach((item:any)=>{
                const {reg, exec} = item
                if((typeof reg === 'function' &&  reg(stt2)) || (toString.call(reg) === '[object RegExp]' && reg.test(stt2))){
                    str += ` ${exec.call(item, stt2, str)}`
                }
            })
            return str.replace(/(由\s)(@)([^\s]*)?(\s)/,(_,$1)=>{
                return stt2.match(new RegExp($1+'([^\\s]*)?(\\s)'))[0]
            })
        }
        const list = [...$(".histories-list li").map((_,e)=> {
            const text = $(e).text().match(/.*?。/)?.[0] as unknown as string
            const title = (text.match(/,.*/) as any || '')?.[0].replace?.(/^,/,'').trim()
            return {
                title:title,
                time:text.match(/(\d{4}-\d{2}-\d{2})\s*\d{2}:\d{2}:\d{2}/)[0],
                comment:$(e).find(".comment-content").text(),
                atMessage:getAtMessage(title || ''),
            }
        })]
        results.list = list
        results.lastInfo = list.at(-1)
        this.$success(results)
    }catch(e){
        this.$error(e.message)
    }
    
} as Controller
