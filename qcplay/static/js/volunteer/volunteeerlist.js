layui.use(['form','layer','table','laytpl','laydate'],function(){
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        laydate = layui.laydate,
        table = layui.table;

    //常规用法
    laydate.render({
        elem: '#starttime'
    });
    laydate.render({
        elem: '#endtime'
    });

    //课程列表
    var tableIns = table.render({
        elem: '#courseList',
        url : '/xyadmin/volunteer/volunteer_data',
        cellMinWidth : 95,
        cellMinHeight:120,
        page : true,
        height : "full-125",
        limits : [10,15,20,25],
        limit : 20,
        id : "courseListTable",
        cols : [[
            {type: "checkbox", fixed:"left"},
            {field: 'id', title: '编号', width:80, align:"center"},
            {field: 'real_name', title: '姓名',width:80, align:'center'},
            {field: 'id_number', title: '身份证号码', minWidth:180, align:"center"},
            {field: 'mobile', title: '手机号', align:'center',minWidth:100},
            {field: 'qq', title: 'qq号码', align:'center',minWidth:100},
            {field: 'istrain', title: '是否培训', align:'center',minWidth:90,templet:function (d) {
                    return d.istrain ? "已培训" : "未培训";
                }},
            {field: 'lenth_service', title: '时长(小时)', align:'center',minWidth:90},
            // {field: 'volunteer_type', title: '志愿者类型', align:'center'},
            {field: 'volunteer_type', title: '类型', minWidth:100, align:"center",templet:function (d) {
                    if(d.volunteer_type == "1"){
                        return "日常志愿者";
                    }
                    if(d.volunteer_type == "2"){
                        return "多媒体志愿者";
                    }
                    if(d.volunteer_type == "3"){
                        return "亲子志愿者";
                    }
                    if(d.volunteer_type == "4"){
                        return "寒暑假志愿者";
                    }

                }},
            {field: 'create_time', title: '审核日期', align:'center',minWidth:200},
            // {title: '操作',minWidth:175, templet:'#courseListBar',fixed:"right",align:"center"}
        ]]
    });

    //搜索【此功能需要后台配合，所以暂时没有动态效果演示】
    $(".search_btn").on("click",function(){
        table.reload("courseListTable",{
            page: {
                curr: 1 //重新从第 1 页开始
            },
            where: {
                key: $(".searchVal").val(),  //搜索的关键字
                volunteer_type:$(".category").val(),
                starttime:$(".starttime").val(),
                endtime:$(".endtime").val(),
                istrain:$(".istrain").val(),

            }
        })
    });

    //批量删除
    $(".delAll_btn").click(function(){
        var checkStatus = table.checkStatus('courseListTable'),
            data = checkStatus.data,
            ids = [];
        if(data.length > 0) {
            for (var i in data) {
                ids.push(data[i].id);
            }
            layer.confirm('确定删除选中的课程？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    type:'post',
                    url:'courses_delete',
                    traditional:true,
                    data:{ids : ids,csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()},
                    dataType: "json",
                    async:false,
                    success:function(data){
                        tableIns.reload();
                        layer.close(index);
                    }
                })
            })
        }else{
            layer.msg("请选择需要删除的课程");
        }
    })

    //推荐
    $(".recmdCourse_btn").click(function(){
        recmdCourse('true');
    })
    //不推荐
    $("._recmdCourse_btn").click(function(){
        recmdCourse('false');
    })

    function recmdCourse(recmd_value){
        var confirm_str=recmd_value=="true"?"确定通过培训吗":"确定取消推荐此课程吗";
        var checkStatus = table.checkStatus('courseListTable'),
            data = checkStatus.data,
            ids = [];
        if(data.length > 0) {
            for (var i in data) {
                ids.push(data[i].id);
            }
            layer.confirm(confirm_str, {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    type:'post',
                    url:'volunteer_istrain',
                    traditional:true,
                    data:{ids : ids,istrain:recmd_value,csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()},
                    dataType: "json",
                    async:false,
                    success:function(data){
                        tableIns.reload();
                        layer.close(index);
                    }
                })
            })
        }else{
            layer.msg("请选择志愿者");
        }
    }

    //发布
    $(".showCourse_btn").click(function(){
        showCourse('true');
    })
    //不发布
    $("._showCourse_btn").click(function(){
        showCourse('false');
    })

    function showCourse(show_value){
        var confirm_str=show_value=="true"?"确定发布此课程吗":"确定取消发布此课程吗";
        var checkStatus = table.checkStatus('courseListTable'),
            data = checkStatus.data,
            ids = [];
        if(data.length > 0) {
            for (var i in data) {
                ids.push(data[i].id);
            }
            layer.confirm(confirm_str, {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    type:'post',
                    url:'courses_show',
                    traditional:true,
                    data:{ids : ids,show:show_value,csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()},
                    dataType: "json",
                    async:false,
                    success:function(data){
                        tableIns.reload();
                        layer.close(index);
                    }
                })
            })
        }else{
            layer.msg("请选择课程");
        }
    }

    $(".export_btn").click(function () {
        //exportCourse();
        url = 'courses_export?key='+$(".searchVal").val();
        url+='&category='+$(".category").val();
        url+='&starttime='+$(".starttime").val();
        url+='&endtime='+$(".endtime").val();
        url+='&is_recmd='+$(".is_recmd").val();
        url+='&is_show='+$(".is_show").val();
        $('#downloadexcel').attr('src',url);
    })

    function exportCourse(){
        $.ajax({
            type:'get',
            url:'courses_export',
            data:{
                key: $(".searchVal").val(),
                category:$(".category").val(),
                starttime:$(".starttime").val(),
                endtime:$(".endtime").val(),
                is_recmd:$(".is_recmd").val(),
                is_show:$(".is_show").val(),
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()},
            dataType: "json",
            async:true,
            success:function(data){

            }
        })
    }

    //列表操作
    table.on('tool(courseList)', function(obj){
        var layEvent = obj.event,
            data = obj.data;

        if(layEvent === 'edit'){ //编辑
            editCourse(data);
        }else if(layEvent === 'questionlist'){
            questionList(data);
        }else if(layEvent === 'chapterlist'){
            chapterList(data);
        }else if(layEvent === 'videolist'){
            videoList(data);
        }else if(layEvent === 'usable'){ //启用禁用
            var _this = $(this),
                usableText = "是否确定禁用此课程？",
                btnText = "已禁用";
            if(_this.text()=="已禁用"){
                usableText = "是否确定启用此课程？",
                    btnText = "已启用";
            }
            layer.confirm(usableText,{
                icon: 3,
                title:'系统提示',
                cancel : function(index){
                    layer.close(index);
                }
            },function(index){
                _this.text(btnText);
                layer.close(index);
            },function(index){
                layer.close(index);
            });
        }else if(layEvent === 'del'){ //删除
            layer.confirm('确定删除此课程？',{icon:3, title:'提示信息'},function(index){
                $.post("courses_delete",{
                    ids : data.id,  //将需要删除的newsId作为参数传入
                    csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
                },function(data){
                    tableIns.reload();
                    layer.close(index);
                })
            });
        }
    });

})