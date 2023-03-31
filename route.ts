import {createRoute} from "@wisdom-serve/serve"
import axios from "axios"
import {launch} from "puppeteer"
export default createRoute({
    routes:[
        {
            path:"/",
            controller:async function (){
                const br = await launch()
                const page = await  br.newPage()
                const {data:htmls} = await axios({
                    url:`https://www.npmjs.com/settings/zys/packages?page=0&perPage=${this.$query.get('size') || 41}`,
                    method:'get',
                    headers:{
                        "cookie": this.$query.get('cookie')
                    }
                })

                const res = await page.evaluateHandle(async (data:any)=>{
                    document.write(data)
                    return await Promise.all([...document.querySelectorAll('a[target=_self]')]
                        .map((e:any)=>e.innerText)
                        .filter(e=>e !== 'zys')
                        .map(e=>`https://registry.npmjs.org/${e}`)
                    )
                },htmls)
                const pageUrls = await res.jsonValue()
                const result = await Promise.all(pageUrls.map(url=>axios({url, method:'get'}).then(res=>res.data)))
                this.$success(result.map(({repository, name, homepage})=>({
                    repository, name, homepage
                })).filter(e=>
                    /gitlab/.test(e.homepage)
                    || /gitlab/.test(e.repository?.url
                )))
                await br.close()
            },
        }
    ]
});
