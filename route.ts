import {createRoute} from "@wisdom-serve/serve"
import {readFileSync} from "fs";
import {resolve} from "path";
export default createRoute({
    routes:[
        {
            path:"/",
            controller:async function (){
                this.$send(readFileSync(resolve(__dirname, './views/welcome.html')))
            },
        }
    ]
});
