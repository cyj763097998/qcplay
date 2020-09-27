import json
import sys
from datetime import datetime

from django.conf.urls import url
from django.http import HttpResponse
from django.utils.safestring import mark_safe

from apps.stark.service.v1 import StarkModelForm, StarkHandler,get_choice_text
from web import models

from apps.web.utils import mysqlHelper


class SiteDirModelForm(StarkModelForm):
    """
    修改字段显示顺序
    自定义展示顺序，因为原理用的ModelForm，所以这里直接引用修改即可
    """
    class Meta:
        model = models.SiteDir
        fields = '__all__'


class SiteDirHandler(StarkHandler):

    #字段显示
    list_display = ['title', 'path' ]  # 自定义显示
    # 加上模糊搜索
    search_list = ['title__contains', 'path__contains']


    model_form_class = SiteDirModelForm  # 引用

