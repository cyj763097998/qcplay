layui.use(['form','layer','table','laydate'],function(){
    var form = layui.form,table = layui.table,laydate = layui.laydate;
    layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery;

    //常规用法
    laydate.render({
        elem: '#starttime',
        value: new Date(new Date().setDate(-7))
    });
    laydate.render({
        elem: '#endtime',
        value: new Date()
    });
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'));
    var series_data =[]
    getdata();
    option = {
        title : {
            text: '数字资源统计图表',
            subtext: '',
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        series : [
            {
                name: '访问来源',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data:series_data,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    //搜索【此功能需要后台配合，所以暂时没有动态效果演示】
    $(".search_btn").on("click",function(){
        series_data.splice(0,series_data.length);
        getdata();
        myChart.clear();
        myChart.setOption(option);
        table.reload('dataListTable');
    });
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    function getdata() {
        $.ajax({
            type:'get',
            url:'resource_visitlog_echart_data',
            traditional:true,
            data:{csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()},
            dataType: "json",
            async:false,
            success:function(res){
                $.each(res.data,function (i,item) {
                    series_data.push({'name':item[0],'value':item[1]});
                })
            }
        })
    }

    var tableIns = table.render({
        elem: '#dataList',
        id : "dataListTable",
        cols : [[
            {field: 'name', title: '数字资源', minWidth:400, align:"center"},
            {field: 'value', title: '访问量', minWidth:200, align:'center'},
        ]],
        data:series_data,
        even: true,
        page:false,
        limit:10000
    });

})

