import {Controller} from "@wisdom-serve/serve"
import {createHash} from "crypto"
import {merge, pickBy, isUndefined} from "lodash"
import * as dayjs from "dayjs";
/**
 * 获取用户菜单
 */
export const get_menus_by_user:Controller = async function () {
    this.$success(await import("./menus.json"))
}

/**
 * 获取用户列表
 */
export const getUserList:Controller = async function () {
    this.$success(await this.$Serialize.getPage(
        [
            {
                results:await this.$DBModel.tables.user.get({
                    where:{
                        username:{
                            like:`%${this.$Serialize.get(this.$query,'search','')}%`
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
        pageNo:this.$query.get('page'),
        pageSize:this.$query.get('pageSize'),
        no_page:this.$query.get('no_page'),
        defMap:{
            password:false,
            nickname:['username'],
            status:[d=>d.enable === 1]
        }
    }))
}


/**
 * 创建用户
 */
export const createUser:Controller = async function (req, res, {
    isUpdateUser,
    user
}) {
    if(!this.$body.username){
        return this.$error("用户名不能为空")
    }
    if(!isUpdateUser && !this.$body.password){
        return this.$error("密码不能为空")
    }
    if(!this.$body.nickname){
        return this.$error("昵称不能为空")
    }
    if(!this.$body.mobile){
        return this.$error("手机号不能为空")
    }
    if(!await this.$DBModel.tables.user.get({
        where:{
            username:{value:this.$body.username},
            mobile:{value:this.$body.mobile, and:true},
        }
    })){
        return this.$error("系统已存在用户，无法创建")
    }
    const data = merge({
        username:this.$body.username,
        nickname:this.$body.nickname,
        mobile:this.$body.mobile,
        email:this.$body.email || null,
        enable:this.$body.status === true ? 1 : 0,
        updateTime:dayjs().format(),
        avatar:this.$body.avatarId || null,
    },isUpdateUser ? {} : {
        createTime:dayjs().format(),
        password:createHash('md5').update(this.$body.password).digest('hex'),
    })
    if(isUpdateUser){
        await this.$DBModel.tables.user.update(pickBy(data, value => !isUndefined(value)), {
            where:{
                id:{
                    value:this.$body.id
                }
            }
        })
    }else {
        await this.$DBModel.tables.user.post(data)
    }
    this.$success()
}


/**
 * 删除用户
 */
export const deleteUser:Controller = async function () {
    if(!this.$body.ids && this.$body.ids.length === 0){
        return this.$error("用户id不能为空")
    }
    await this.$DBModel.tables.user.update({
        del:1,
    },{
        where:{
            id:{in:this.$body.ids},
        }
    })
    this.$success()
}


/**
 * 修改用户
 */
export const updateUser:Controller = async function (req, res, resultMaps) {
    await createUser.call(this,req, res, {
        ...resultMaps,
        isUpdateUser:true
    })
}
