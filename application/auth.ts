import {Controller} from "@wisdom-serve/serve"
import * as dayjs from "dayjs"
import {createHash} from "crypto"
import {merge} from "lodash"
import {sign} from "jsonwebtoken"
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
