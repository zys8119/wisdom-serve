import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            controller(){
                this.$send("asdas")
            }
        },
    ]
});
