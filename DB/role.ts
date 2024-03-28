import { DBModel} from "@wisdom-serve/core-plug/mysql";
export default <DBModel>{
    collate: "utf8_unicode_ci",
    charset:"utf8",
    commit:"角色表",
    columns:{
        id:{
            varchar:255,
            primary_key:true,
            is_uuid:true,
            comment:"用户id",
        },
        name:{
            varchar:255,
            not_null:true,
            comment:"角色名称"
        },
        code:{
            varchar:255,
            not_null:true,
            comment:"角色code"
        },
        status:{
            int: true,
            not_null:true,
            comment:"角色状态",
            default: 0
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
        del:{
            int:true,
            not_null:true,
            default:0,
            comment:"是否删除",
        }
    },
}
