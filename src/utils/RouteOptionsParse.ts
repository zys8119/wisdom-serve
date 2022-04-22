import {AppServeOptions, AppServeOptionsRoute, RouteOptions, routes} from "@wisdom-serve/serve/types/type";
import {get} from "lodash"
import ForEach from "./ForEach"
export default async (options:Partial<AppServeOptions>)=>{
    let route:AppServeOptionsRoute = get(options,"route", {}) as AppServeOptionsRoute;
    if(Object.prototype.toString.call(route) === "[object Function]"){
        route = (route as any)();
        if(Object.prototype.toString.call(route) === "[object Promise]"){
            route = await route;
            if((route as any).default){
                route = (route as any).default
            }
        }
    }
    const routes:routes = get(route,"routes",[]);
    const result:RouteOptions = {}
    ForEach(routes, (item,i, p)=>{
        const path = p.concat([item]).map(e=>(/^\//.test(e.path) ? "" : "/")+e.path).join("");
        result[path] = item;
        result[path].Parents = p;
    })
    return result
}
