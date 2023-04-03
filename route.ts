import {createRoute} from "@wisdom-serve/serve"
import axios from "axios"
import {launch} from "puppeteer"
export default createRoute({
    routes:[
        {
            path:"/",
            controller:async function (){
                this.$success()
            },
        }
    ]
});
