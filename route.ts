import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            controller:async function (r){
                const a = await this.$DBModel.runSql(await this.$DBModel.createSQL({
                    select:["tid", 'b.id', 'a.id as c', 'b.*'],
                    from:true,
                    gather:await this.$DBModel.tables.test2.get(true),
                    gather_alias:"a",
                    join:await this.$DBModel.createSQL({
                        gather:await this.$DBModel.tables.test3.get(true),
                        gather_alias:'b',
                    }),
                    on: {
                        'a.id':{
                            source:true,
                            value:"b.tid",
                        }
                    },
                }),"联表查询",'表 test2、test3')
                // 序列化数据
                this.$success(this.$Serialize.def(a.results,{
                    "asda":['c'],
                    "name1":['name',4545],
                    name:false,
                    "c":false,
                },/tid|id/))
            }
        }
    ]
});
