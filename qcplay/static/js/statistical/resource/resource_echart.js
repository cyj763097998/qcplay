layui.use(['form','layer','table'],function(){
    var form = layui.form,table = layui.table;
    layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery;


    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'));
    var series_data =[]
    var result = []
    //数据列表
    getdata();
    var tableIns = table.render({
        elem: '#dataList',
        id : "dataListTable",
        cols : [[
            {field: 'name', title: '活动', minWidth:200,align:"center"},
            {field: 'value', title: '数量', minWidth:200,align:'center'}
        ]],
        data:series_data
    });

    getreaderdata();
    var readertableIns = table.render({
        elem: '#userstatistics',
        id : "userstatistics",
        cols : [[
            {field: 'name', title: '分类', minWidth:200,align:"center"},
            {field: 'value', title: '数量', minWidth:200,align:'center'}
        ]],
        data:reader_data
    });

    getvolunteerdata();
    var volunteertableIns = table.render({
        elem: '#volunteerdataList',
        id : "volunteerdataList",
        cols : [[
            {field: 'name', title: '分类', minWidth:200,align:"center"},
            {field: 'value', title: '数量', minWidth:200,align:'center'}
        ]],
        data:volunteer_data
    });


    option = {
        title : {
            text: '活动统计图表',
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


    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    function getdata() {
        $.ajax({
            type:'get',
            url:'resource_echart_data',
            traditional:true,
            data:{csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()},
            dataType: "json",
            async:false,
            success:function(res){
                series_data = res.data;
                result = res;
            }
        })
    }

    function getreaderdata() {
        $.ajax({
            type:'get',
            url:'readers_data',
            traditional:true,
            data:{csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()},
            dataType: "json",
            async:false,
            success:function(res){
                reader_data = res.data;
                result = res;
            }
        })
    }

    function getvolunteerdata() {
        $.ajax({
            type:'get',
            url:'volunteer_data',
            traditional:true,
            data:{csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()},
            dataType: "json",
            async:false,
            success:function(res){
                volunteer_data = res.data;
                result = res;
            }
        })
    }

})

