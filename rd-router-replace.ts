
import {sync} from "fast-glob"
import {readFileSync, writeFileSync} from "fs-extra"
export default async function (){
    const cwd = ''
    const routeFiles = sync(['**/*.ts'],{cwd, absolute:true})
    for (const [, v] of Object.entries(routeFiles)){
        const map = {}
        const content = readFileSync(v, 'utf8')
        const newContent = content.replace(/component:.*(import|require)\s*\(([^)]*)?\).*/g, function (a, ...b){
            let module = b[1]
            const importName = module.replace(/'|"|(\.+|@[^/]*)\/|\..*$|components\/views\//g,'').replace(/\//g,'_').replace(/^\d+|\d$/g,'_')
            if(!/\.vue/.test(module)){
                module = module.replace(/(\w)(?=[^\w]*$)/,'$1.vue')
            }
            map[importName] = module
            return `component:${importName},`
        })
        const imports = Object.entries(map).reduce((a, [k, v])=>{
            return a.concat([`import ${k} from ${v}`])
        },[]).join("\n")+'\n'
        writeFileSync(v, imports+newContent)
    }
}
