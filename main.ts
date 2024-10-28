import { createApp } from "@wisdom-serve/serve";
import "./global";
import websocket from "./websocket";
import "./fetch";
createApp({
  route: () => import("./route"),
  websocket,
})
.listen()
.then();