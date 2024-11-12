import { DBModel} from "@wisdom-serve/core-plug/mysql";
export default <DBModel>{
    collate: "utf8_unicode_ci",
    charset:"utf8",
    columns:{
        id:{
            int:255,
            primary_key:true,
            auto_increment:true,
            comment:"asdas",
            is_uuid:true,
        },
        title:{
            varchar:255,
            comment:"表单标题"
        },
        create_time:{
            datetime:true,
            comment:"创建时间",
            is_datetime:true,
        },
        update_time:{
            datetime:true,
            comment:"更新时间",
            is_datetime:true,
        }
    },
    commit:"测试表阿萨",
}