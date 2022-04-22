import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            controller(){
                console.log(this.$bodyRequestFormData(), 222)
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
