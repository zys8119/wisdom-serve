import {Plugin} from "@wisdom-serve/serve/types/type"
const helperFun:Plugin = function (request, response, next){
    this.$success = (data, options = {})=>{
        switch (Object.prototype.toString.call(options)){
            case "[object Object]":
                break;
            case "[object Number]":
                options = {
                    code:options as number
                }
                break;
            case "[object String]":
                options = {
                    message:options as string
                }
                break;
            default:
                throw Error("options 数据格式错误")
                break
        }
        response.writeHead((options as any).statusCode || 200,{
            "Content-Type":"text/json; charset=utf-8",
        })
        response.end(JSON.stringify({
            code:200,
            data,
            message:"请求成功",
            ...options as any,
        }))
    }
    return next()
}
export default helperFun

declare module "@wisdom-serve/serve" {
    interface AppServeInterface {
        $success?(data:any, options?:Partial<{
            data:any
            code:number
            message:string
            statusCode:number
        }> | string):void
    }
}
