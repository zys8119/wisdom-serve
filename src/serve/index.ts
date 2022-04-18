import {AppServe, AppServeOptions, AppServePlugIn, createApp as createAppType} from "./types/type"
import {createServer, Server} from "http"
import config from "./config"
import {mergeConfig} from "@wisdom-serve/utils";
export {mergeConfig} from "@wisdom-serve/utils"

export class createAppServe implements AppServe{
    Serve
    constructor(public options?:Partial<AppServeOptions>) {
        this.options = mergeConfig(config, options)
        this.Serve = createServer((request,response) => {
            console.log(1111)
        });
    }

    use(plugin: AppServePlugIn): AppServe {
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

