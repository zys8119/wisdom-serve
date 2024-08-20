import {Controller} from "@wisdom-serve/serve"
import {exec} from "child_process"
import axios from "axios"
import { createHmac, createHash } from "crypto";
import { merge } from "lodash";
import * as jquery from "jquery";
import {JSDOM} from "jsdom"
import * as FormData from "form-data"
import { title } from "process";
export default (async function (){
    const {data:info}  = await axios({url:'https://jk.mcyan.cn/index.php?url=https://v.qq.com/x/cover/mzc0020027yzd9e/g0043coq0o9.html'})
    if(info.code == 200){
        const videoUrl = info.url;
        console.log(videoUrl)
        const child = exec(`ffmpeg -i "${videoUrl}" -c copy m.mp4`);
        child.stderr.on('data', d=>{
            console.log(d.toString())
        })
        this.$success()
    }else{
        this.$error("请求失败")
    }
} as Controller)
export const zentao = async function (){
    const timestamp = Date.now();
    const access_token = "";
    const secret = '';
    const sign = createHmac('sha256', secret)
        .update(`${timestamp}\n${secret}`, "utf8")
        .digest('base64');
    try {
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
                    text:`${this.$body.text || '消息测试，请忽略 '}`
                },
                at:{
                    atMobiles:[],
                }
            }
        }
        console.log(data)
        const res = await axios(data)
        console.log(this.$body)
        console.log(res.data)
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
        function computePasswordStrength(b) {
            if (b.length == 0) {
                return 0
            }
            var h = 0;
            var e = b.length;
            var c = "";
            var a = new Array();
            let letter = null
            for (var i = 0; i < e; i++) {
                letter = b.charAt(i);
                var d = letter.charCodeAt();
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
            var g = 0;
            var f = 0;
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
        const res = await axios({
            url:`${host}/zentao/bug-view-${this.$query.get('bug')}.html`,
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
        const baseInfoAssign:any = [...baseInfo].find((e:any)=> e.label === '当前指派') || {}
        baseInfoAssign.user = (baseInfoAssign.text || '').replace(/([^\s].*)(\s*于.*)/,'$1')
        baseInfoAssign.time = (baseInfoAssign.text || '').replace(/([^\s].*)(\s*于.*)/,'$2')
        const results = {
            detail:$(".detail-content.article-content").text(),
            bug:$(".page-title .label-id").text(),
            title:$(".page-title .text").text(),
            baseInfo,
            baseInfoAssign,
            list:[],
            lastInfo:{}
        }
        const atMap = [
            {
                name:"",
                phone:"",
                role:"test"
            },
            {
                name:"",
                phone:"",
                role:"app"
            },
            {
                name:"",
                phone:"",
                role:"product"
            },
            {
                name:"",
                phone:"",
                role:"frontend"
            },
            {
                name:"",
                phone:"",
                role:"backend"
            },
        ]
        const test = atMap.filter((e:any)=>e.role === 'test').map(e=>`@${e.phone}`).join(" ")
        const product = atMap.filter((e:any)=>e.role === 'product').map(e=>`@${e.phone}`).join(" ")
        const app = atMap.filter((e:any)=>e.role === 'app').map(e=>`@${e.phone}`).join(" ")
        const frontend = atMap.filter((e:any)=>e.role === 'frontend').map(e=>`@${e.phone}`).join(" ")
        const backend = atMap.filter((e:any)=>e.role === 'backend').map(e=>`@${e.phone}`).join(" ")
        const currAssign = atMap.filter((e:any)=>e.name === baseInfoAssign.user).map(e=>`@${e.phone}`).join(" ")
        const atRule = [
            {
                reg:/由.*(创建|激活|解决|关闭)|方案为.*(延期处理|无法重现|延期处理|不予解决)/,
                exec(){
                    return test
                }
            },
            {
                reg:/由.*(创建)/,
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
            {
                reg(str){
                    return /【APP/.test(results.title) &&  /由.*创建/.test(str)
                },
                exec(){
                    return app
                }
            },
            {
                reg(str){
                    return /【(web|h5)/.test(results.title) &&  /由.*创建/.test(str)
                },
                exec(){
                    return frontend
                }
            },
            {
                reg(str){
                    return /【后端/.test(results.title) &&  /由.*创建/.test(str)
                },
                exec(){
                    return backend
                }
            },
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
