import {Websocket} from "@wisdom-serve/serve/types/type";
type DrawEndMapArray = {
    index:number
    total:number
    page:number
    img:number
    id:number
    emit:string
}
const drawEndMap = new Map<number, Array<DrawEndMapArray>>()
export default <Partial<Websocket>>{
    login({payload, socket}){
        (socket as any).user = payload
    },
    onScroll({payload, send}){
        send(JSON.stringify(payload))
    },
    drawEnd({payload, send}){
        if(!drawEndMap.has(payload.id)){
            drawEndMap.set(payload.id, [])
        }
        const currChunk = drawEndMap.get(payload.id)
        currChunk.push(payload)
        currChunk[payload.index] = payload
        if(currChunk.length === payload.total){
            drawEndMap.delete(payload.id)
        }
        send(JSON.stringify(payload))
        send(JSON.stringify({
            id:payload.id,
            index:payload.index,
            total:payload.total,
            page:payload.page,
            emit:'drawEndSuccess',
        }))
    }
}
