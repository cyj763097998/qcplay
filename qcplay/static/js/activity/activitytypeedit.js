layui.use(['form','layer','element','upload','laydate'],function(){
    var form = layui.form
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery;
           laydate = layui.laydate,
        table = layui.table;

    var upload = layui.upload,element = layui.element;

    form.on("submit(activitytype_edit)",function(data){
        //弹出loading
        var index = top.layer.msg('数据提交中，请稍候',{icon: 16,time:false,shade:0.8});
        // 实际使用时的提交信息
         $.post("activitytype_edit",data.field,function(res){
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