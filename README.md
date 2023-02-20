# ChatGpt AI node代码简易封装

## 安装依赖

```
npm install openai lodash axios --save-dev
```

## 封装代码

```typescript
import { ConfigurationParameters, Configuration, OpenAIApi, CreateCompletionResponse } from "openai"
import { merge } from "lodash"
import {CreateCompletionRequest} from "openai/api";
import {AxiosRequestConfig} from "axios";
type InitOptions = Partial<{
    query:string
    isContinue:boolean,
    callback(data:CreateCompletionResponse):void
    adapter:OpenAIApi
    configuration:ConfigurationParameters
    createCompletion:CreateCompletionRequest
    axiosRequest:AxiosRequestConfig
}>
const createCompletion = async (options:InitOptions= {})=>{
    const config = merge({} as InitOptions, options)
    config.adapter = config.adapter || new OpenAIApi(new Configuration(config.configuration));
    const {data} = await config.adapter.createCompletion(merge({
        model: "text-davinci-003",
        prompt: config.query ,
        temperature: 1,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    }, config.createCompletion), merge({
        timeout:0,
    }, config.axiosRequest));
    config.callback?.(data)
    if(!config.isContinue){config.query = ''}
    config.query = config.query + data.choices[0].text
    if(data.choices[0].finish_reason === 'stop'){
        return  config.query
    }
    return await createCompletion(merge(config, {
        isContinue:true
    } as InitOptions))
}
export default createCompletion
```


## 使用

```typescript
import createCompletion from "./createCompletion";

await createCompletion({
    query:'农历怎么计算',
    callback(data: CreateCompletionResponse) {
        console.log(data.choices[0].text)
    },
    configuration:{
        apiKey:"请填写你openai私人的apikey",
    },
})
```

## 相关资料

[chat 在线演示](https://chat.openai.com/chat) 需要翻墙，最好是美国节点

[playground 在线api配置使用演示](https://platform.openai.com/playground) 需要翻墙

[chat 开发文档](https://platform.openai.com/docs/introduction)

## vpn 节点相关资料

http://front-end.zhijiasoft.com:50201/ 每次使用手动更新，每日流量30G,有效期一天

http://front-end.zhijiasoft.com:50201/clashNode 每日更新， 流量不固定，包含美国节点

https://ikuuu.eu/auth/register?code=UI9T  每月50G高速流量， 推荐使用，如需要使用，请自行注册

## vpn 相关软件

[二爷翻墙](https://github.com/ugvf2009/Miles) 文章中会介绍每个平台的软件工具

[V2RayN](https://github.com/v2ray/V2RayN)

[v2rayNG](https://github.com/2dust/v2rayNG)

[ClashForAndroid](https://github.com/Kr328/ClashForAndroid)

[clash_for_windows_pkg](https://github.com/Fndroid/clash_for_windows_pkg)
