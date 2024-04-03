
import {IncomingHttpHeaders} from "http";


//todo 参考文档 http://www.iana.org/assignments/media-types/media-types.xhtml
// 参考文档 页面查找函数
/**

 ((reg, index = 0)=>{
    return [...document.querySelectorAll("table tr")]
        .filter(e=>reg.test(([...(e.querySelectorAll("td") || [])][index] || {}).innerText))
        .map(e=>[...e.querySelectorAll("td")]
        .map(td=>td.innerText))
})(/^json|html/)

 */


const HttpHeaderConfig =  [
    "Model/vnd.dwf",
    "application/octet-stream",
    "application/json",
    "application/x-001",
    "application/x-301",
    "application/vnd.adobe.workflow",
    "application/x-bmp",
    "application/x-bot",
    "application/x-c4t",
    "application/x-c90",
    "application/x-cals",
    "application/vnd.ms-pki.seccat",
    "application/x-netcdf",
    "application/x-cdr",
    "application/x-cel",
    "application/x-x509-ca-cert",
    "application/x-g4",
    "application/x-cgm",
    "application/x-cit",
    "application/x-cmx",
    "application/x-cot",
    "application/pkix-crl",
    "application/x-csi",
    "application/x-cut",
    "application/x-dbf",
    "application/x-dbm",
    "application/x-dbx",
    "application/x-dgn",
    "application/x-dib",
    "application/x-msdownload",
    "application/msword",
    "application/x-drw",
    "application/x-dwg",
    "application/x-dxb",
    "application/x-dxf",
    "application/vnd.adobe.edn",
    "application/x-emf",
    "application/x-ps",
    "application/postscript",
    "application/x-ebx",
    "application/fractals",
    "application/x-frm",
    "application/x-gbr",
    "application/x-",
    "application/x-gp4",
    "application/x-hgl",
    "application/x-hmr",
    "application/x-hpgl",
    "application/x-hpl",
    "application/mac-binhex40",
    "application/x-hrf",
    "application/hta",
    "application/x-iff",
    "application/x-igs",
    "application/x-iphone",
    "application/x-img",
    "application/x-internet-signup",
    "application/x-jpg",
    "application/javascript",
    "application/x-javascript",
    "application/x-laplayer-reg",
    "application/x-latex",
    "application/x-ltr",
    "application/x-troff-man",
    "application/msaccess",
    "application/x-mdb",
    "application/x-shockwave-flash",
    "application/x-mil",
    "application/vnd.ms-project",
    "application/x-out",
    "application/pkcs10",
    "application/x-pkcs12",
    "application/x-pkcs7-certificates",
    "application/pkcs7-mime",
    "application/x-pkcs7-certreqresp",
    "application/pkcs7-signature",
    "application/x-pc5",
    "application/x-pci",
    "application/x-pcl",
    "application/x-pcx",
    "application/pdf",
    "application/vnd.adobe.pdx",
    "application/x-pgl",
    "application/x-pic",
    "application/vnd.ms-pki.pko",
    "application/x-perl",
    "application/x-plt",
    "application/x-png",
    "application/vnd.ms-powerpoint",
    "application/x-ppm",
    "application/x-ppt",
    "application/x-pr",
    "application/pics-rules",
    "application/x-prn",
    "application/x-prt",
    "application/x-ptn",
    "application/x-ras",
    "application/rat-file",
    "application/x-red",
    "application/x-rgb",
    "application/vnd.rn-realsystem-rjs",
    "application/vnd.rn-realsystem-rjt",
    "application/x-rlc",
    "application/x-rle",
    "application/vnd.rn-realmedia",
    "application/vnd.adobe.rmf",
    "application/vnd.rn-realmedia-secure",
    "application/vnd.rn-realmedia-vbr",
    "application/vnd.rn-realsystem-rmx",
    "application/vnd.rn-realplayer",
    "application/vnd.rn-rsml",
    "application/x-rtf",
    "application/x-sat",
    "application/sdp",
    "application/x-sdw",
    "application/x-stuffit",
    "application/x-slb",
    "application/x-sld",
    "application/smil",
    "application/x-smk",
    "application/futuresplash",
    "application/streamingmedia",
    "application/vnd.ms-pki.certstore",
    "application/vnd.ms-pki.stl",
    "application/x-sty",
    "application/x-tdf",
    "application/x-tg4",
    "application/x-tga",
    "application/x-icq",
    "application/vnd.visio",
    "application/x-vpeg005",
    "application/x-vsd",
    "application/x-vst",
    "application/x-wb1",
    "application/x-wb2",
    "application/x-wb3",
    "application/x-wk3",
    "application/x-wk4",
    "application/x-wkq",
    "application/x-wks",
    "application/x-wmf",
    "application/x-ms-wmz",
    "application/x-wp6",
    "application/x-wpd",
    "application/x-wpg",
    "application/vnd.ms-wpl",
    "application/x-wq1",
    "application/x-wr1",
    "application/x-wri",
    "application/x-wrk",
    "application/x-ws",
    "application/vnd.adobe.xdp",
    "application/vnd.adobe.xfd",
    "application/vnd.adobe.xfdf",
    "application/x-xls",
    "application/x-xlw",
    "application/x-xwd",
    "application/x-x_b",
    "application/vnd.symbian.install",
    "application/x-x_t",
    "application/vnd.iphone",
    "application/vnd.android.package-archive",
    "application/x-silverlight-app",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
    "application/vnd.ms-word.document.macroEnabled.12",
    "application/vnd.ms-word.template.macroEnabled.12",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
    "application/vnd.ms-excel.sheet.macroEnabled.12",
    "application/vnd.ms-excel.template.macroEnabled.12",
    "application/vnd.ms-excel.addin.macroEnabled.12",
    "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.presentationml.template",
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
    "application/vnd.ms-powerpoint.addin.macroEnabled.12",
    "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
    "application/vnd.ms-powerpoint.slideshow.macroEnabled.12",
    "application/vnd.fdf",
    "application/x-gl2",
    "application/x-ico",
    "application/x-jpe",
    "application/x-nrf",
    "audio/x-pn-realaudio-plugin",
    "application/x-tif",
    "application/x-906",
    "application/x-cmp",
    "application/x-dcx",
    "application/x-epi",
    "application/x-icb",
    "audio/x-liquid-file",
    "application/x-mmxp",
    "audio/scpls",
    "application/vnd.rn-recording",
    "application/x-vda",
    "application/x-a11",
    "application/x-bittorrent",
    "audio/x-mei-aac",
    "audio/aiff",
    "application/x-anv",
    "audio/basic",
    "audio/x-liquid-secure",
    "application/x-lbm",
    "audio/x-la-lms",
    "audio/mid",
    "audio/x-musicnet-download",
    "audio/x-musicnet-stream",
    "audio/mp1",
    "audio/mp2",
    "audio/rn-mpeg",
    "audio/vnd.rn-realaudio",
    "audio/x-pn-realaudio",
    "application/vnd.rn-realsystem-rmj",
    "application/vnd.rn-rn_music_package",
    "audio/wav",
    "audio/x-ms-wax",
    "audio/x-ms-wma",
    "application/x-ms-wmd",
    "audio/mpegurl",
    "application/x-mac",
    "audio/mp3",
    "application/x-sam",
    "application/x-dwf",
    "application/x-mi",
    "drawing/907",
    "drawing/x-slk",
    "drawing/x-top",
    "image/tiff",
    "image/png",
    "image/vnd.wap.wbmp",
    "image/fax",
    "image/gif",
    "image/x-icon",
    "image/jpeg",
    "image/pnetvue",
    "image/vnd.rn-realpix",
    "java/*",
    "message/rfc822",
    "text/xml",
    "text/css",
    "text/vnd.rn-realtext3d",
    "text/vnd.rn-realtext",
    "text/html",
    "text/iuls",
    "text/vnd.wap.wml",
    "text/scriptlet",
    "text/h323",
    "text/asa",
    "text/asp",
    "text/x-component",
    "text/webviewhtml",
    "text/plain",
    "text/x-vcard",
    "text/x-ms-odc",
    "video/x-ivf",
    "video/x-mpeg",
    "video/x-sgi-movie",
    "video/x-ms-wm",
    "video/x-ms-asf",
    "video/x-ms-wvx",
    "video/avi",
    "video/mpeg4",
    "video/mpeg",
    "video/x-mpg",
    "video/mpg",
    "video/vnd.rn-realvideo",
    "video/x-ms-wmv",
    "video/x-ms-wmx",
    "charset=utf-8",
] as const;

export const MethodArr = [
    'get' , 'GET',
    'deleteGrouptypedelete' , 'DELETE',
    'head' , 'HEAD',
    'options' , 'OPTIONS',
    'post' , 'POST',
    'put' , 'PUT',
    'patch' , 'PATCH',
    '*' ,
] as const

export type Method = typeof MethodArr[number] | string

export type HeaderContentType = typeof HttpHeaderConfig[number]  | string

export interface CustomHttpHeadersTypeInterface {
    "Content-Type": HeaderContentType
    "Access-Control-Allow-Origin":"*" | string
    "Access-Control-Allow-Methods":Method
    "Access-Control-Allow-Headers":"*" | "Content-Type" | string
    "Allow":"*" | Method | string
    "Content-Length":number
    "Server":string
    "Date":Date
    "Connection":"keep-alive" | string
    "Keep-Alive:":"timeout" | string
    "Timing-Allow-Origin:":"*" | string
    "Vary":"Accept" | "Origin" | string
    "X-Content-Type-Options":"nosniff" | string
}

export type HttpHeadersTypeInterface = CustomHttpHeadersTypeInterface & IncomingHttpHeaders

export default HttpHeaderConfig;


