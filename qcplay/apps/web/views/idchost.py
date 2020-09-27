import json
import sys
from datetime import datetime

from django.conf.urls import url
from django.http import HttpResponse
from django.utils.safestring import mark_safe

from apps.stark.service.v1 import StarkModelForm, StarkHandler,get_choice_text
from web import models

from apps.web.utils import mysqlHelper


class IdcHostModelForm(StarkModelForm):
    """
    修改字段显示顺序
    自定义展示顺序，因为原理用的ModelForm，所以这里直接引用修改即可
    """
    class Meta:
        model = models.IdcHost
        fields = '__all__'


class IdcHostHandler(StarkHandler):

    #字段显示
    list_display = ['title', 'outernet_ip','intranet_ip',get_choice_text('状态', 'status')]  # 自定义显示
    # 加上模糊搜索
    search_list = ['title__contains', 'outernet_ip__contains']

    #自定义按钮-同步按钮
    custom_btn = True


    @property
    def get_sync_hosts_url_name(self):
        """
        获取添加页面URL的name
        :return:
        """
        return self.get_url_name('sync_hosts')

    def sync_hosts_view(self,request):
        if request.method == 'POST':
            db_wn = mysqlHelper.MyDB('47.114.180.220','qcplay','qcplay!@#$','wn_config')
            db_qc = mysqlHelper.MyDB('localhost','root','1qaz0okm','qcplay')

            sql_wn = "select servername,ip,lip from wn_ip_wn;"
            res_wn = db_wn.getAllResult(sql_wn)

            for row in res_wn:
                sql = "insert into web_idchost(title,outernet_ip,intranet_ip,status) values('%s','%s','%s',1);"%(row)
                res = db_qc.insertOrUdateInfo(sql)

            response_data = {}
            response_data['status'] = 'success'

            return HttpResponse(json.dumps(response_data), content_type="application/json")

    #urls
    def extra_urls(self):
        return [url(r'^sync_hosts/$', self.wrapper(self.sync_hosts_view), name=self.get_sync_hosts_url_name),]

    model_form_class = IdcHostModelForm  # 引用

