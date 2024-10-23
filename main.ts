import {createApp} from "@wisdom-serve/serve"
import "./global"
import websocket from "./websocket"
createApp({
    route:()=> import("./route"),
    websocket
})
.listen().then();