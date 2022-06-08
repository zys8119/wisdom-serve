import {Websocket} from "@wisdom-serve/serve/types/type";

export default <Partial<Websocket>>{
    login({payload, key}){
        console.log("登陆成功：",payload)
        this.$socketList[key].payload = payload;
    },
    uploadFile({payload}){
        const webview = Object.values(this.$socketList).find((e)=>{
            return e.payload.webview_id === payload.id
        })
        if(webview){
            console.log(payload, webview.payload)
            this.$socketSend(JSON.stringify(payload),[webview.key])
        }
    },
    uploadFileSelect({payload}){
        const program = Object.values(this.$socketList).find((e)=>{
            return e.payload.id === payload.webview_id
        })
        if(program){
            this.$socketSend(JSON.stringify(payload),[program.key])
        }
    }
}
