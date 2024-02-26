import {createApp} from "@wisdom-serve/serve"
import "./global.ts"
import websocket from "./websocket"
import {execSync} from "child_process"
createApp({
    route:()=> import("./route"),
    websocket
})
.listen().then();

console.log(execSync('lsof -i:81').toString())
