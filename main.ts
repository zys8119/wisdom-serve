import { createApp } from "@wisdom-serve/serve";
import "./global";
import websocket from "./websocket";
const xhr2 = require("xhr2");
globalThis.XMLHttpRequest = xhr2;
createApp({
  route: () => import("./route"),
  websocket,
})
  .listen()
  .then();