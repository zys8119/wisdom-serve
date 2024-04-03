import {Controller} from "@wisdom-serve/serve"
import * as dayjs from "dayjs";
export const group:Controller = async function (){
    this.$success(this.$Serialize.getPage([
        await this.$DBModel.tables.user_group.get({
            select:"a.*, b.name as groupTypeName",
            where:{
                "a.del":{value:0},
                "a.name":{like:`%${this.$Serialize.get(this.$query,'search','')}%`, and:true},
            },
            gather_alias:"as a",
            left_join:"user_group_type as b ",
            on:"a.type = b.id",
        })
    ],{
        defMap:{
            status:[v=>v.enable === 1],
            groupTypeId:[v=>v.type],
            asd:[console.log]
        },
        pageNo:this.$Serialize.get(this.$query,'page',1),
        pageSize:this.$Serialize.get(this.$query,'pageSize',10),
        no_page:this.$Serialize.get(this.$query,'no_page'),
    }))
}
export const create:Controller = async function (){
    await this.$DBModel.tables.user_group.post({
        name:this.$body.name,
        code:this.$body.code,
        type:this.$body.groupTypeId,
        enable:this.$body.status === true ? 1 : 0,
        createTime:dayjs().format(),
        updateTime:dayjs().format(),
    })
    this.$success()
}
export const update:Controller = async function (){
    await this.$DBModel.tables.user_group.update({
        name:this.$body.name,
        code:this.$body.code,
        enable:this.$body.status === true ? 1 : 0,
        updateTime:dayjs().format(),
    },{
        where:{
            id:{value:this.$body.id}
        }
    })
    this.$success()
}
export const deleteGroup:Controller = async function (){
    await this.$DBModel.tables.user_group.update({
        del:1
    },{
        where:{
            id:{in:this.$body.ids}
        }
    })
    this.$success()
}
export default group

