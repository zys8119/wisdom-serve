import {createRoute} from "@wisdom-serve/serve"
import {writeFileSync} from "fs"
import {resolve} from "path"
export default createRoute({
    routes:[
        {
            path:"/",
            controller:async function (r){
                this.$send(JSON.stringify({
                    a:"Asdas"
                }),{
                    headers:{
                        "Content-Type":"application/json; charset=utf-8",
                        Server:"",
                        "Access-Control-Allow-Methods":"",
                        accept:"",
                        "Access-Control-Allow-Origin":"*",
                    }
                })
            }
        },
    ]
});
