import {Websocket} from "@wisdom-serve/serve/types/type";
export default <Partial<Websocket>>{
    login({payload, socket}){
        (socket as any).user = payload
    },
    onScroll({payload, send}){
        send(JSON.stringify(payload))
    },
    drawEnd({payload, send}){
        send(JSON.stringify(payload))
    }
}
