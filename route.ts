import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            controller(){
                this.$send(JSON.stringify({
                    a:"Asdas"
                }),{
                    headers:{
                        "Content-Type":"application/json"
                    }
                })
            }
        },
    ]
});
