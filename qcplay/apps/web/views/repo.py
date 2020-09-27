import json
import sys
from datetime import datetime

from django.conf.urls import url
from django.forms import TextInput, HiddenInput
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.utils.safestring import mark_safe

from apps.stark.service.v1 import StarkModelForm, StarkHandler,get_choice_text
from web import models

from apps.web.utils import mysqlHelper


class RepoModelForm(StarkModelForm):
    """
    修改字段显示顺序
    自定义展示顺序，因为原理用的ModelForm，所以这里直接引用修改即可
    """
    class Meta:
        model = models.Repo
        exclude = ("add_time",)
        #fields = '__all__'

        # widgets = {
        #     'repoUser': forms.TextInput(attrs={'class': 'form-control'})  # 设置样式
        # }
        #error_messages = {
        #    'repoUser':{'required':'此项是必填的'}                    #设置错误提示信息
        #}

    # def __init__(self, *args, **kwargs):
    #     """高效统一添加样式"""
    #     super(RepoModelForm, self).__init__(*args, **kwargs)
    #     self.fields['repoUser'].widget.attrs.update({'class': 'layui-input layui-disabled', 'disabled':True})
    #     self.fields['repoPassword'].widget.attrs.update({'class': 'layui-input layui-disabled', 'disabled':True})

class RepoHandler(StarkHandler):

    #字段显示
    list_display = ['title', 'rtype', 'addr', ]  # 自定义显示
    # 加上模糊搜索
    search_list = ['title__contains', 'addr__contains']

    model_form_class = RepoModelForm  # 引用
'''
    def change_view(self, request, pk, *args, **kwargs):

        current_change_object = self.get_change_object(request, pk, *args, **kwargs)
        if not current_change_object:
            return HttpResponse('要修改的数据不存在，请重新选择！')

        if request.method == 'GET':
            form = self.model_form_class(instance=current_change_object)
            return render(request, self.change_template or 'stark/change.html', {'form': form})
        form = self.model_form_class(data=request.POST, instance=current_change_object)

        if form.is_valid():

            response = self.save(request, form, True, *args, **kwargs)
            # 在数据库保存成功后，跳转回列表页面(携带原来的参数)。
            return response or redirect(self.reverse_list_url(*args, **kwargs))
        return render(request, self.change_template or 'stark/change.html', {'form': form})
'''
