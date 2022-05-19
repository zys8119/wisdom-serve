import {IncomingMessage, Server, ServerOptions, ServerResponse} from "http";
import {AppServeInterface} from "@wisdom-serve/serve";
import {HttpHeadersTypeInterface, Method} from "@wisdom-serve/serve/HttpHeaderConfig";

export type Plugin = (this:AppServe, request: IncomingMessage, response: ServerResponse, next:(arg?:any)=>Promise<any>, options?:any) => Promise<any> | void

export interface AppServe extends Partial<AppServeInterface>{
    Serve:Server
    options?:Partial<AppServeOptions>;
    originOptions?:Partial<AppServeOptions>;
    Plugins?:Array<Plugin>;
    use(this:AppServe, plugin:Plugin, options?:any):AppServe
    listen(port?: number): Promise<Server>;
    RouteOptions?: RouteOptions
    $url?: string
    $params?: { [key:string]:any }
    $route?: RouteOptionsRow
}

export type RouteOptions = {
    [key:string]:RouteOptionsRow
}

export type RouteOptionsRow = routeRow & RouteOptionsExtends

export type RouteOptionsExtends = {
    Parents?:routes,
    reg?:RegExp
    regName?:string[]
}

export interface AppServeOptions extends ServerOptions {
    serve?:{
        host?:number
        port?:number
        LogServeInfo?:boolean // 是否打印服务信息
    },
    debug?:boolean // 是否开启调试模式
    query_params?:boolean // 如果为true则解析params参数，同时暴露全局参数 $params , 注： 开启可能会有微量的性能开销
    mysqlAuto?:boolean | RegExp // 是否自动创建数据字段， 当类型为RegExp判断
    mysqlConfig?:{
        [key:string]:any
    },
    route?:AppServeOptionsRoute
    // 核心插件配置
    CorePlugConfig?:{
        [key:string]:any
    }
}

export type AppServeOptionsRoute = route | AppServeOptionsRouteLazy

export type AppServeOptionsRouteLazy = ()=>(Promise<{default:route}> | Promise<route> | route)

export type route = {
    routes:routes
}

export type routes = routeRow[]

export type routeRow = {
    path:string,
    controller?:controller;
    children?:routes
    method?:Method | Method[];
}



export type HttpHeadersType =  HttpHeadersTypeInterface

export type controller = (this:AppServe, req: IncomingMessage, res: ServerResponse, resultMaps:{[key:string]:any}) => void | Promise<any>

export type createApp = (options:AppServeOptions)=>AppServe;
export type createRoute = (routerConfig:route)=>route;

declare module "@wisdom-serve/serve" {
    export const createApp:createApp
    export const createRoute:createRoute
    export interface AppServeInterface {
    }
}
