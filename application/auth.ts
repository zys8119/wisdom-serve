import {Controller} from "@wisdom-serve/serve"
import * as dayjs from "dayjs"
import {createHash} from "crypto"
import {merge} from "lodash"
import {sign, verify} from "jsonwebtoken"

/**
 * 登录
 */
export const login:Controller = async function (){
    if(!await this.$DBModel.tables.captcha.get({
        where:{
            id:{value:this.$body.captchaId},
            text:{value:this.$body.captcha, and:true},
            expireTime:{value:dayjs().format(), and:true, type:">="}
        }
    },true)){
        return this.$error("验证码错误")
    }
    await this.$DBModel.tables.captcha.delete({where:{id:{value:this.$body.captchaId}}})
    const where = {
        username:{value:this.$body.username},
        password:{value:createHash('md5').update(this.$body.password).digest("hex"), and:true},
        del:{value:1,and:true},
    }
    if(!await this.$DBModel.tables.user.get({
        where
    }, true)){
        return  this.$error("用户名或密码错误")
    }
    const user = await this.$DBModel.tables.user.get({
        where,
        select:"username,id,isAdmin"
    })
    const token = sign({...user[0]}, this.options.token.secret, {
        expiresIn: this.options.token.expiresIn
    })
    await this.$DBModel.tables.userlogin.post({
        id:user[0].id,
        token,
        createTime:dayjs().format(),
    })
    this.$success({
        accessToken:`Bearer ${token}`,
        tokenType:"bearer",
        user:user[0]
    })
}


/**
 * 登录拦截器
 */

export const interceptor:Controller = async function (req, res, resultMaps){
    // 校验登录
    const token = req.headers.authorization
    const options = {
        code:100010
    }
    if(typeof token !== "string"){
        this.$error("token不存在，请登录！", options)
        return Promise.reject("token不存在，请登录！")
    }
    if(!/^Bearer\s.*/.test(token)){
        this.$error("token格式错误，请登录！",options)
        return Promise.reject("token格式错误，请登录！")
    }
    const tokenContent = token.replace(/^Bearer\s*/,'')
    try {
        const {id} = verify(tokenContent, this.options.token.secret) as {
            id:string
        }
        const userRow = await this.$DBModel.tables.user.get({
            where:{
                id:{value:id},
                del:{value:1, and:true},
            }
        })
        if(userRow.length === 0){
            this.$error("该用户不存在！",options)
            return Promise.reject("该用户不存在！")
        }
        return Promise.resolve(userRow[0])
    }catch (e) {
        this.$error(e.message,options)
        return Promise.reject(e)
    }
}
