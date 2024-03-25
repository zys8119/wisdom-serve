import {Controller} from "@wisdom-serve/serve"
import {create} from "svg-captcha"
import * as dayjs from "dayjs"
import {v1 as uuidV1} from "uuid"
export default (async function (){
    if(this.$params.id){
        const res = await this.$DBModel.tables.captcha.get({where:{
                id:{value:this.$params.id},
                expireTime:{value:dayjs().format(), type:">=",and:true},
            }})
        if(res.length === 0){
            return this.$error("验证码不存在或已过期")
        }
        return this.$send(decodeURIComponent(res[0].content), {
            headers:{
                "Content-Type":"image/svg+xml",
                "Access-Control-Allow-Origin":"*"
            }
        })
    }
    const {data, text} = create();
    const postData = {
        id:uuidV1(),
        text,
        createTime:dayjs().format(),
        expireTime:dayjs().add(5,'minutes').format(),
        content:encodeURIComponent(data),
    }
    await this.$DBModel.tables.captcha.post(postData)
    this.$success({
        imgPath:`//${this.request.headers.host}/saas/api/v1/captcha/`+postData.id,
        captchaId:postData.id,
    })
} as Controller)
