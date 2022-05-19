import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            controller:async function (){
                const pageNo = Number(this.$Serialize.get(this.$query,"pageNo", 1));
                const pageSize = Number(this.$Serialize.get(this.$query,"pageSize", 15));
                const search = String(this.$Serialize.get(this.$query,"search",''));
                const p = await this.$DBModel.createSQL({
                    from:true,
                    gather:await this.$DBModel.tables.test2.get(true),
                    gather_alias:"a",
                    left_join:await this.$DBModel.createSQL({
                        gather:await this.$DBModel.tables.test3.get(true),
                        gather_alias:'b',
                    }),
                    on: {
                        'a.id':{
                            source:true,
                            value:"b.tid",
                        },
                    },
                    where:{
                        'a.vs':{
                            like:`%${search}%`
                        }
                    }
                })
                const a = await this.$DBModel.runSql(await this.$DBModel.createSQL({
                    select:["tid", 'b.id', 'a.id as c', 'b.*', 'a.*'],
                    gather_alias:p as any,
                    limit:[(pageNo - 1)*pageSize, pageSize]
                }),"联表查询",'表 test2、test3')
                const {results:total} = await this.$DBModel.runSql(await this.$DBModel.createSQL({
                    select:["count(*) as total"],
                    gather_alias:p as any,
                }),"联表查询总数",'表 test2、test3')
                // 序列化数据
                this.$success({
                    list:a.results,
                    pageNo,
                    pageSize,
                    total:(total[0] || {}).total
                })
            },
            children:[
                {
                    path:"api/:aaa/:bbb",
                    controller:async function(req, res){
                        this.$success()
                    }
                }
            ]
        }
    ]
});
