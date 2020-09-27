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
    var x_data=[];
    var time_data=[];
    var table_data =[];
    getdata();
    option = {
        title: {
            text: '访问量统计'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data:['访问量']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: x_data
        },
        yAxis: {
            type: 'value'
        },
        series: [

            {
                name:'访问量',
                type:'line',
                stack: '总量',
                data:time_data
            }
        ]
    };


    //搜索【此功能需要后台配合，所以暂时没有动态效果演示】
    $(".search_btn").on("click",function(){
        getdata()
        myChart.clear()
        myChart.setOption(option)
    });

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    function getdata() {
        $.ajax({
            type:'get',
            url:'visitlog_echart_data',
            traditional:true,
            data:{
                starttime:$(".starttime").val(),
                endtime:$(".endtime").val(),
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()},
            dataType: "json",
            async:false,
            success:function(res){
                $.each(res.data,function (i,item) {
                        x_data.push(item[0]);
                        time_data.push(item[1]);

                })

                $.each(x_data,function (i,item) {
                    table_data.push({
                        'date':x_data[i],
                        'count':time_data[i],
                    });
                })

            }
        })
    }

    var tableIns = table.render({
        elem: '#dataList',
        id : "dataListTable",
        cols : [[
            {field: 'date', title: '日期',minWidth:400, align:"center"},
            {field: 'count', title: '访问量',minWidth:200, align:'center'},
        ]],

        data:table_data.reverse(),
        limit: 9999999999 //每页默认显示的数量
    });

})