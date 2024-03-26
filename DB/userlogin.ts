import { DBModel} from "@wisdom-serve/core-plug/mysql";
export default <DBModel>{
    collate: "utf8_unicode_ci",
    charset:"utf8",
    commit:"用户登录表",
    columns:{
        id:{
            varchar:255,
            primary_key:true,
            comment:"用户id",
        },
        token:{
            longtext:true,
            not_null:true,
            comment:"用户token"
        },
        createTime:{
            datetime:true,
            not_null:true,
            comment:"创建时间"
        },
    },
}
