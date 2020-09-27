import json
import sys
from datetime import datetime

from django.conf.urls import url
from django import forms
from django.forms import model_to_dict, ModelChoiceField, ChoiceField
from django.http import HttpResponse,JsonResponse
from django.core import serializers
from django.utils.safestring import mark_safe
from django_select2.forms import Select2Widget, ModelSelect2Widget

from apps.stark.service.v1 import StarkModelForm, StarkHandler,get_choice_text
from web import models

from apps.web.utils import mysqlHelper


class WebSiteModelForm(StarkModelForm):
    """
    修改字段显示顺序
    自定义展示顺序，因为原理用的ModelForm，所以这里直接引用修改即可
    """
    '''
    addr = ModelChoiceField(
        queryset = models.Repo.objects.all(),
        label = u"仓库地址",
        widget = ModelSelect2Widget(model=models.Repo, search_fields=['addr__icontains'],),
    )
    '''

    class Meta:
        model = models.WebSite
        #fields = '__all__'
        exclude = ("add_time",)
    def __init__(self, *args, **kwargs):
        super(WebSiteModelForm, self).__init__(*args, **kwargs)
        #layui自带input搜索：lay-search
        self.fields['addr'] = ModelChoiceField(label = u"仓库地址",empty_label=u"直接选择或搜索选择",queryset=models.Repo.objects.all(), widget=forms.Select(
            attrs={'class': 'layui-input-inline',"lay-search":True}))


class WebSiteHandler(StarkHandler):

    #字段显示
    list_display = ['title', 'desc', 'target', 'sitedir', 'wtype', 'addr', ]  # 自定义显示
    # 加上模糊搜索
    search_list = ['title__contains', 'addr__contains']

    @property
    def get_repo_url(self):
        """
        获取添加页面URL的name
        :return:
        """
        return self.get_url_name('get_repo')

    def get_repo_view(self, request):
        repotype = request.POST.get('type')

        if repotype:
            repo_queryset = models.Repo.objects.filter(rtype=repotype).all()
        return JsonResponse({'status':True, 'data':serializers.serialize('json',repo_queryset)})





    def extra_urls(self):
        return [url(r'^get_repo/$', self.wrapper(self.get_repo_view), name=self.get_repo_url),]

    model_form_class = WebSiteModelForm  # 引用

