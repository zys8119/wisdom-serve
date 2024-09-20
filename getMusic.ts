import {Controller} from "@wisdom-serve/serve"
import {launch} from "puppeteer"
import axios from "axios"
import {writeFileSync, mkdirSync} from "fs-extra"
import {resolve} from "path"
export default (async function() {
    try{
        const browser =await launch()
        const page =await browser.newPage()
        const so = this.$query.get('so')
        let url = null
        if(typeof so === 'string'){
            url = /^http/.test(so) ? so : `http://www.22a5.com/so/${encodeURIComponent(this.$query.get('so'))}.html`
        }else{
            await page.goto('http://www.22a5.com/list/djwuqu.html')
            const category = await page.evaluate(async()=>{
                return [...document.querySelectorAll<HTMLAnchorElement>('.ilingku_fl li a')].map(e=>{
                    return {
                        title:e.innerText,
                        url:e.href
                    }
                })
            })
            console.log("类别获取成功")
            url = category.find(e=>e.title === this.$query.get('category'))?.url ?? category?.[0].url
        }
        console.log(url)
        await page.goto(url as any)
        const pages = await page.evaluate(async(url:string)=>{
            return [...document.querySelectorAll<HTMLAnchorElement>('.page a')].map(e=>{
                return {
                    title:e.innerText,
                    url:url.replace(/(\.html$)/,`/${e.innerText}$1`)
                }
            }).filter(e=>/\w/.test(e.title))
        },url)
        console.log('分类页面url获取成功')
        const result = (await Promise.all(pages.map(async e=>{
            const page = await browser.newPage()
            await page.goto(e.url)
            await page.waitForSelector('.play_list ul li .name a')
            const data = await page.evaluate(async()=>{
                return [...document.querySelectorAll<HTMLAnchorElement>('.play_list ul li .name a')].map(e=>{
                    const url = e.href
                    const id = url.replace(/(.*\/)(.*)(\.html$)/,'$2')
                    console.log(id)
                    return {
                        title:e.innerText,
                        url,
                        id,
                    }
                })
            })
            await page.close()
            return data
        }))).reduce((a:any[],b:any[])=>a.concat(b),[])
        console.log("歌曲列表获取成功,开始下载列表歌曲")
        let k = 0
        while(k < result.length){
            try{
                const element = result[k]
                const {data:{url}} = await axios({
                    url:"http://www.22a5.com/js/play.php",
                    method:"post",
                    headers: {
                        referer: element.url,
                        "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    data:{
                        id:element.id,
                        type:'music',
                    },
                    proxy:{
                        host:"127.0.0.1",
                        port:7890,
                        protocol:"http"
                    }
                })
                const {data} = await axios({
                    url,
                    method:"get",
                    responseType:"arraybuffer"
                })
                const cwd = resolve(__dirname,this.$query.get('dirname') || typeof so === 'string' ? decodeURIComponent(so) : (this.$query.get('category') || 'music'))
                mkdirSync(cwd,{
                    recursive:true
                })
                writeFileSync(resolve(cwd, `${element.title}.mp3`), data)
                console.log(`当前进度(${(k/result.length*100).toFixed(2)})：${k}/${result.length}==>${element.title}`)
                k+=1
            }catch(e){
                k+=1
            }
        }
        console.log("下载完成")
        this.$success("下载完成")
        await browser.close()
    }catch(e){
        this.$error(e.message)
    }
} as Controller)
