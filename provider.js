let req = async (method,body,url)=>{
    return await fetch(url,{method:method, body:body,headers:{
        'Content-Type': 'application/json;charset=UTF-8',
    }}).then(re=>re.json()).then(v=>v).catch(err=>console.error(err))
}
let getCourse = async ()=>{
    let nowXNXQ = "/jwmobile/biz/v410/common/school/time"
    let course = "/jwmobile/biz/v410/schedule/querySchedule"
    let teachers = "/jwmobile/biz/v410/schedule/queryScheduleDetail"
    let time_info = (await req("get",null,nowXNXQ))
    let res = {
        maxSection:time_info.maxSection,
        maxWeekNum:time_info.maxWeekNum,
        xnxqdm:time_info.xnxqdm,
        start_day:new Date(time_info.weekCalendar[0].split(":")[0]).getTime().toString(),
        teachers_info:{},
        res:[]
    }
    for (let week=1;week<=res.maxWeekNum;week++){
        res.res.push({'list':(await req("post",JSON.stringify({"skzc":week,"xnxqdm":res.xnxqdm}),course)).data.theorySchedule})
    }

    //获得教师信息
    for (let i=0;i<res.res.length;i++){
        for (let j=0;j<res.res[i].list.length;j++){
            let c = res.res[i].list[j]
            if(!res.teachers_info[c.kcm]){
                const dataForm = JSON.stringify({
                    "jxbid":c.jxbid,
                    "kbid":c.kbid,
                    "jxblx":c.jxblx,
                    "wid":""
                })
                //改用同步请求
                let xhr = new XMLHttpRequest();
                xhr.open('POST', teachers, false); // 第三个参数为false表示同步请求
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                xhr.send(dataForm);

                if (xhr.status === 200) {
                    res.teachers_info[c.kcm] = JSON.parse(xhr.responseText).data.teacherInfo[0].xm
                } else {
                    console.error('请求失败教师信息失败');
                }
            }
        }
    }
    return JSON.stringify(res)
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
        loading = new AIScheduleLoading()
        loading.show()
        let res = await getCourse()
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