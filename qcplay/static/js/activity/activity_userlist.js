layui.use(['form','layer','table','laytpl','laydate','upload','element'],function(){
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        laydate = layui.laydate,
        table = layui.table;
    //常规用法
    laydate.render({
        elem: '#start_time'
    });
    laydate.render({
        elem: '#end_time'
    });
    //用户列表
    var tableIns = table.render({
        elem: '#activityuserList',
        url : '/xyadmin/activity/activity_list_data?activity_id='+$('#activity_id').val(),
        cellMinWidth : 95,
        cellMinHeight:120,
        page : true,
        height : "full-125",
        limits : [10,15,20,25],
        limit : 20,
        // cellMinWidth : 100,
        id : "activityuserListTable",
        cols : [[
            {type: "checkbox", fixed:"left"},
            {field: 'id', title: 'ID', minWidth:50, align:"center"},
            {field: 'reader__real_name', title: '用户名', minWidth:100, align:"center"},
            {field: 'reader__wx_nick_name', title: '微信昵称', minWidth:100, align:"center"},
            {field: 'reader__mobile', title: '电话', minWidth:100, align:'center'},
            {field: 'reader__reader_card', title: '证件号码', minWidth:200, align:'center'},
            {field: 'enter_explain', title: '报名信息',minWidth:450,  align:'left',templet:function (d) {
                    var field_data = eval('['+d.enter_explain.replace(new RegExp(";","g"),',')+']');
                    var result = '';
                    $.each(field_data,function (i,item) {
                        result += item['text']+':'+ item['value']+' ';
                    })
                    return result;
                }},
            // {field: 'status', title: '是否签到',minWidth:200,  align:'center'},
            {field: 'status', title: '是否签到', minWidth:100, align:"center",templet:function (d) {
                    if(d.status == "1"){
                        return "未签到";
                    }
                    if(d.status == "2"){
                        return "已签到";
                    }
                }},
            {field: 'registration_time', title: '报名时间', minWidth:200, align:'center'},
            {field: 'checkin_time', title: '签到时间', minWidth:200, align:'center'}

        ]]
    });
    //搜索
    $(".search_btn").on("click",function(){
        table.reload("activityuserListTable",{
            page: {
                curr: 1 //重新从第 1 页开始
            },
            where: {
                key: $(".searchVal").val(),  //搜索的关键字
                start_time:$(".start_time").val(),
                end_time:$(".end_time").val(),
            }
        })
    });

    var upload = layui.upload, element = layui.element;

    var uploadInst = upload.render({
        elem: '#btn_upload_excel'
        ,url: '/xyadmin/activity/upload_activityuser?activity_id='+$('#activity_id').val()
        ,accept:'file'
        ,data:{csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()}
        ,done: function(res){
            //如果上传失败
            if(res.code != '1'){
                return layer.msg('上传失败');
            }else{
                $('#error_text').html('');
                return layer.msg('上传成功');
            }
            //上传成功
        }
        ,error: function(){
            //演示失败状态，并实现重传
            var errorText = $('#error_text');
            errorText.html('<span style="color: #FF5722;">上传失败</span> <a class="layui-btn layui-btn-xs demo-reload">重试</a>');
            errorText.find('.demo-reload').on('click', function(){
                uploadInst.upload();
            });
        }
    });


    //添加用户
    function addUser(edit){
        var index = layui.layer.open({
            title : '导出excel',
            type : 2,
            content : "users_export",
            success : function(layero, index){
                var body = layui.layer.getChildFrame('body', index);
                setTimeout(function(){
                    layui.layer.tips('点击此处返回用户列表', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                },500)
            }
        })
        layui.layer.full(index);
        window.sessionStorage.setItem("index",index);
        //改变窗口大小时，重置弹窗的宽高，防止超出可视区域（如F12调出debug的操作）
        $(window).on("resize",function(){
            layui.layer.full(window.sessionStorage.getItem("index"));
        })
    }
    //编辑用户
    function editUser(edit){
        var index = layui.layer.open({
            title : '编辑用户',
            type : 2,
            content : "users_edit?id="+edit.id,
            success : function(layero, index){
                var body = layui.layer.getChildFrame('body', index);
                setTimeout(function(){
                    layui.layer.tips('点击此处返回用户列表', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                },500)
            }
        })
        layui.layer.full(index);
        window.sessionStorage.setItem("index",index);
        //改变窗口大小时，重置弹窗的宽高，防止超出可视区域（如F12调出debug的操作）
        $(window).on("resize",function(){
            layui.layer.full(window.sessionStorage.getItem("index"));
        })
    }
    $(".addNews_btn").click(function(){
        addUser();
    })

    //批量删除
    $(".delAll_btn").click(function(){
        var checkStatus = table.checkStatus('userListTable'),
            data = checkStatus.data,
            ids = [];
        if(data.length > 0) {
            for (var i in data) {
                ids.push(data[i].id);
            }
            layer.confirm('确定删除选中的用户？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    type:'post',
                    url:'users_delete',
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
            layer.msg("请选择需要删除的用户");
        }
    })

    //启用
    $(".userstatus_btn").click(function(){
        userstatus('true');
    })
    //禁用
    $("._userstatus_btn").click(function(){
        userstatus('false');
    })

    function userstatus(status_value){
        var checkStatus = table.checkStatus('userListTable'),
            data = checkStatus.data,
            ids = [];
        if(data.length > 0) {
            for (var i in data) {
                ids.push(data[i].id);
            }
            layer.confirm('确定启用/禁用此用户？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    type:'post',
                    url:'users_status',
                    traditional:true,
                    data:{ids : ids,status:status_value,csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()},
                    dataType: "json",
                    async:false,
                    success:function(data){
                        tableIns.reload();
                        layer.close(index);
                    }
                })
            })
        }else{
            layer.msg("请选择用户");
        }
    }

    $(".export_btn").click(function () {
        url = 'activity_userlist_export?activity_id='+$('#activity_id').val();
        url += '&key='+$(".searchVal").val();
        url+='&start_time='+$(".start_time").val();
        url+='&end_time='+$(".end_time").val();
        $('#downloadexcel').attr('src',url);
    })

    // $("#btn_upload_excel").click(function () {
    //     $("#btn_upload_file").click();
    // })


    //列表操作
    table.on('tool(userList)', function(obj){
        var layEvent = obj.event,
            data = obj.data;

        if(layEvent === 'status'){ //编辑
            editUser(data);
        }else if(layEvent === 'usable'){ //启用禁用
            var _this = $(this),
                usableText = "是否确定禁用此用户？",
                btnText = "已禁用";
            if(_this.text()=="已禁用"){
                usableText = "是否确定启用此用户？",
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
        }
    });

})