layui.use(['form','layer','element','upload','laydate'],function(){
    var form = layui.form
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery;
           laydate = layui.laydate,
        table = layui.table;

    var upload = layui.upload,element = layui.element;
        //普通图片上传
    var uploadInst = upload.render({
        elem: '#btn_upload_img'
        ,url: '/xyadmin/page_management/upload_downloadurl_cover_img'
        ,accept:'images'
        ,size: 512
        ,data:{csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()}
        ,xhr:xhrOnProgress
        ,progress:function(value){//上传进度回调 value进度值
            element.progress('progress_upload', value+'%');//设置页面进度条
        }
        ,before: function(obj){
         //预读本地文件示例，不支持ie8
        obj.preview(function(index, file, result){
         $('#cover_img_url').attr('src', result); //图片链接（base64）
         });
        }
        ,done: function(res){
        //如果上传失败
         if(res.code != '1'){
            return layer.msg('上传失败');
         }else{
             $('#error_text').html('');
             $('#cover_img').val(res.img_url);
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

    form.on("submit(volunteerstation_edit)",function(data){
        //弹出loading
        var index = top.layer.msg('数据提交中，请稍候',{icon: 16,time:false,shade:0.8});
        // 实际使用时的提交信息
         $.post("downloadurl_edit",data.field,function(res){
             if (res.code == '1') {
                setTimeout(function(){
                top.layer.close(index);
                top.layer.msg("编辑成功！");
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

    //格式化时间
    function filterTime(val){
        if(val < 10){
            return "0" + val;
        }else{
            return val;
        }
    }
    //定时发布
    var time = new Date();
    var submitTime = time.getFullYear()+'-'+filterTime(time.getMonth()+1)+'-'+filterTime(time.getDate())+' '+filterTime(time.getHours())+':'+filterTime(time.getMinutes())+':'+filterTime(time.getSeconds());

})