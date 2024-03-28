import { DBModel} from "@wisdom-serve/core-plug/mysql";
export default <DBModel>{
    collate: "utf8_unicode_ci",
    charset:"utf8",
    commit:"角色人员表",
    columns:{
        id:{
            int:true,
            auto_increment:true,
            primary_key:true,
            default:0,
            comment:"id"
        },
        user_id:{
            varchar:255,
            not_null:true,
            comment:"人员id"
        },
        role_id:{
            varchar:255,
            not_null:true,
            comment:"角色id"
        },
        createTime:{
            datetime:true,
            not_null:true,
            comment:"创建时间"
        },
        updateTime:{
            datetime:true,
            comment:"更新时间"
        },
    },
}
