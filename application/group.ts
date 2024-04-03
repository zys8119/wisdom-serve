import {Controller} from "@wisdom-serve/serve"
import * as dayjs from "dayjs";
import {difference} from "lodash";
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
export const getGroupUsers:Controller = async function (){
    this.$success(this.$Serialize.getPage([
        await this.$DBModel.tables.group_bind_user.get({
            where:{
                group_id:{value:this.$params.id},
                "g.del":{value:0, and:true},
            },
            gather_alias:"as g",
            left_join:"user as u",
            on:"g.user_id=u.id",
        })
    ],{
    }))
}
export const updateUsers:Controller = async function () {
    const {groupId, userIds} = this.$body
    const res = await this.$DBModel.tables.group_bind_user.get({
        where:{
            group_id:{value: groupId},
        }
    })
    const resIds = res.map(e=>e.user_id)
    const old = userIds.filter(e=>resIds.find(ee=> ee === e))
    await this.$DBModel.tables.group_bind_user.update({
        updateTime:dayjs().format(),
        del:0,
    },{
        where:{
            group_id:{value: groupId},
            user_id:{ in: old, and:true},
        }
    })
    await this.$DBModel.tables.group_bind_user.update({
        updateTime:dayjs().format(),
        del:1,
    },{
        where:{
            group_id:{value: groupId},
            user_id:{ in: difference(resIds, userIds), and:true},
        }
    })
    await Promise.all(difference(userIds, old).map(async e=>{
        await this.$DBModel.tables.group_bind_user.post({
            user_id:e,
            group_id:groupId,
            createTime :dayjs().format(),
            updateTime :dayjs().format(),
        })
    }))
    this.$success()
}
export default group

