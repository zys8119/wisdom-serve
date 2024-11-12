import { DBModel} from "@wisdom-serve/core-plug/mysql";
export default <DBModel>{
    collate: "utf8_unicode_ci",
    charset:"utf8",
    columns:{
        id:{
            int:255,
            primary_key:true,
            auto_increment:true,
            comment:"表单id",
            is_uuid:true,
            not_null:true,
        },
        title:{
            varchar:255,
            comment:"表单标题",
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
    commit:"表单表",
}