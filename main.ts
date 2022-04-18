import {createApp} from "@wisdom-serve/serve"
console.time()
const app = createApp({
}).use((res, req, next) => void {

}).listen().then(()=>{
    console.timeEnd()
});
