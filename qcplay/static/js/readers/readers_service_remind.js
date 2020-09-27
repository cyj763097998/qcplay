layui.use(['form','layer','element','laydate'],function(){
    var form = layui.form
    layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery;
    laydate = layui.laydate,

        laydate.render({
            elem: '#service_date'
            ,type: 'date'
        });

    form.on("submit(meaasge_send)",function(data){
        layer.confirm('确定要发送服务通知吗？',{icon:3, title:'提示信息'},function(index){
            $.post("readers_service_remind",data.field,function(res){
                if (res.code == '1') {
                    setTimeout(function(){
                        top.layer.msg("服务发送成功！");
                    },1000);
                }
                else{
                    $('.layui-layer-tips').remove();
                    $.each(res.error,function (k,v) {
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
            layer.close(index);
        });
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