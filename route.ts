import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            method:["post", "get"],
            controller:async function (r){
                this.$success(null,{
                    headers:{
                        "Content-Type":"application/json"
                    }
                })
            }
        },
    ]
});
