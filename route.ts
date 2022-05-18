import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            controller:async function (r){
                const a = await this.$DBModel.runSql(await this.$DBModel.createSQL({
                    select:true,
                    from:true,
                    gather:await this.$DBModel.tables.test2.get(true),
                    gather_alias:"a",
                    left_join:await this.$DBModel.createSQL({
                        gather:await this.$DBModel.tables.test3.get(true),
                        gather_alias:'b'
                    }),
                    on: {
                        'a.id':{
                            source:true,
                            value:"b.tid"
                        }
                    },
                }))
                this.$success(a.results)
            }
        }
    ]
});
