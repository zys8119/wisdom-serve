import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            controller:async function (r){
                await this.$DBModel.tables.test2.createAPI({
                    update:{
                        data:{
                            vs:Date.now()
                        },
                        conditions:{
                            where:{
                                id:{
                                    type:">",
                                    value:3
                                }
                            }
                        }
                    }
                })
                this.$success()
            }
        }
    ]
});
