import {createApp} from "@wisdom-serve/serve"
import {ServeInfo} from "@wisdom-serve/utils"
import * as ncol from "ncol"
import {performance} from "perf_hooks"

global.__vite_start_time = performance.now()
const app = createApp({
}).use((res, req, next) => void {

});
app.listen().then(()=>{
    ncol.log("Server running at:")
    ServeInfo.getIPv4().forEach(e=>{
        let local = null;
        if(e === "127.0.0.1"){
            local = "localhost"
        }
        ncol.color(function (){
            this.log(`- ${local ? "Local  " : "Network"}:`)
                .info(` http://${local || e}:${app.options.serve.port || "80"}`)
        });
    })
    ncol.info(`ready in ${Math.ceil(performance.now() - global.__vite_start_time)}ms.`);
});
