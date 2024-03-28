import {Controller} from "@wisdom-serve/serve"
import * as dayjs from "dayjs";
/**
 * 获取角色列表
 */
export const getRoleList:Controller = async function () {
    this.$success(this.$Serialize.getPage(
        [
            {
                results: await this.$DBModel.tables.role.get({
                    where: {
                        name: {
                            like: `%${ this.$Serialize.get(this.$query, 'search', '') }%`
                        },
                        del:{
                            value:0,
                            and:true,
                        }
                    }
                })
            }
        ],
        {
            pageNo: this.$query.get('page'),
            pageSize: this.$query.get('pageSize'),
            no_page: this.$query.get('no_page'),
            defMap: {
                status: [ d => d.status === 1 ]
            }
        }))
}

/**
 * 创建角色列表
 */
export const createRole:Controller = async function () {
    const { name, code, status } = this.$body
    if(!name) return this.$error("用户名称不能为空")
    if(!code) return this.$error("用户CODE不能为空")
    await this.$DBModel.tables.role.post({
        name,
        code,
        status: status === true ? 1 : 0,
        createTime:dayjs().format(),
        updateTime:dayjs().format(),
    })
    this.$success()
}
/**
 * 编辑角色列表
 */
export const updateRole:Controller = async function () {
    const { name, code, status, id } = this.$body
    if(!name) return this.$error("用户名称不能为空")
    if(!code) return this.$error("用户CODE不能为空")
    await this.$DBModel.tables.role.update({
        name, code, updateTime: dayjs().format(),
        status: status === true ? 1 : 0,
    },{
        where:{
            id:{value: id},
        }
    })
    this.$success()
}
/**
 * 删除角色列表
 */
export const deleteRole:Controller = async function () {
    await this.$DBModel.tables.role.update({
        del: 1,
    },{
        where:{ id:{ in: this.$body.ids} }
    })
    this.$success()
}

/**
 * 获取角色绑定人员
 */
export const getRoleUsers:Controller = async function () {
    const role_id = this.$params.role_id
    this.$success(this.$Serialize.getPage([
        await this.$DBModel.tables.role_user.get({
            select:[
                "username",
                "nickname",
                "user.id",
            ],
            where:{
                role_id:{value: role_id},
            },
            left_join:"user",
            on:"user.id = role_user.user_id",
        })
    ],{
        defMap:{
        }
    }))
}


/**
 * 更新角色用户
 */
export const updateRoleUsers:Controller = async function () {
    const {roleId, userIds} = this.$body
    if(await this.$DBModel.tables.role_user.get({
        where:{
            role_id:{value: roleId}
        }
    }, true)){
        await this.$DBModel.tables.role_user.update({
            user_id:JSON.stringify(userIds),
            updateTime :dayjs().format(),
        },{
            where:{
                role_id:{value: roleId}
            }
        })
    }else {
        await this.$DBModel.tables.role_user.post({
            user_id:JSON.stringify(userIds),
            role_id:roleId,
            createTime :dayjs().format(),
            updateTime :dayjs().format(),
        })
    }
    this.$success()
}
