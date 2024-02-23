
function scheduleHtmlParser(html) {
    //除函数名外都可编辑
    //传入的参数为上一步函数获取到的html
    //可使用正则匹配
    //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://cnodejs.org/topic/5203a71844e76d216a727d2e
    let Courses = {}
    let result = []
    const info = JSON.parse(html)
    
    let addNewCourse = function(c,now_week){
        if(!Courses[c.kcm]){
            Courses[c.kcm] = []
        }

        Courses[c.kcm].push({
            name: c.kcm,
            position:c.jxlmc,
            teacher:info.teachers_info[c.kcm],
            weeks:[now_week],
            day:c.skxq,
            sections:[]
        })
        for(let i=c.ksjc;i<=c.jsjc;i++){
            Courses[c.kcm][Courses[c.kcm].length-1].sections.push(i)
        }
    }

    for(let week=0;week<info.maxWeekNum;week++){
        const list = info.res[week].list
        for(let c_num=0;c_num<list.length;c_num++){
            if(!Courses[list[c_num].kcm]){
                //插入
                addNewCourse(list[c_num],week+1)
            }else{
                let is_new_course = true
                for(let i=0;i<Courses[list[c_num].kcm].length;i++){
                    if(Courses[list[c_num].kcm][i].day==list[c_num].skxq){
                        is_new_course = false
                        Courses[list[c_num].kcm][i].weeks.push(week+1)
                        break
                    }
                }
                if(is_new_course){
                    //星期不符，视为本周另开课
                    addNewCourse(list[c_num],week+1)
                }
            }
        }
    }

    //装填至result
    for (let c_key in Courses) {
        if (Courses.hasOwnProperty(c_key)) {
            for(let i=0;i<Courses[c_key].length;i++){
                result.push(Courses[c_key][i])
            }
        }
    }

    //console.log(result)
    delete info['res']  //删除不需要的res数据
    return {
        courseInfos: result, // 原先的返回内容
        time_info: info
    }
    //return result
}