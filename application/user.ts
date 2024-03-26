import {Controller} from "@wisdom-serve/serve"
import {createHash} from "crypto"
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
                            value:1,
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
export const createUser:Controller = async function () {
    if(!this.$body.username){
        return this.$error("用户名不能为空")
    }
    if(!this.$body.password){
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
    console.log(this.$body)
    await this.$DBModel.tables.user.post({
        username:this.$body.username,
        password:createHash('md5').update(this.$body.password).digest('hex'),
        nickname:this.$body.nickname,
        mobile:this.$body.mobile,
        email:this.$body.email,
        enable:this.$body.status === true ? 1 : 0,
        createTime:dayjs().format(),
        updateTime:dayjs().format(),
        avatar:null,
    })
    this.$success()
}
