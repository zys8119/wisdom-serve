import {Controller} from "@wisdom-serve/serve";

/**
 * bobplugin 翻译插件爬虫
 */
export default (async function (){
    try {
        const url =`https://fanyi.baidu.com/#${this.$body.source_lang.toLowerCase()}/${this.$body.target_lang.toLowerCase()}/${encodeURIComponent(this.$body.text)}`
        console.log(url)
        await global.$page.goto(url)
        await new Promise<void>(resolve => {
            global.$page.on('response', async res=>{
                if(/v2transapi/.test(res.url())){
                    const data = await res.json()
                    const result = data.trans_result.data.map((e:any)=>({
                        ...e,
                        tgt:e.dst,
                        srcPronounce:e.src
                    }))
                    this.$send(JSON.stringify({
                        "code": 0,
                        "translateResult": [result],
                        "type": "zh-CHS2en"
                    }))
                    resolve()
                }
            })
        })
        global.$page.removeAllListeners()
    }catch (e){
        this.$error()
    }
}) as Controller
