import {
    AppServe,
    AppServeOptions,
    Plugin,
    createApp as createAppType,
    createRoute as createRouteType, route
} from "./types/type"
import {createServer, Server} from "http"
import config from "./config"
import {mergeConfig, RouteOptionsParse} from "@wisdom-serve/utils";
import * as ncol from "ncol"
import CorePlug from "./corePlug"

export class createAppServe implements AppServe{
    options?:Partial<AppServeOptions>
    Serve
    Plugins = []
    RouteOptions = {}
    constructor(options?:Partial<AppServeOptions>) {
        this.options = mergeConfig(config, options);
        this.RouteOptions = RouteOptionsParse(this.options);
        this.Serve = createServer(async (request,response) => {
            await Promise.race(CorePlug.concat(this.Plugins).map(async pulg=>{
                if(Object.prototype.toString.call(pulg) === "[object Function]"){
                    return await pulg.call(this, request, response, (_any)=>Promise.resolve(_any))
                }else {
                    return Promise.reject("插件格式错误！")
                }
            })).then(()=> {
                console.log(333)
                console.log(request.url)
                response.statusCode = 404
                response.end("Not Found")
            }).catch((err)=> {
                ncol.error(err.message)
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

export const createRoute:createRouteType = (routerConfig:route)=>{
    return routerConfig;
}
