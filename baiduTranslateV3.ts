import {Controller} from "@wisdom-serve/serve"
import axios from "axios"
export default (async function (){
    const {data} = await axios({
        url:'https://fanyi.baidu.com/ait/text/translate',
        "headers": {
          "accept": "text/event-stream",
          "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
          "acs-token": "请输入你的token",
          "cache-control": "no-cache",
          "content-type": "application/json",
          "pragma": "no-cache",
          "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin"
        },
        "method": "POST",
        data:{
            "query": this.$body.text,
            "from": this.$body.source_lang.toLowerCase(),
            "to": this.$body.target_lang.toLowerCase(),
            "reference": "",
            "corpusIds": [],
            "qcSettings": [
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10",
                "11"
            ],
            "needPhonetic": false,
            "domain": "common",
            "milliTimestamp": 1723618864689
        }
    })
    const result = data.split("\n").filter(e=>/^data:/.test(e)).map((e:string)=>JSON.parse(e.replace(/^data:/,'').trim())).filter(e=>["Translating",'GetKeywordsSucceed'].includes(e.data.event))
    this.$send(JSON.stringify({
        "code": 0,
        "translateResult": [
            result.filter(e=>["Translating"].includes(e.data.event)).map(e=>({
                tgt:e.data.list?.map(e=>e.dst).join(" ; ")
            })),
            result.filter(e=>["GetKeywordsSucceed"].includes(e.data.event)).map(e=>({
                tgt:e.data.keywords?.map?.(e=>[`【${e.word}】`].concat(e.means).join(" ; ")).join("\n")
            }))
        ],
        "type": "zh-CHS2en"
    }),{
        headers:{
            "Content-Type":"application/json; charset=utf-8",
        }
    })
} as Controller)
