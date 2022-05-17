import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            method:["post", "get"],
            controller:async function (r){
                this.$success(await this.$DBModel.tables.test2.createAPI({
                    get:{
                        where:{
                            id:{value:45}
                        }
                    },
                    post:Object.fromEntries([...this.$query]),
                    delete:{
                        where:{
                            id:{
                                type:"<",
                                value:57
                            }
                        }
                    }
                }))
            }
        },
        {
            path:"/mysqlAuto",
            controller:async function(){
                this.$success()
            }
        }
    ]
});
