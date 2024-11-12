import { DBModel} from "@wisdom-serve/core-plug/mysql";
export default <DBModel>{
    collate: "utf8_unicode_ci",
    charset:"utf8",
    columns:{
        id:{
            int:255,
            primary_key:true,
            auto_increment:true,
            comment:"表单配置表id",
            is_uuid:true,
            not_null:true,
        },
        df_id:{
            varchar:255,
            comment:"关联的表单id",
            not_null:true,
        },
        config:{
            longtext:true,
            comment:"表单配置",
            not_null:true,
        },
        create_time:{
            datetime:true,
            comment:"创建时间",
            is_datetime:true,
            not_null:true,
        },
        update_time:{
            datetime:true,
            comment:"更新时间",
            is_datetime:true,
        },
        status:{
            int:255,
            comment:"状态:1正常,0删除",
            default:1,
            not_null:true,
        }
    },
    commit:"测试表配置表",
}