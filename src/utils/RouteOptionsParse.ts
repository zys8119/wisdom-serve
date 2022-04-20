import {AppServeOptions, RouteOptions, routes} from "@wisdom-serve/serve/types/type";
import {get} from "lodash"
import ForEach from "./ForEach"
export default (options:Partial<AppServeOptions>)=>{
    const routes:routes = get(options,"route.routes",[]);
    const result:RouteOptions = {}
    ForEach(routes, (item,i, p)=>{
        const path = p.concat([item]).map(e=>(/^\//.test(e.path) ? "" : "/")+e.path).join("");
        result[path] = item;
        result[path].Parents = p;
    })
    return result
}
