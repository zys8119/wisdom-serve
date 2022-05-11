import { DBModel} from "@wisdom-serve/core-plug/mysql";
export default <DBModel>{
    collate: "utf8_unicode_ci",
    character:"utf8",
    columns:{
        id:{
            varchar:255,
        }
    }
}

export class test implements DBModel{
    collate = "utf8_unicode_ci"
    columns:{
        id:{
            varchar:255,
        }
    }
}
