import {PluginUse,HttpHeaders} from "@wisdom-serve/serve"
const corsPlugin:PluginUse = function (request, response){
    if(request.headers.referer &&!/localhost|192\.168\./.test(request.headers.referer)){
        return Promise.reject("不允许不安全的请求来源：跨域了！")
    }
    response.setHeader("access-control-allow-methods" as keyof HttpHeaders as string, "*")
    response.setHeader("access-control-allow-headers" as keyof HttpHeaders as string, "content-type")
    response.setHeader("access-control-allow-origin" as keyof HttpHeaders as string, request.headers.origin || "*")
    response.setHeader("access-control-allow-credentials" as keyof HttpHeaders as string, true as any)
    if(request.method.toLowerCase() === 'options'){
        response.end()
        return Promise.reject(false)
    }

    return Promise.resolve()
}
export default corsPlugin
