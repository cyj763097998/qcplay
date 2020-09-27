layui.use(['form','layer','table','element','upload','laydate'],function(){
    var form = layui.form
    layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery;
    laydate = layui.laydate,
        table = layui.table;

    laydate.render({
        elem: '#start_time'
        ,type: 'datetime'
    });
    laydate.render({
        elem: '#end_time'
        ,type: 'datetime'
    });
    laydate.render({
        elem: '#enter_start_time'
        ,type: 'datetime'
    });
    laydate.render({
        elem: '#enter_end_time'
        ,type: 'datetime'
    });


    var upload = layui.upload,element = layui.element;

    //普通图片上传
    var uploadInst = upload.render({
        elem: '#btn_upload_img'
        ,url: '/xyadmin/activity/upload_activity_cover_img'
        ,accept:'images'
        ,data:{csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()}
        ,xhr:xhrOnProgress
        ,progress:function(value){//上传进度回调 value进度值
            element.progress('progress_upload_img', value+'%');//设置页面进度条
        }
        ,before: function(obj){
            //预读本地文件示例，不支持ie8
            obj.preview(function(index, file, result){
                $('.JSimgshow').attr('src', result); //图片链接（base64）
            });
        }
        ,done: function(res){
            //如果上传失败
            if(res.code != '1'){
                return layer.msg('上传失败');
            }else{
                $('#error_text').html('');
                $('#cover_img').val(res.img_url);
                $('#cover_img1').val(res.img_url);
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

    //普通图片上传
    var uploadImg = upload.render({
        elem: '#btn_upload_detailimg'
        ,url: '/xyadmin/activity/upload_activity_detailcover_img'
        ,accept:'images'
        ,data:{csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()}
        ,xhr:xhrOnProgress
        ,progress:function(value){//上传进度回调 value进度值
            element.progress('progress_upload_img', value+'%');//设置页面进度条
        }
        ,before: function(obj){
            //预读本地文件示例，不支持ie8
            obj.preview(function(index, file, result){
                $('#detailcover_img_url').attr('src', result); //图片链接（base64）
            });
        }
        ,done: function(res){
            //如果上传失败
            if(res.code != '1'){
                return layer.msg('上传失败');
            }else{
                $('#error_text').html('');
                $('#detailcover_img').val(res.img_url);
                return layer.msg('上传成功');
            }
            //上传成功
        }
        ,error: function(){
            //演示失败状态，并实现重传
            var errorText = $('#error_text');
            errorText.html('<span style="color: #FF5722;">上传失败</span> <a class="layui-btn layui-btn-xs demo-reload">重试</a>');
            errorText.find('.demo-reload').on('click', function(){
                uploadImg.upload();
            });
        }
    });


    form.on("submit(activity_edit)",function(data){
        //弹出loading
        var index = top.layer.msg('数据提交中，请稍候',{icon: 16,time:false,shade:0.8});
        // 实际使用时的提交信息
        $.post("activity_edit",data.field,function(res){
            if (res.code == '1') {
                setTimeout(function(){
                    top.layer.close(index);
                    top.layer.msg("活动编辑成功！");
                    layer.closeAll("iframe");
                    //刷新父页面
                    parent.location.reload();
                },2000);
            }
            else{
                top.layer.close(index);
                $('.layui-layer-tips').remove();
                $.each(res.error,function (k,v) {
                    //$("."+k).val(v);
                    var obj = $('#'+k);
                    layui.layer.tips(
                        "<span style='color:#FFFFFF'><i style='font-size:18px;color:yellow' class='icon iconfont icon-jinggaoTips'></i>"+v+"</span>",
                        obj,
                        {
                            tips: [2, '#FF6666'], //#007799设置tips方向和颜色 类型：Number/Array，默认：2 tips层的私有参数。支持上右下左四个方向，通过1-4进行方向设定。如tips: 3则表示在元素的下面出现。有时你还可能会定义一些颜色，可以设定tips: [1, '#c00']
                            tipsMore: true, //是否允许多个tips 类型：Boolean，默认：false 允许多个意味着不会销毁之前的tips层。通过tipsMore: true开启
                            time:0,  //2秒后销毁
                            icon:1
                        }
                    );
                })
            }
        })

        return false;
    })

    form.on('radio',function (data) {
        var coverimg_type = $("input:radio[name='cover_img_type']:checked").val();
        console.log(coverimg_type, 'coverimg_type')
        if(coverimg_type=='transverse'){
            $(".portraitcover_img").hide();
            $(".transversecover_img").show();
        }
        if(coverimg_type=='portrait'){
            $(".portraitcover_img").show();
            $(".transversecover_img").hide();
        }
        if(!coverimg_type || coverimg_type == 'undefined' || coverimg_type == '' || coverimg_type == null){
            $(".portraitcover_img").hide();
            $(".transversecover_img").show();
        }

    })

        //活动报名字段
    //活动报名信息字段列表
    var field_data = eval('['+$("input[name='enter_explain_fields']").val().replace(new RegExp(";","g"),',')+']')
    var tableIns = table.render({
        elem: '#activityFields',
        cols : [[
            {field: 'text', title: '信息名称', align:'center'},
            {field: 'name', title: '字段名称', minWidth:100, align:"center"},
            {title: '操作', minWidth:250, templet:'#activityFieldBar',fixed:"right",align:"center"}
        ]],
        data:field_data
    });
    //添加报名信息按钮
    $('#btn-add-field').click(function () {
        var text = $('#field-text').val();
        if(text==''){
            alert('请输入信息名称');
            return false;
        }
        var name = $('#field-name').val();
        if(name==''){
            alert('请输入字段名称');
            return false;
        }
        var name_haved = false;
        $.each(field_data,function (i,item) {
            if(item['name'].indexOf(name)>-1){
                name_haved = true;
                alert('字段名称已存在');
                return false;
            }
        })
        if(name_haved){
            return false;
        }
        var str = ";{'name':'"+name+"','text':'"+text+"','value':''}";
        $("input[name='enter_explain_fields']").val($("input[name='enter_explain_fields']").val()+str);
        field_data = eval('['+$("input[name='enter_explain_fields']").val().replace(new RegExp(";","g"),',')+']')
        table.render({
            elem: '#activityFields',
            cols : [[
                {field: 'text', title: '信息名称', align:'center'},
                {field: 'name', title: '字段名称', minWidth:100, align:"center"},
                {title: '操作', minWidth:250, templet:'#activityFieldBar',fixed:"right",align:"center"}
            ]],
            data:field_data
        });
        $('#field-text').val('');
        $('#field-name').val('');
    })

    //删除扩展字段
    table.on('tool(activityFields)', function(obj){
        var layEvent = obj.event,
            data = obj.data;
        if(layEvent === 'del'){ //删除
            layer.confirm('确定删除？',{icon:3, title:'提示信息'},function(index){
                for(var i=0;i< field_data.length;i++) {
                    if(field_data[i]['name'].indexOf(data.name)==-1){
                        continue;
                    }
                    // if(i<=2){
                    //     alert('前三项不能删除');
                    //     continue;
                    // }
                    if(field_data[i]['name'].indexOf(data.name)>-1){
                        field_data.splice($.inArray(field_data[i],field_data),1);
                        var strremove = ';'+JSON.stringify(data).replace(new RegExp("\"","g"),'\'');
                        if(field_data.length==0){
                            strremove =JSON.stringify(data).replace(new RegExp("\"","g"),'\'');
                        }
                        $("input[name='enter_explain_fields']").val($("input[name='enter_explain_fields']").val().replace(strremove,''));
                        table.render({
                            elem: '#activityFields',
                            cols : [[
                                {field: 'text', title: '信息名称', align:'center'},
                                {field: 'name', title: '字段名称', minWidth:100, align:"center"},
                                {title: '操作', minWidth:250, templet:'#activityFieldBar',fixed:"right",align:"center"}
                            ]],
                            data:field_data
                        });
                    }
                }
                layer.close(index);
            });
        }
    })

    //格式化时间
    function filterTime(val){
        if(val < 10){
            return "0" + val;
        }else{
            return val;
        }
    }

    setTimeout(function () {
        var coverimgtype = $('#coverimg').attr('data-type')
        if(coverimgtype=="transverse"){

            $(".portraitcover_img").hide();
            $(".transversecover_img").show();
        }

        if(coverimgtype=="portrait"){

            $(".portraitcover_img").show();
            $(".transversecover_img").hide();
        }
        if(!coverimgtype || coverimgtype == 'undefined' || coverimgtype == '' || coverimgtype == null){

            $(".portraitcover_img").hide();
            $(".transversecover_img").show();
        }
    },10)
    //定时发布
    var time = new Date();
    var submitTime = time.getFullYear()+'-'+filterTime(time.getMonth()+1)+'-'+filterTime(time.getDate())+' '+filterTime(time.getHours())+':'+filterTime(time.getMinutes())+':'+filterTime(time.getSeconds());

})

