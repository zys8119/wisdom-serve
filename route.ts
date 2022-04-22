import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            controller(){
                this.$success({
                    a:"asdasasdas"
                }, null)
            }
        },
    ]
});
