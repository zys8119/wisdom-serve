import {Server, ServerOptions} from "http";

export interface AppServe {
    Serve:Server
    options?:Partial<AppServeOptions>;
    use(this:AppServe, plugin:AppServePlugIn):AppServe
    listen(port?: number): Promise<void>;
}

export type AppServePlugIn = (this:AppServe, res:any, req:any, next:()=> void)=>void

export interface AppServeOptions extends ServerOptions {
    serve?:{
        host?:number
        port?:number
    }
}

export type createApp = (options:AppServeOptions)=>AppServe;
