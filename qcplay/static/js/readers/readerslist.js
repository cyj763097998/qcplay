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
        url : '/xyadmin/reader/readers_data',
        cellMinWidth : 95,
        cellMinHeight:120,
        page : true,
        height : "full-125",
        limits : [10,15,20,25],
        limit : 20,
        id : "courseListTable",
        cols : [[
            {type: "checkbox", fixed:"left"},
            {field: 'id', title: 'ID', align:'center',minWidth:80},
            {field: 'wx_headimgurl', title: '头像', minWidth:80,minHeight:120, align:'center',templet:function(d){
                    return '<div><img style="width: 120px;height: 80px" src="'+d.wx_headimgurl+'"></div>';
                }},
            {field: 'wx_nick_name', title: '昵称', align:'center',minWidth:200},
            {field: 'reader_card', title: '身份证号码', minWidth:200, align:"center"},
            {field: 'userid', title: '读者编号', minWidth:100, align:"center"},
            {field: 'real_name', title: '姓名', align:'center', minWidth:100},
            {field: 'mobile', title: '手机号', align:'center',minWidth:100},
            {field: 'isactivity_manager', title: '是否活动管理员', align:'center',templet:function (d) {
                    return d.isactivity_manager ? "是" : "否";
                }},
            {field: 'wx_bind_time', title: '微信绑定时间', align:'center',minWidth:200}

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
                isactivity_manager:$(".isactivity_manager").val(),

            }
        })
    });

    //发布
    $(".isactivity_manager").click(function(){
        showCourse('true');
    })
    //不发布
    $("._isactivity_manager").click(function(){
        showCourse('false');
    })

    function showCourse(show_value){
        var confirm_str=show_value=="true"?"确定发布设为活动管理员吗":"确定发布取消活动管理员吗";
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
                    url:'readers_status',
                    traditional:true,
                    data:{ids : ids,isactivity_manager:show_value,csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()},
                    dataType: "json",
                    async:false,
                    success:function(data){
                        tableIns.reload();
                        layer.close(index);
                    }
                })
            })
        }else{
            layer.msg("请选择读者");
        }
    }

    $(".export_btn").click(function () {
        //exportCourse();
        url = 'readers_export?key='+$(".searchVal").val();
        $('#downloadexcel').attr('src',url);
    })

    function exportCourse(){
        $.ajax({
            type:'get',
            url:'readers_export',
            data:{
                key: $(".searchVal").val(),
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