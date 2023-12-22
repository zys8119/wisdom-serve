import {Controller} from "@wisdom-serve/serve";
import {exec, execSync} from "child_process";
import {mkdirSync, writeFileSync} from "fs-extra";
import axios from "axios"
import * as FormData from "form-data"

export default (async function (){
    const root = './nodeJsScan/data'
    mkdirSync(root,{recursive:true})
    writeFileSync(`${root}/package.json`, this.$body.package?.[0].fileBuff || JSON.stringify({}))
    let scanData = null
    try {
        // 代码检测
        const formdata = new FormData()
        formdata.append('file',this.$body.dist?.[0].fileBuff, {
            filename:'code.zip',
            contentType:'application/zip'
        })
        const {
            data:scan,
        } = await axios({
            url:'http://192.168.110.140:9090/upload/',
            method:'post',
            headers:formdata.getHeaders(),
            data:formdata
        })
        scan.url = `http://192.168.110.140:9090/${scan.url}`
        scanData = scan
    }catch (e) {
        scanData = null
    }
    // pnpm 依赖检测
    let json = null;
    try {
        await new Promise((resolve, reject) => {
            const childProcess = exec(`git init && pnpm i`, {cwd:root}, (error,stdout) => {
                if (error) {
                    reject(error)
                }else {
                    resolve(stdout)
                }
            })
            childProcess.stdout.on('data', d=>{
                console.log(`stdout: ${d}`);
            })
            childProcess.stderr.on('data', d=>{
                console.error(`stdout: ${d}`);
            })
        })
        try {
            json =  execSync('pnpm audit --json --ignore-registry-errors', {cwd:root}).toString()
        }catch (e) {
            json = e.stdout.toString().replace(/(.|\n)*?\{/,'{')
        }
    }catch (e){
        console.error(e)
    }
    this.$success({
        depsInfo:JSON.parse(json),
        scanData
    })
}) as Controller
