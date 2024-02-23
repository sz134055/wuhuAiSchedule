let req = async (method,body,url)=>{
    return await fetch(url,{method:method, body:body,headers:{
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0'
    }}).then(re=>re.json()).then(v=>v).catch(err=>console.error(err))
}
let getCourse = async (mode)=>{
    let nowXNXQ = "/jwapp/sys/wdkb/modules/jshkcb/dqxnxq.do"
    let course = "/jwapp/sys/wdkb/modules/xskcb/cxxszhxqkb.do"
    //let showApp = "/appShow?appId=4770397878132218" //我的课表appid
    
    let xnxq = !document.getElementById('dqxnxq2')?(await req("post",null,nowXNXQ)).datas.dqxnxq.rows[0].DM:document.getElementById('dqxnxq2').getAttribute('value')
    return JSON.stringify({'courseJson':(await req("post",'XNXQDM='+xnxq,course)).datas.cxxszhxqkb.rows,'mode':mode})
}
function AIScheduleLoading({
    titleText='加载中',
    contentText = 'loading...',
}={}){
    console.log("start......")
    AIScheduleComponents.addMeta()
    const title = AIScheduleComponents.createTitle(titleText)
    const content = AIScheduleComponents.createContent(contentText)
    const card = AIScheduleComponents.createCard([title, content])
    const mask = AIScheduleComponents.createMask(card)
    
    let dyn 
    let count = 0
    function dynLoading(){
        let t = ['loading','loading.','loading..','loading...']
        if(count==4) count=0
        content.innerText = t[count++]
    }

    this.show=()=>{ 
        console.log("show......")
        document.body.appendChild(mask)
        dyn = setInterval(dynLoading,1000);
    }
    this.close=()=>{
        document.body.removeChild(mask)
        clearInterval(dyn)
    }
    }
async function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
    //除函数名外都可编辑
    //以下为示例，您可以完全重写或在此基础上更改
    await loadTool('AIScheduleTools')
  
    try{
         let mode = (await AIScheduleSelect({
            titleText:"导入模式选择",
            contentText:"请选择导入模式",
            selectList:[
                "模式一:解析当前页面（必须可以看到课表的页面）",
                "模式二:请求接口（登陆后即可使用）"
            ]
        })).split(':')[0]

        if(mode=='模式一'){
            return JSON.stringify({'html':dom.getElementById("kcb_container").outerHTML,'mode':mode})
        }
        else if(mode=='模式二'){
            let loading = new AIScheduleLoading()
            loading.show()
            let res = await getCourse(mode)
            loading.close()
        return res
        }
    }catch(e){
        try{
            let loading = new AIScheduleLoading()
            loading.show()
            let res = await getCourse("模式二")
           loading.close()
            return res
        }catch(e){
            await AIScheduleAlert({
                contentText: e,
                titleText: '错误',
                confirmText: '导入失败',
              })
            return "do not continue"
        }
    }   
}