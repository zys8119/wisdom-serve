import {PluginUse} from "@wisdom-serve/serve"
import {launch} from "puppeteer"
const _launch = launch({
    // headless:false,
    // devtools:true
})
const szrd:PluginUse = async function (request, response){
    const reg = /\/szrd\/(.*)/
    const host = 'https://你的域名/'
    if(reg.test(request.url)){
        const m = reg.exec(request.url)
        const browser =  await _launch
        const page = await browser.newPage()
        await page.goto(host)
        const config = {
            url:`${host}/${m[1]}`,
            method:request.method,
            headers:request.headers as any,
            body:Object.prototype.toString.call(this.$body) === '[object Object]' ? JSON.stringify(this.$body) : (this.$body || null)
        } as RequestInfo
        console.log(config)
        const res = await page.evaluateHandle(async (config:any)=>{
            console.log(config)
            return fetch(config.url, config as any).then(res=>res.json())
        }, config).then(res=>res.jsonValue())
        console.log(res)
        await page.close()
        this.$send(Buffer.from(JSON.stringify(res)), {
            headers:{
                "Content-Type":"application/json; charset=utf-8",
                "access-control-allow-origin":request.headers.origin || "*",
                "access-control-allow-methods":"*",
                "access-control-allow-headers":this.options.corsHeaders || "*",
            }
        })
        return Promise.reject(false)
    }
    return Promise.resolve()
}
export default szrd
