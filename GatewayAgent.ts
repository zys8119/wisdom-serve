import {sm4} from "sm-crypto"
import { createProxy, createProxyServer, ServerOptions } from 'http-proxy';
/**
网关代理
*/
export default async function (req, res) {
    await new Promise<void>((r, j)=>{
        const proxy = createProxy()
        proxy.on('proxyReq', (proxyReq, req, res) => {
            // 这里处理请求数据
            if(req.method === 'POST' && this.$bodySource){
               proxyReq.write(this.$bodySource)
            }
        })
        proxy.on('proxyRes', (proxyReq, req, res) => {
            res.writeHead(proxyReq.statusCode, proxyReq.headers)
            const buff = []
            proxyReq.on('data',c=>buff.push(c))
            proxyReq.on('end',()=>{
                const data = Buffer.concat(buff).toString()
                // 这里处理代理响应拦截数据，如下拦截数据并进行sm4解密
                // if(/^\/gateway/.test(this.$url)){
                //     const key = 'sm4密钥'.split('').map((e:any)=>e.charCodeAt().toString(16).padStart(2,'0')).join('');
                //     const mode = 'cbc';
                //     const encryptionStr = JSON.parse(data)['加密关键字段']
                //     const result = JSON.parse(sm4.decrypt(encryptionStr,key,{
                //         mode:'cbc',
                //         iv:key
                //     }))
                //     console.log(JSON.stringify(result,null,4))
                // }
                res.end(data)
                r()
            })
        });
        
        req.url = this.$url.replace(/^\/替换网关路由前缀/,'')
        proxy.web(req, res,{
            target:'http://192.168.110.242',        
        } as ServerOptions, e=>{
            j()
            this.$error(e.message)
        })
    })
}
