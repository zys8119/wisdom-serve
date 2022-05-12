import { DBModel, def} from "@wisdom-serve/core-plug/mysql";
export default <DBModel>{
    collate: "utf8_unicode_ci",
    character:"utf8",
    columns:{
        id:{
            varchar:2558999,
        }
    }
}


export const b = def(({ctx})=> {
    return ctx.default.collate
})

export const a = def((options,bb)=> {
    console.log(bb,889)
    return b(options)
})
