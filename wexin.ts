import {Controller} from "@wisdom-serve/serve"
import {createHash} from "crypto";
const time = 7200
/**
 * 获取微信签名
 * 签名校验工具 http://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=jsapisign
 */
const getwxSignature = (ticket, appid, url)=>{
    const config:any = {
        jsapi_ticket: ticket,
        nonceStr: createNonceStr(),
        timestamp: createTimestamp(),
        url
    };
    const string = raw(config)
    config.signature = sha1(string)
    config.appId = appid;
    return config
}

// sha1加密
const sha1 = (str)=> {
    const shasum = createHash("sha1")
    shasum.update(str)
    str = shasum.digest("hex")
    return str
}

/**
 * 生成签名的时间戳
 * @return {字符串}
 */
const createTimestamp = () =>{
    // @ts-ignore
    return parseInt(new Date().getTime() / 1000) + ''
}

/**
 * 生成签名的随机串
 * @return {字符串}
 */
const createNonceStr = () =>{
    return Math.random().toString(36).substr(2, 15)
}

/**
 * 对参数对象进行字典排序
 * @param  {对象} args 签名所需参数对象
 * @return {字符串}    排序后生成字符串
 */
const raw = (args)=>  {
    let keys = Object.keys(args)
    keys = keys.sort()
    const newArgs = {}
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key]
    })

    let string = ''
    for (const k in newArgs) {
        string += '&' + k + '=' + newArgs[k]
    }
    string = string.substr(1)
    return string
}
export default (async function (){
    const appid = ''
    const secret = ''
    if(!global.time || Date.now() - global.time > time) {
        const {data} = await this.axios({
            url:'https://api.weixin.qq.com/cgi-bin/token',
            params:{
                grant_type: 'client_credential',
                appid,
                secret
            }
        })
        global.access_token = data.access_token
        global.time = Date.now()
    }
    if(!global.time2 || Date.now() - global.time2 > time) {
        const {data} = await this.axios({
            url:'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
            params:{
                access_token: global.access_token,
                type: 'jsapi',
            }
        })
        global.ticket = data.ticket
        global.time2 = Date.now()
    }
    this.$success({
        access_token:global.access_token,
        ticket:global.ticket,
        sign:getwxSignature(global.ticket, appid,'http://localhost:5173')
    })
}) as Controller
