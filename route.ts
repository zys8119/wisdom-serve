import {createRoute} from "@wisdom-serve/serve"
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
        max_tokens:150,
        frequency_penalty: 0,
        presence_penalty: 0,
    } as CreateCompletionRequest, config.createCompletion), merge({
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
export default createRoute({
    routes:[
        {
            path:"/",
            controller:async function (){
                try {
                    this.$success(await createCompletion({
                        query:'js正则表达式',
                        callback(data: CreateCompletionResponse) {
                            console.log(data.choices[0].text)
                        },
                        configuration:{
                            apiKey:"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",
                        },
                    }))
                }catch (e){
                    try {
                        this.$error(e.response.data)
                    }catch (ee){
                        this.$error(ee.message)
                    }
                }
            },
        }
    ]
});
