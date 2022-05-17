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
            default:0
        },
        asas:{
            int:true,
            default:null
        },
        asdas:{
            varchar:10,
            default:'aaas'
        },
        vs:{
            int:true,
            comment:"阿四"
        }
    },
    commit:"测试表阿萨",
}
