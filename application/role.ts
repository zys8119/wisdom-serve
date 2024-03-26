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
    const { name, code, status, createTime, updateTime, id } = this.$body
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
