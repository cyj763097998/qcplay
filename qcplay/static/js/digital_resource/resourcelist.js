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
        url : '/xyadmin/digital_resource/resources_data',
        cellMinWidth : 95,
        cellMinHeight:120,
        page : false,
        height : "full-125",
        limits : [10,15,20,25],
        limit : 20,
        id : "ebookListTable",
        cols : [[
            {type: "checkbox", fixed:"left"},
            {field: 'id', title: 'ID', width:50, align:"center"},
            {field: 'resourcecolumn__title', title: '栏目名称', minWidth:100, align:"center"},
            {field: 'title', title: '资源名称', minWidth:100, align:"left"},
            {field: 'url', title: '链接地址', minWidth:200, align:"left"},
            {field: 'create_time', title: '创建时间', minWidth:200, align:"center"},
            {title: '操作', minWidth:250, templet:'#ebookListBar',fixed:"right",align:"center"}
        ]]
    });

    //搜索【此功能需要后台配合，所以暂时没有动态效果演示】
    $(".search_btn").on("click",function(){
        table.reload("ebookListTable",{
            page: {
                curr: 1 //重新从第 1 页开始
            },
            where: {
                key: $(".searchVal").val(),  //搜索的关键字
                category:$(".category").val(),
                starttime:$(".starttime").val(),
                endtime:$(".endtime").val(),
                is_recmd:$(".is_recmd").val(),
                is_show:$(".is_show").val()
            }
        })
    });

    //添加电子书
    function addQuestionbank(edit){
        var index = layui.layer.open({
            title : '添加资源',
            type : 2,
            content : "resources_add",
            success : function(layero, index){
                var body = layui.layer.getChildFrame('body', index);
                setTimeout(function(){
                    layui.layer.tips('点击此处返回志愿者列表', '.layui-layer-setwin .layui-layer-close', {
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
    //编辑志愿者岗位
    function editquestionbank(edit){
        var index = layui.layer.open({
            title : '编辑资源',
            type : 2,
            content : "resources_edit?id="+edit.id,
            success : function(layero, index){
                var body = layui.layer.getChildFrame('body', index);
                setTimeout(function(){
                    layui.layer.tips('点击此处返回志愿者列表', '.layui-layer-setwin .layui-layer-close', {
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

    $(".addEbook_btn").click(function(){
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
            layer.confirm('确定删除选中的岗位？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    type:'post',
                    url:'volunteer_station_delete',
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


    $(".export_btn").click(function () {
        url = 'ebooks_export?key='+$(".searchVal").val();
        url+='&category='+$(".category").val();
        url+='&starttime='+$(".starttime").val();
        url+='&endtime='+$(".endtime").val();
        url+='&is_recmd='+$(".is_recmd").val();
        url+='&is_show='+$(".is_show").val();
        $('#downloadexcel').attr('src',url);
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
            layer.confirm('确定删除此资源？',{icon:3, title:'提示信息'},function(index){
                $.post("resources_delete",{
                    ids : data.id,  //将需要删除的newsId作为参数传入
                    csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
                },function(data){
                    tableIns.reload();
                    layer.close(index);
                })
            });
        }else if(layEvent === 'sortup'){ //向上
            $.post("resources_sortup",{
                id : data.id,  //将需要删除的newsId作为参数传入
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
            },function(data){
                if (data['code'] == 'success'){
                    location.reload();
                    layer.msg('向上移动成功');
                }else if (data['code'] == 'top'){
                    layer.msg('已到最顶部');
                }
                else{
                    layer.msg('出错了');
                }
                tableIns.reload();
            })
        }else if(layEvent === 'sortdown'){ //向下
            $.post("resources_sortdown",{
                id : data.id,  //将需要删除的newsId作为参数传入
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
            },function(data){
                if (data['code'] == 'success'){
                    location.reload();
                    layer.msg('向下移动成功');
                }else if (data['code'] == 'bottom'){
                    layer.msg('已到最底部');
                }
                else{
                    layer.msg('出错了');
                }
                tableIns.reload();
            })
        }
    });

})
