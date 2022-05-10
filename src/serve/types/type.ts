import {IncomingMessage, Server, ServerOptions, ServerResponse} from "http";
import {AppServeInterface} from "@wisdom-serve/serve";
import {HttpHeadersTypeInterface, Method} from "@wisdom-serve/serve/HttpHeaderConfig";

export type Plugin = (this:AppServe, request: IncomingMessage, response: ServerResponse, next:(arg?:any)=>Promise<any>) => Promise<any> | void

export interface AppServe extends AppServeInterface{
    Serve:Server
    options?:Partial<AppServeOptions>;
    Plugins?:Array<Plugin>;
    use(this:AppServe, plugin:Plugin):AppServe
    listen(port?: number): Promise<Server>;
    RouteOptions: RouteOptions
}

export type RouteOptions = {
    [key:string]:RouteOptionsRow
}

export type RouteOptionsRow = routeRow & RouteOptionsExtends

export type RouteOptionsExtends = {
    Parents?:routes
}

export interface AppServeOptions extends ServerOptions {
    serve?:{
        host?:number
        port?:number
        LogServeInfo?:boolean // 是否打印服务信息
    },
    route?:AppServeOptionsRoute
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

export type controller = (this:AppServe, req: IncomingMessage, res: ServerResponse) => void | Promise<any>

export type createApp = (options:AppServeOptions)=>AppServe;
export type createRoute = (routerConfig:route)=>route;

declare module "@wisdom-serve/serve" {
    export const createApp:createApp
    export const createRoute:createRoute
    export interface AppServeInterface {}
}
