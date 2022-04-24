import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            controller:async function (r){
                this.$success()
            }
        },
    ]
});
