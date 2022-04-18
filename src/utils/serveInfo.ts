import {networkInterfaces} from "os"
export default class ServeInfo{
    constructor() {
        //
    }
    static getIPv4():Array<string>{
        const network = networkInterfaces();
        return Object.keys(network).map(k=>network[k].filter(e=>e.family === "IPv4").map(e=>e.address)).toString().split(",");
    }
}
