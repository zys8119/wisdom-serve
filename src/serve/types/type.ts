import {IncomingMessage, Server, ServerOptions, ServerResponse} from "http";
import {AppServeInterface} from "@wisdom-serve/serve";

export type Plugin = (req: IncomingMessage, res: ServerResponse, next:(arg?:any)=>Promise<any>) => Promise<any> | void

export interface AppServe extends AppServeInterface{
    Serve:Server
    options?:Partial<AppServeOptions>;
    Plugins?:Array<Plugin>;
    use(this:AppServe, plugin:Plugin):AppServe
    listen(port?: number): Promise<Server>;
    RouteOptions: RouteOptions
}

export type RouteOptions = {
    [key:string]:routeRow & RouteOptionsExtends
}

export type RouteOptionsExtends = {
    Parents?:routes
}

export interface AppServeOptions extends ServerOptions {
    serve?:{
        host?:number
        port?:number
    },
    route?:route
}

export type route = {
    routes:routes
}

export type routes = routeRow[]

export type routeRow = {
    path:string,
    controller(req: IncomingMessage, res: ServerResponse):void;
    children?:routes
}

export type createApp = (options:AppServeOptions)=>AppServe;
export type createRoute = (routerConfig:route)=>route;

declare module "@wisdom-serve/serve" {
    export const createApp:createApp
    export const createRoute:createRoute
    export interface AppServeInterface {}
}
