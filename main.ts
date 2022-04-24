import {createApp} from "@wisdom-serve/serve"
import "./global.ts"
createApp({
    route:()=> import("./route"),
})
.listen().then();
