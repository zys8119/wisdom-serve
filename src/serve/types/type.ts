import {IncomingMessage, Server, ServerOptions, ServerResponse} from "http";
import {AppServeInterface} from "@wisdom-serve/serve";

export type Plugin = (req: IncomingMessage, res: ServerResponse, next:(arg?:any)=>Promise<any>) => Promise<any> | void

export interface AppServe extends AppServeInterface{
    Serve:Server
    options?:Partial<AppServeOptions>;
    Plugins?:Array<Plugin>;
    use(this:AppServe, plugin:Plugin):AppServe
    listen(port?: number): Promise<Server>;
}

export interface AppServeOptions extends ServerOptions {
    serve?:{
        host?:number
        port?:number
    }
}

export type createApp = (options:AppServeOptions)=>AppServe;

declare module "@wisdom-serve/serve" {
    export const createApp:createApp
    export interface AppServeInterface {}
}
