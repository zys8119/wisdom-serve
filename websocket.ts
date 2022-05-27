import {Websocket} from "@wisdom-serve/serve/types/type";

export default <Partial<Websocket>>{
    "ws-connection"({key,send}){
        send("asdas", [key])
    },
    test({payload}){
        console.log(payload, 111)
    }
}
