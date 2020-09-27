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
        elem: '#ebookList',
        url : '/xyadmin/activity/activitytype_data',
        cellMinWidth : 95,
        cellMinHeight:120,
        page : true,
        height : "full-125",
        limits : [10,15,20,25],
        limit : 20,
        id : "ebookListTable",
        cols : [[
            {type: "checkbox", fixed:"left", width:50},
            {field: 'id', title: 'ID', minWidth:3, maxWidth:5, align:"center"},
            {field: 'name', title: '活动类型名称', minWidth:3, maxWidth:5, align:"center"},
            // {field: 'status', title: '状态', minWidth:3, maxWidth:5, align:"center"},
            {field: 'create_time', title: '创建时间', minWidth:3, maxWidth:5, align:"center"},
            {title: '操作', minWidth:175, templet:'#ebookListBar',fixed:"right",align:"center"}
        ]]
    });


    //添加活动类型
    function addQuestionbank(edit){
        var index = layui.layer.open({
            title : '添加活动类型',
            type : 2,
            area: ['480px', '260px'],
            shade: 0,
            maxmin: true,
            content : "activitytype_add",
            success : function(layero, index){
                var body = layui.layer.getChildFrame('body', index);
                setTimeout(function(){
                    layui.layer.tips('点击此处返回活动类型列表', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                },500)
            }
        })
        //layui.layer.full(index);
        window.sessionStorage.setItem("index",index);
        //改变窗口大小时，重置弹窗的宽高，防止超出可视区域（如F12调出debug的操作）
        $(window).on("resize",function(){
            layui.layer.full(window.sessionStorage.getItem("index"));
        })
    }
    //编辑活动类型
    function editquestionbank(edit){
        var index = layui.layer.open({
            title : '编辑活动类型',
            type : 2,
            area: ['480px', '260px'],
            shade: 0,
            maxmin: true,
            content : "activitytype_edit?id="+edit.id,
            success : function(layero, index){
                var body = layui.layer.getChildFrame('body', index);
                setTimeout(function(){
                    layui.layer.tips('点击此处返回活动类型列表', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                },500)
            }
        })
        //layui.layer.full(index);
        window.sessionStorage.setItem("index",index);
        //改变窗口大小时，重置弹窗的宽高，防止超出可视区域（如F12调出debug的操作）
        $(window).on("resize",function(){
            layui.layer.full(window.sessionStorage.getItem("index"));
        })
    }

    $(".add_btn").click(function(){
        addQuestionbank();
    })

    //批量删除
    $(".delAll_btn").click(function(){
        var checkStatus = table.checkStatus('ebookListTable'),
            data = checkStatus.data,
            ids = [];
        if(data.length > 0) {
            for (var i in data) {
                ids.push(data[i].id);
            }
            layer.confirm('确定删除选中的活动类型？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    type:'post',
                    url:'activitytype_delete',
                    traditional:true,
                    data:{ids : ids,csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()},
                    dataType: "json",
                    async:false,
                    success:function(data){
                        tableIns.reload();
                        layer.close(index);
                    }
                })
                //$.post("users_delete",{
                //    ids : ids,  //将需要删除的newsId作为参数传入
                //    csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
                // },function(data){
                //   tableIns.reload();
                //   layer.close(index);
                //})
            })
        }else{
            layer.msg("请选择需要删除的题目");
        }
    })


    //列表操作
    table.on('tool(ebookList)', function(obj){
        var layEvent = obj.event,
            data = obj.data;

        if(layEvent === 'edit'){ //编辑
            editquestionbank(data);
        }else if(layEvent === 'usable'){ //启用禁用
            var _this = $(this),
                usableText = "是否确定禁用此电子书？",
                btnText = "已禁用";
            if(_this.text()=="已禁用"){
                usableText = "是否确定启用此电子书？",
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
            layer.confirm('确定删除此活动类型？',{icon:3, title:'提示信息'},function(index){
                $.post("activitytype_delete",{
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
