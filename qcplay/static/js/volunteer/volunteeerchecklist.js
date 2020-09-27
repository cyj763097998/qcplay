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
        url : '/xyadmin/volunteer/volunteer_checkdata',
        cellMinWidth : 95,
        cellMinHeight:120,
        page : true,
        height : "full-125",
        limits : [10,15,20,25],
        limit : 20,
        id : "courseListTable",
        cols : [[
            {type: "checkbox", fixed:"left"},
            {field: 'id', title: '编号', minWidth:80, align:"center"},
            {field: 'real_name', title: '姓名', align:'center',minWidth:100},
            {field: 'mobile', title: '手机号', align:'center',minWidth:150},
            {field: 'gender', title: '性别', align:'center',templet:function (d) {
                    return d.istrain ? "男" : "女";
                }},
            {field: 'education', title: '学历', align:'center'},
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
            {field: 'service_time', title: '服务时间', align:'center'},
            {field: 'create_time', title: '审核日期', align:'center',minWidth:200},
            {field: 'self_statement', title: '自我陈述', align:'center'},
            {title: '操作',minWidth:80, templet:'#courseListBar',fixed:"right",align:"center"}
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
                category:$(".category").val(),
                starttime:$(".starttime").val(),
                endtime:$(".endtime").val(),

            }
        })
    });


    //批量通过
    $(".checked_btn").click(function(){
        var checkStatus = table.checkStatus('courseListTable'),
            data = checkStatus.data,
            ids = [];
        if(data.length > 0) {
            for (var i in data) {
                ids.push(data[i].id);
            }
            layer.confirm('确定通过选中的志愿者？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    type:'post',
                    url:'volunteer_checked',
                    traditional:true,
                    data:{ids : ids,ischecked:'true',csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()},
                    dataType: "json",
                    async:false,
                    success:function(data){
                        tableIns.reload();
                        layer.close(index);
                    }
                })
            })
        }else{
            layer.msg("请选择需要通过的志愿者");
        }
    })
    $(".export_btn").click(function () {
        //exportCourse();
        url = 'volunteer_check_export?key='+$(".searchVal").val();
        url+='&volunteer_type='+$(".volunteer_type").val();
        url+='&starttime='+$(".starttime").val();
        url+='&endtime='+$(".endtime").val();
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
        if(layEvent === 'checked'){ //通过
            layer.confirm('确定要通过？',{icon:3, title:'提示信息'},function(index){
                $.post("volunteer_checked",{
                    ids : data.id,  //将需要删除的newsId作为参数传入
                    ischecked:'true',
                    csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
                },function(data){
                    tableIns.reload();
                    layer.close(index);
                })
            });
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