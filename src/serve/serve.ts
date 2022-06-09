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
import {mergeConfig, RouteOptionsParse, ServeInfo} from "@wisdom-serve/utils";
import * as ncol from "ncol"
import CorePlug from "@wisdom-serve/core-plug"
import {performance} from "perf_hooks"
import {get} from "lodash"

const errorEmit = (response, code:number, message:any)=>{
    try {
        if(!response.finished){
            response.writeHead(code,{"Content-Type": "text/plain; charset=utf-8"})
            response.end("资源不存在！")
        }
    }catch (e){
        ncol.error(e)
    }
    try {
        throw Error(message)
    }catch (e) {
        ncol.error(e)
    }
}

global.__vite_start_time = performance.now()
export class createAppServe implements AppServe{
    options?:Partial<AppServeOptions>
    originOptions?:Partial<AppServeOptions>
    Serve
    Plugins = []
    RouteOptions = {}
    $url:string
    $params = {}
    $route
    constructor(options?:Partial<AppServeOptions>) {
        this.originOptions = options;
        this.hotConfig(true)
        //todo 核心插件注入
        this.Plugins = this.Plugins.concat(CorePlug.map((pulg:Plugin)=>({
            plugin:pulg,
            options:get(this.options,"CorePlugConfig",{})[pulg.name]
        })))
        this.Serve = createServer(async (request,response) => {
            try {
                if(this.options.debug){
                    ncol.color(function (){
                        this.warnBG("【请求】")
                            .warn("==========")
                            .warn(request.url)
                    })
                }
                const types = ["[object Function]", "[object AsyncFunction]"]
                //todo 初始化路由
                this.RouteOptions = await RouteOptionsParse(this.options)
                //todo 插件执行
                let index = 0;
                let isErr = false
                while (index < this.Plugins.length){
                    try {
                        const {plugin, options} = this.Plugins[index];
                        if(types.includes(Object.prototype.toString.call(plugin))){
                            await plugin.call(this, request, response, (_any)=>Promise.resolve(_any), options)
                        }else {
                            throw Error("插件格式错误！")
                        }
                    }catch (err) {
                        //todo 插件执行错误
                        if(err !== false){
                            ncol.error(err)
                            errorEmit(response, 404, "Not Found")
                        }
                        isErr = true
                        break
                    }
                    index +=1 ;
                }
                if(isErr) return

                //todo 路由解析
                let route:RouteOptionsRow = this.RouteOptions[this.$url]
                if(!!this.options.query_params && !route){
                    route = Object.values(this.RouteOptions).find((e:any)=>e.reg && e.reg.test(this.$url)) as any
                    if(route && route.regName.length > 0){
                        const params = {};
                        const paramsMatch = this.$url.match(route.reg)
                        if(paramsMatch){
                            route.regName.forEach((n, k)=>{
                                params[n] = paramsMatch[k+1]
                            })
                        }
                        this.$params = params;
                    }
                }


                if(route && types.includes(Object.prototype.toString.call(route.controller))){
                    this.$route = route;
                    const Parents = route.Parents;
                    //todo 控制器执行
                    const controllerArrs = Parents.concat([route]);
                    const resultMap = {}
                    let index = 0;
                    while (index < controllerArrs.length){
                        const p_route = controllerArrs[index];
                        //todo 判断请求方式
                        const method:any = Object.prototype.toString.call(p_route.method) === '[object String]' ? [p_route.method] :
                            Object.prototype.toString.call(p_route.method) === '[object Array]' ? p_route.method : [];
                        const isValidMethod = method.length > 0 ? method.map(m=>(m as string).toLowerCase()).indexOf(request.method.toLowerCase()) > -1 : true;
                        if(!isValidMethod){
                            errorEmit(response, 500, `请求失败，不支持${request.method}请求！`)
                            index = controllerArrs.length;
                            break;
                        }
                        //todo 判断请求方式=====end

                        //todo 控制器兼容执行
                        if(types.includes(Object.prototype.toString.call(p_route.controller))){
                            try {
                                let result: any = await p_route.controller.call(this, request, response, resultMap)
                                try {
                                    //todo 兼容懒加载
                                    const defaultController = (result && Object.prototype.toString.call(result.default) === "[object Function]" ? result.default : new Function);
                                    const awaitResult = await defaultController.call(this, request, response, resultMap)
                                    if(awaitResult){
                                        result = awaitResult;
                                    }
                                }catch (err){
                                    if(err){
                                        ncol.error(err)
                                    }
                                    errorEmit(response, 500, "控制器内部同步错误")
                                    index = controllerArrs.length;
                                    break;
                                }
                                resultMap[p_route.name || p_route.path] = result
                            }catch (err){
                                if(err){
                                    ncol.error(err)
                                }
                                errorEmit(response, 500, "控制器内部错误！")
                                index = controllerArrs.length;
                                continue;
                            }
                        }
                        index += 1;
                    }
                }else {
                    errorEmit(response, 500, "控制器不存在！")
                }
            }catch (err){
                //todo 插件执行错误
                ncol.error(err)
                errorEmit(response, 404, "Not Found")
            }
        });
    }

    use(plugin: Plugin, options?:any): AppServe {
        this.Plugins.push({
            plugin,
            options,
        })
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
            this.hotConfig(file_path)
        })
        const listenPort = typeof port === "number" ? port : this.options.serve.port;
        this.options.serve.port = listenPort;
        this.Serve.listen({
            host:this.options.serve.host,
            port:listenPort,
        })
        if(this.options.serve.LogServeInfo){
            ncol.log("Server running at:")
            ServeInfo.ouinputAddress(listenPort)
            ncol.info(`ready in ${Math.ceil(performance.now() - global.__vite_start_time)}ms.`);
        }
        return Promise.resolve(this.Serve)
    }

    /**
     * todo 配置文件热更新
     * @param file_path
     * @private
     */
    private hotConfig(file_path:string|boolean){
        const config = [
            // 系统内置配置
            resolve(__dirname,'..','serve/config/index.ts'),
            // 用户业务配置
            resolve(process.cwd(),'wisdom.serve.config.ts'),
        ]
        if(typeof file_path === 'boolean' || config.includes(file_path)){
            const hotNewConfig:any = config.map(e=>{
                try {
                    return (require(e) as any).default
                }catch (e){
                    // ad
                    return  null
                }
            }).filter(e=>e).concat(this.originOptions)
            try {
                // eslint-disable-next-line prefer-spread
                this.options = mergeConfig.apply(null, hotNewConfig)
            }catch (e){
                //
            }
        }
    }
}

export const createApp:createAppType = (options?:Partial<AppServeOptions>) => {
    return new createAppServe(options) as AppServe
}

export const createRoute:createRouteType = (routerConfig:route)=>{
    return routerConfig;
}
