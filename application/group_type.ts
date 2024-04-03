import {Controller} from "@wisdom-serve/serve"
import * as dayjs from "dayjs";
export const group_type:Controller = async function (){
    this.$success(this.$Serialize.getPage([
        await this.$DBModel.tables.user_group_type.get({
            where:{
                del:{value:0},
                name:{like:`%${this.$Serialize.get(this.$query,'search','')}%`, and:true},
            }
        })
    ],{
        defMap:{
            status:[v=>v.enable === 1]
        },
        pageNo:this.$Serialize.get(this.$query,'page',1),
        pageSize:this.$Serialize.get(this.$query,'pageSize',10),
        no_page:this.$Serialize.get(this.$query,'no_page'),
    }))
}
export const create:Controller = async function (){
    await this.$DBModel.tables.user_group_type.post({
        name:this.$body.name,
        code:this.$body.code,
        enable:this.$body.status === true ? 1 : 0,
        createTime:dayjs().format(),
        updateTime:dayjs().format(),
    })
    this.$success()
}
export const update:Controller = async function (){
    await this.$DBModel.tables.user_group_type.update({
        name:this.$body.name,
        code:this.$body.code,
        enable:this.$body.status === true ? 1 : 0,
        createTime:dayjs().format(),
        updateTime:dayjs().format(),
    },{
        where:{
            id:{value:this.$body.id}
        }
    })
    this.$success()
}
export const deleteGrouptype:Controller = async function (){
    await this.$DBModel.tables.user_group_type.update({
        del:1
    },{
        where:{
            id:{in:this.$body.ids}
        }
    })
    this.$success()
}
export default group_type

