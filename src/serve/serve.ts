import {
    AppServe,
    AppServeOptions,
    Plugin,
    createApp as createAppType,
    createRoute as createRouteType, route, RouteOptionsRow
} from "./types/type"
import {createServer, Server} from "http"
import {resolve} from "path"
import {watch, existsSync} from "fs"
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
        this.Serve = createServer(async (request,response) => {
            //todo 初始化路由
            this.RouteOptions = await RouteOptionsParse(this.options);
            //todo 插件执行
            try {
                await Promise.all(CorePlug.concat(this.Plugins).map(async pulg=>{
                    if(Object.prototype.toString.call(pulg) === "[object Function]"){
                        return await pulg.call(this, request, response, (_any)=>Promise.resolve(_any))
                    }else {
                        return Promise.reject("插件格式错误！")
                    }
                })).then(async ()=> {
                    const route:RouteOptionsRow = this.RouteOptions[this.$url]
                    if(route && Object.prototype.toString.call(route.controller) === "[object Function]"){
                        const Parents = route.Parents;
                        //todo 控制器执行
                        const controllerArrs = Parents.concat(route);
                        let index = 0;
                        while (index < controllerArrs.length){
                            const p_route = controllerArrs[index];
                            if(Object.prototype.toString.call(p_route.controller) === "[object Function]"){
                                try {
                                    const res: any = await p_route.controller.call(this, request, response)
                                    try {
                                        //todo 兼容懒加载
                                        const defaultController = (res && Object.prototype.toString.call(res.default) === "[object Function]" ? res.default : new Function);
                                        await defaultController.call(this, request, response)
                                    }catch (err){
                                        if(err){
                                            ncol.error(err)
                                        }
                                        response.writeHead(500,{"Content-Type": "text/plain; charset=utf-8"})
                                        response.end("服务器内部错误！")
                                        index = controllerArrs.length;
                                    }
                                }catch (err){
                                    if(err){
                                        ncol.error(err)
                                    }
                                    response.writeHead(500,{"Content-Type": "text/plain; charset=utf-8"})
                                    response.end("服务器内部错误！")
                                    index = controllerArrs.length;
                                    continue;
                                }
                            }
                            index += 1;
                        }
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
        // 文件监听，实现热更新
        watch(process.cwd(),{
            recursive:true
        }, (t,f)=>{
            const file_path = resolve(process.cwd(),f);
            if(require.cache[file_path] && existsSync(file_path)){
                delete require.cache[file_path];
            }
        })
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