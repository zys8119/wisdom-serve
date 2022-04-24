/* eslint-disable */
export default class a {
    constructor(postData){
        const postDataObject = {};
        postData = postData.replace(/\r\n\r/img,"=>")
        // 去掉转义字符
        postData = postData.replace(/[\/\b\f\n\r\t]/g, '');
        // 去掉特殊字符
        postData = postData.replace(/[\@\#\$\%\^\&\*\(\)\{\}\:\L\<\>\?\[\]]/,"");
        postData
            .replace(/-{6}(.|\n)*?(form-data;|-{2})/img,'').split("name=")
            .filter(e=>e.replace(/\s/img,"").length > 0)
            .forEach(e=>{
                const arr = e.split("=>");
                let keyName = arr[0];
                const keyNameMatch = keyName.match(/\[.*\]/img);
                if(keyNameMatch){
                    keyName = keyName.replace(/\[.*?\]/img,"");
                }
                keyName = keyName.replace(/\'|\"/img,"");
                try {
                    const evalval = null;
                    eval( `evalval = ${arr[1]}`);
                    if(keyNameMatch && keyNameMatch.length > 0){
                        try {
                            postDataObject[keyName] = postDataObject[keyName] || [];
                            keyNameMatch[0].split("][").forEach(e=>{
                                const index = e.replace(/\[|\]/img,"");
                                postDataObject[keyName][index] = postDataObject[keyName][index] || [];
                                return e;
                            });
                            eval(`postDataObject["${keyName}"]${keyNameMatch[0]} = ${arr[1]}`);
                        }catch (e) {
                            //
                        }
                        return;
                    }
                    postDataObject[keyName] = evalval;
                }catch (err) {
                    if(keyNameMatch && keyNameMatch.length > 0){
                        try {
                            postDataObject[keyName] = postDataObject[keyName] || [];
                            keyNameMatch[0].split("][").forEach(e=>{
                                const index = e.replace(/\[|\]/img,"");
                                postDataObject[keyName][index] = postDataObject[keyName][index] || [];
                                return e;
                            });
                            eval(`postDataObject["${keyName}"]${keyNameMatch[0]} = "${arr[1]}"`);
                        }catch (e) {
                            // console.log(e.message)
                        }
                        return;
                    }
                    postDataObject[keyName] = arr[1];
                }
            });
        return postDataObject;
    }
}
