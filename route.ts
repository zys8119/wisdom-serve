import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            method:["post", "get"],
            controller:async function (r){
                console.log(await this.$DBModel.tables.test2.post({
                    asas:122,
                    vs:21
                }))
                this.$success()
            }
        },
    ]
});
