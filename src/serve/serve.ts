import {AppServe, AppServeOptions, Plugin, createApp as createAppType} from "./types/type"
import {createServer, Server} from "http"
import config from "./config"
import {mergeConfig} from "@wisdom-serve/utils";
export {mergeConfig} from "@wisdom-serve/utils"
export class createAppServe implements AppServe{
    options?:Partial<AppServeOptions>
    Serve
    Plugins = []
    constructor(options?:Partial<AppServeOptions>) {
        this.options = mergeConfig(config, options)
        this.Serve = createServer(async (request,response) => {
            delete require.cache
            await Promise.race(this.Plugins.map(async pulg=>{
                if(Object.prototype.toString.call(pulg) === "[object Function]"){
                    return await pulg.call(this, request, response, Promise.resolve)
                }else {
                    return Promise.reject("插件格式错误！")
                }
            })).then(()=> {
                response.statusCode = 404
                response.end("Not Found")
            }).catch(()=> {
                response.statusCode = 404
                response.end("Not Found")
            })
        });
    }

    use(plugin: Plugin): AppServe {
        this.Plugins.push(plugin)
        return this
    }

    listen(port?: number): Promise<Server> {
        this.Serve.listen({
            host:this.options.serve.host,
            port:this.options.serve.port,
        })
        return Promise.resolve(this.Serve)
    }
}

export const createApp:createAppType = (options?:Partial<AppServeOptions>) => {
    return new createAppServe(options) as AppServe
}
