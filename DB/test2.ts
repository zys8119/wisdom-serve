import { DBModel} from "@wisdom-serve/core-plug/mysql";
export default <DBModel>{
    collate: "utf8_unicode_ci",
    charset:"utf8",
    columns:{
        id:{
            varchar:255,
            not_null:true,
            primary_key:true,
            comment:"asdas",
            default:'asda'
        },
        asas:{
            int:true,
            default:null
        },
        asdas:{
            varchar:10
        },
        vs:{
            text:true,
            comment:"很大的文件"
        }
    },
    commit:"测试表",
}
