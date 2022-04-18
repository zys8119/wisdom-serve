import {AppServe, AppServeOptions, AppServePlugIn, createApp as createAppType} from "./types/type"
import {createServer} from "http"
export class createAppServe implements AppServe{
    Serve
    constructor(public options:AppServeOptions) {
        this.Serve = createServer({
        }).listen();
    }

    use(plugin: AppServePlugIn): AppServe {
        return this
    }

    listen(port?: number): Promise<void> {
        return Promise.resolve()
    }
}
export const createApp:createAppType = (options: AppServeOptions) => {
    return new createAppServe(options) as AppServe
}
