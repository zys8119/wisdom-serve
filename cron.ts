import {CronJob} from "cron"
import * as dayjs from "dayjs"
import { createHmac } from "crypto";
import axios from "axios";
import * as jquery from "jquery";
import {JSDOM} from "jsdom"
export const send_dingding = async function (data:any){
    const timestamp = Date.now();
    const access_token = process.env.dingtalk_access_token_kc;
    const secret = process.env.dingtalk_secret_kc;
    const sign = createHmac('sha256', secret)
        .update(`${timestamp}\n${secret}`, "utf8")
        .digest('base64');
    try {
        const res = await axios({
            url:"https://oapi.dingtalk.com/robot/send",
            method:"post",
            params:{
                access_token,
                timestamp,
                sign:encodeURIComponent(sign),
            },
            data:{
                "msgtype":"markdown",
                "markdown":data,
                at:{
                    atMobiles:[],
                }
            }
        })
        if(res.data && typeof res.data.errcode === "number" && res.data.errcode === 0){
            console.log("【钉钉消息】发送成功")
        }else {
            console.error("【钉钉消息】发送成功",res.data)
        }
    }catch(err){
        console.error("【钉钉消息】发送失败",err.message)
    }
}
const courseNotice = async ()=>{
    const day = dayjs()
    const t = {
        "数学":{curriculum:"数学", teacher:"柴丹丹"},
        "语文":{curriculum:"语文", teacher:"苏莎"},
        "音乐":{curriculum:"音乐", teacher:"李灵芳"},
        "体育":{curriculum:"体育", teacher:"徐淑娇"},
        "美术":{curriculum:"美术", teacher:"蒋滢"},
        "劳动":{curriculum:"劳动", teacher:"苏莎"},
        "道法":{curriculum:"道法", teacher:"苏莎"},
        "科学":{curriculum:"科学", teacher:"苏莎"},
        "班队":{curriculum:"班队", teacher:"柴丹丹"},
    }
    const curriculumMap = {
        1:{
            AM:[
                t["数学"],
                t["语文"],
                t["音乐"],
            ],
            PM:[
                t['语文'],
                t['道法']
            ],
            title:"周一",
            remarks:"今天穿校服，记得穿好衣服",
        },
        2:{
            remarks:"今天下午有美术课,需要携带美术器材",
            AM:[
                t['数学'],
                t['语文'],
                t['体育'],
            ],
            PM:[
                t['美术'],
                t['劳动']
            ],
            title:"周二",
        },
        3:{
            AM:[
                t['语文'],
                t['音乐'],
                t['数学'],
            ],
            PM:[
                t['道法'],
                t['体育']
            ],
            title:"周三",
        },
        4:{
            AM:[
                t['语文'],
                t['体育'],
                t['数学'],
            ],
            PM:[
                t['语文'],
                t['科学']
            ],
            title:"周四",
        },
        5:{
            AM:[
                t['语文'],
                t['数学'],
                t['美术'],
            ],
            PM:[
                t['语文'],
                t['体育'],
                t['班队']
            ],
            title:"周五",
            remarks:"今天穿校服，记得穿好衣服",
        },
        6:{
            AM:[],
            PM:[],
            title:"周六",
        },
        0:{
            AM:[],
            PM:[],
            title:"周日",
        },
    }
    const data:any = {
        time:day.format('YYYY年MM月DD日 HH时mm分ss秒'),
        info:curriculumMap[day.day()],
    }
    const {location,now, lastUpdate} = await axios('https://weather.cma.cn/api/now/58562-AZJ').then(e=>e.data.data)
    const weatherHtml = await axios('https://weather.cma.cn/web/weather/58562-AZJ.html').then(e=>e.data)
    const $ = jquery(new JSDOM(weatherHtml).window) as unknown as JQueryStatic
    const weather = $("#dayList > div.pull-left.day.actived > div:nth-child(3)").text().trim()
    const weatherIconUrl = 'https://weather.cma.cn'+$("#dayList > div.pull-left.day.actived > div.day-item.dayicon > img").attr('src').trim()
    const sendData = {
        title:"今日课程助手-张景旗小朋友",
        text:`
        ## 【${data.info.title}】今日课程助手-张景旗小朋友
        > 时间:${data.time}
        ---
        * <font color='#f00'>${data.info.remarks}</font>
        ---
        ## 上午课程:
        * ${data.info.AM.map(e=>`${e.curriculum}-----${e.teacher}`).join("\n* ")}
        ## 下午课程:
        * ${data.info.PM.map(e=>`${e.curriculum}-----${e.teacher}`).join("\n* ")}
        ---
        ## ${location.name}天气：=> ${weather}
        * 天气：<img src='${weatherIconUrl}' width=30>${weather}
        * 温度：${now.temperature}℃
        * 风力：${now.windDirection} ${now.windScale} 风速(${now.windSpeed}m/s) 角度(${now.windDirectionDegree})
        * 气压：${now.pressure}hPa
        * 湿度：${now.humidity}
        * 降水：${now.precipitation}
        * 
        * 天气数据更新时间：${lastUpdate}
        * [更多天气](https://weather.cma.cn/web/weather/58562-AZJ.html)
        `.split("\n").map(e=>e.trim()).join("\n")
    }
    await send_dingding(sendData)
}
const task = async()=>{
    await courseNotice()
}
new CronJob(
	'0 0 6 * * *',
	task, 
	null,
	true, 
);
