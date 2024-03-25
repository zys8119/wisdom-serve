import { DBModel} from "@wisdom-serve/core-plug/mysql";
export default <DBModel>{
    collate: "utf8_unicode_ci",
    charset:"utf8",
    commit:"图形验证码表",
    columns:{
        id:{
            varchar:255,
            primary_key:true,
            comment:"验证码id",
        },
        createTime:{
            datetime:true,
            not_null:true,
            comment:"创建时间"
        },
        expireTime:{
            datetime:true,
            not_null:true,
            comment:"有效期，默认五分钟",
        },
        text:{
            varchar:6,
            not_null:true,
            comment:"验证码文字内容",
        },
        content:{
            longtext:true,
            not_null:true,
            comment:"验证码svg内容",
        }
    },
}
