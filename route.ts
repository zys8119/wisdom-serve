import {createRoute} from "@wisdom-serve/serve"
import { Configuration, OpenAIApi } from "openai"
export default createRoute({
    routes:[
        {
            path:"/",
            controller:async function (){
                const configuration = new Configuration({
                    apiKey:"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",
                });
                const openai = new OpenAIApi(configuration);
                const init = async (result:string = '')=>{
                    try {
                        const {data} = await openai.createCompletion({
                            model: "text-davinci-003",
                            prompt: result ,
                            temperature: 0.3,
                            top_p: 1,
                            frequency_penalty: 0.0,
                            presence_penalty: 0.0,
                        });
                        if(data.choices.length == 0 || !data.choices[0].text){
                            return result
                        }
                        result = result + data.choices[0].text
                        console.log(data.choices[0].text)
                        return await init(result)
                    }catch (e) {
                        try {
                            this.$error(e.response.data)
                        }catch (ee){
                            this.$error(ee.message)
                        }
                    }
                }
                this.$success(await init('介绍流浪地球'))
            },
        }
    ]
});
