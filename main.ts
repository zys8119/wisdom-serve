import {createApp} from "@wisdom-serve/serve"
import "./global"
createApp({
    route:()=> import("./route"),
})
.listen().then();
