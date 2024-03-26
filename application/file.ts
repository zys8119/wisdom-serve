import {Controller} from "@wisdom-serve/serve"
export const upload:Controller = async function (){
    console.log(this.$body.file)
    this.$success({
        id:Date.now()
    })
}
