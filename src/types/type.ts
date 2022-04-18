import {Server} from "http";
import {ListenOptions} from "net";

export interface AppServe {
    Serve:Server
    options:AppServeOptions;
    use(this:AppServe, plugin:AppServePlugIn):AppServe
    listen(port?: number): Promise<void>;
}

export type AppServePlugIn = (this:AppServe, res:any, req:any, next:()=> void)=>void

export interface AppServeOptions {

}

export type createApp = (options:AppServeOptions)=>AppServe;
