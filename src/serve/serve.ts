import {
    AppServe,
    AppServeOptions,
    Plugin,
    createApp as createAppType,
    createRoute as createRouteType, route, RouteOptionsRow
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
    $url:string
    constructor(options?:Partial<AppServeOptions>) {
        this.options = mergeConfig(config, options);
        this.RouteOptions = RouteOptionsParse(this.options);
        this.Serve = createServer(async (request,response) => {
            // 插件执行
            try {
                await Promise.all(CorePlug.concat(this.Plugins).map(async pulg=>{
                    if(Object.prototype.toString.call(pulg) === "[object Function]"){
                        return await pulg.call(this, request, response, (_any)=>Promise.resolve(_any))
                    }else {
                        return Promise.reject("插件格式错误！")
                    }
                })).then(async ()=> {
                    if(this.RouteOptions[this.$url]){
                        const route:RouteOptionsRow = this.RouteOptions[this.$url]
                        const Parents = route.Parents;
                        // 控制器执行
                        await Promise.all(Parents.concat(route).map(p_route=>{
                            if(Object.prototype.toString.call(p_route.controller) === "[object Function]"){
                                return new Promise<void>( (resolve, reject) => {
                                    const controllerRes = p_route.controller.call(this, request, response);
                                    if(Object.prototype.toString.call(controllerRes) === "[object Promise]"){
                                        controllerRes.then(res=>{
                                            resolve(res)
                                        }).catch(err=>{
                                            reject(err)
                                        })
                                    }else {
                                        resolve(controllerRes)
                                    }
                                });
                            }else {
                                response.writeHead(500,{"Content-Type": "text/plain; charset=utf-8"})
                                response.end("控制器格式错误！")
                            }
                        })).catch((err)=>{
                            ncol.error(err)
                            response.writeHead(500,{"Content-Type": "text/plain; charset=utf-8"})
                            response.end("服务器内部错误！")
                        })
                    }else {
                        response.writeHead(500,{"Content-Type": "text/plain; charset=utf-8"})
                        response.end("控制器不存在！")
                    }
                }).catch((err)=> {
                    //todo 插件执行错误
                    ncol.error(err)
                    response.writeHead(404)
                    response.end("Not Found")
                })
            }catch (err){
                //todo 插件执行错误
                ncol.error(err)
                response.writeHead(404)
                response.end("Not Found")
            }
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
