import {createApp} from "@wisdom-serve/serve"
import {ServeInfo} from "@wisdom-serve/utils"
import * as ncol from "ncol"
import {spawnSync} from "child_process"

console.log(spawnSync("node console.time()"))
console.time()
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
    console.log(console.timeEnd());
});
