import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            method:["post", "get"],
            controller:async function (r){
                console.log(this.$DBModel.tables.test2.ctx.a(12))
                this.$success()
            }
        },
    ]
});
