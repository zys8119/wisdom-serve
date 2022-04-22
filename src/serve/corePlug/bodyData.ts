import { getFormData, bufferSplit } from "@wisdom-serve/utils"
import {parse} from "querystring"
import {Plugin} from "@wisdom-serve/serve/types/type"
/**
 * @获取body数据
 */
class bodyData {
    constructor(request,response,callback?:(body:any,bodySource:Buffer)=>void){
        let postData = "";
        const  requestDataSource:any = [];
        request.on('data', data => {
            postData += data;
            requestDataSource.push(data);
        });
        request.on('end', ()=>{
            const  bodySource:any = Buffer.concat(requestDataSource);
            if(request.headers["content-type"]){
                if(postData.indexOf("Content-Disposition: form-data") > -1){
                    //获取multipart/form-data;数据
                    try {callback(new getFormData(postData),bodySource);}catch (err) {callback({},bodySource)}
                    return;
                }else
                if(request.headers["content-type"].indexOf("multipart/form-data;") > -1){
                    //获取multipart/form-data;数据
                    try {callback(new getFormData(postData),bodySource);}catch (err) {callback({},bodySource)}
                    return;
                }else if(request.headers["content-type"].indexOf("application/x-www-form-urlencoded") > -1){
                    //获取application/x-www-form-urlencoded数据
                    try {callback(parse(postData),bodySource);}catch (err) {callback({},bodySource)}
                    return;
                }else if(request.headers["content-type"].indexOf("text/plain") > -1){
                    //获取text/plain数据
                    try {callback(postData,bodySource);}catch (err) {callback({},bodySource)}
                    return;
                }else if(request.headers["content-type"].indexOf("application/json") > -1){
                    //获取application/json数据
                    try {callback(JSON.parse(postData),bodySource);}catch (err) {callback({},bodySource)}
                    return;
                }else {
                    //其他数据，可扩展
                    try {callback(postData,bodySource);}catch (err) {callback({},bodySource)}
                    return;
                }
            }
            //获取其他格式数据
            callback(postData, bodySource);
        });
        request.on('error', (err) => {
            if(err) {
                response.writeHead(500, {'Content-Type': 'text/html'});
                response.write('An error occurred');
                response.end();
            }
        });
    }
}

export interface RequestFormDataInterface {
    type?:string | "file" | "data"; // 文件数据
    keyName?:string; // 数据字段
    keyValue?:string; // 数据值,type = data 时生效
    fileType?:string; // 文件Content-Type,type = file 时生效
    fileName?:string; // 文件名称,type = file 时生效
    fileBuff?:string; // 文件数据,buff类型,type = file 时生效
    [keyName:string]:any;
}
const getRequestFormData = (bodySource)=>{
    return new Promise((resolve,reject) => {
        try {
            if(bodySource.length > 0){
                const bodyFormData = bufferSplit(bodySource,"------").map(e=>{
                    const buffArr = bufferSplit(e,"\r\n\r\n");
                    if(buffArr.length === 2){
                        const resUlt:any = {};
                        const info:any = bufferSplit(buffArr[0],"\; ").map(e=>e.toString());
                        if(buffArr[0].indexOf(Buffer.from("Content-Type")) > -1){
                            // 文件
                            resUlt.type = "file";
                            // keyName
                            const split = Buffer.from("name=\"");
                            resUlt.keyName = info[1].slice(info[1].indexOf(split)+split.length,info[1].length-1);

                            const fileInfo = bufferSplit(info[2],"\r\n");

                            // fileType
                            try {
                                resUlt.fileType = bufferSplit(fileInfo[1]," ")[1];
                            }catch (e) {
                                // ewer
                            }
                            // filename
                            const splitFileName = Buffer.from("filename=\"");
                            resUlt.fileName = fileInfo[0].slice(fileInfo[0].indexOf(splitFileName)+splitFileName.length,fileInfo[0].length - 1);
                            // fileBuff
                            resUlt.fileBuff = buffArr[1].slice(0,buffArr[1].length-Buffer.from("\r\n").length);
                        }else {
                            // 数据
                            resUlt.type = "data";
                            // keyName
                            const split = Buffer.from("name=\"");
                            resUlt.keyName = info[1].slice(info[1].indexOf(split)+split.length,info[1].length-1);
                            // keyValue
                            const splitVal = Buffer.from("\r\n");
                            resUlt.keyValue = buffArr[1].slice(0,buffArr[1].indexOf(splitVal)).toString();
                        }
                        return resUlt;
                    }
                    return null;
                }).filter(e=>e);
                resolve(bodyFormData);
            }else {
                resolve([]);
            }
        }catch (err){
            reject(err);
        }
    });
}

const bodyDataFn:Plugin = function (request, response, next){
    return new Promise<void>(resolve => {
        new bodyData(request, response, (body,bodySource) => {
            this.$body = body;
            this.$bodySource = bodySource;
            this.$bodyRequestFormData = ()=> getRequestFormData(bodySource) as Promise<RequestFormDataInterface[]>
            resolve();
        })
    });
}
export default bodyDataFn

declare module "@wisdom-serve/serve" {
    interface AppServeInterface {
        $body?:any
        $bodySource?:Buffer
        $bodyRequestFormData?():Promise<RequestFormDataInterface[]>
    }
}
