import {createRoute} from "@wisdom-serve/serve"
import {writeFileSync} from "fs"
import {resolve} from "path"
export default createRoute({
    routes:[
        {
            path:"/",
            controller:async function (r){
                this.$success("asdas")
            }
        },
    ]
});
