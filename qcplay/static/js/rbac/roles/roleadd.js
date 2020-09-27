layui.use(['form','layer'],function(){
    var form = layui.form
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery;

    form.on("submit(roles_add)",function(data){
        //弹出loading
        var index = top.layer.msg('数据提交中，请稍候',{icon: 16,time:false,shade:0.8});
        var oCks = xtree3.GetChecked(); //这是方法
        var permissions = [];
        for (var i = 0; i < oCks.length; i++) {
            permissions.push(oCks[i].value);
        }
        // 实际使用时的提交信息
        $.ajax({
            cache:false,
            type:'POST',
            url: "roles_add",
            traditional:true,
            dataType:'json',
            async: true,
            data:{
                title : $(".title").val(),
                permissions:permissions,
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
            },
            success:function(res){
                if (res.code == '1') {
                    setTimeout(function(){
                    top.layer.close(index);
                    top.layer.msg("角色添加成功！");
                    layer.closeAll("iframe");
                    //刷新父页面
                    parent.location.reload();
                    },2000);
                }else{
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
                            });
                    })
                }
            }
        })
        return false;
    })

    //一套json数据下面会使用，同时供你参考
    var json = eval($('#menu_tree').val());

    var xtree3 = new layuiXtree({
            elem: 'xtree3'                  //必填三兄弟之老大
            , form: form                    //必填三兄弟之这才是真老大
            , data: json //必填三兄弟之这也算是老大
            , isopen: false  //加载完毕后的展开状态，默认值：true
            , ckall: true    //启用全选功能，默认值：false
            , ckallback: function () { } //全选框状态改变后执行的回调函数
            , icon: {        //三种图标样式，更改几个都可以，用的是layui的图标
                open: "&#xe7a0;"       //节点打开的图标
                , close: "&#xe622;"    //节点关闭的图标
                , end: "&#xe621;"      //末尾节点的图标
            }
            , color: {       //三种图标颜色，独立配色，更改几个都可以
                open: "#EE9A00"        //节点图标打开的颜色
                , close: "#EEC591"     //节点图标关闭的颜色
                , end: "#828282"       //末级节点图标的颜色
            }
            , click: function (data) {  //节点选中状态改变事件监听，全选框有自己的监听事件
                //console.log(data.elem); //得到checkbox原始DOM对象
                //console.log(data.elem.checked); //开关是否开启，true或者false
                //console.log(data.value); //开关value值，也可以通过data.elem.value得到
                //console.log(data.othis); //得到美化后的DOM对象
            }
        });
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