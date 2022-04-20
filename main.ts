import {createApp} from "@wisdom-serve/serve"
import {ServeInfo} from "@wisdom-serve/utils"
import * as ncol from "ncol"
import {performance} from "perf_hooks"
import "./global"
global.__vite_start_time = performance.now()
const app = createApp({
    route:()=> import("./route"),
})
app.listen().then(()=>{
    ncol.log("Server running at:")
    ServeInfo.ouinputAddress(app.options.serve.port)
    ncol.info(`ready in ${Math.ceil(performance.now() - global.__vite_start_time)}ms.`);
});
// 5599asda
