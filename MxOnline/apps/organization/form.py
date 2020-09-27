import re

from django import forms

from operation.models import UserAsk


class UserAskForm(forms.ModelForm):
    '''我要咨询'''
    class Meta:
        model = UserAsk
        fields = ['name', 'mobile', 'course_name']
        error_messages = {
            'name': {
                'required': '名字不能为空'
            },
            'mobile': {
                'required': '手机号不能为空'
            },
            'course_name': {
                'required': '课程名不能为空'
            },
        }
    def clean_mobile(self):
        """
        验证手机号的合法性 jim:函数名是clean_字段
        """
        mobile = self.cleaned_data['mobile']
        REGEX_MOBILE = "^1[358]\d{9}$|^147\d{8}$|176\d{8}$"
        p = re.compile(REGEX_MOBILE)
        if p.match(mobile):
            return mobile
        else:
            raise forms.ValidationError(u'手机号不合法', code='mobile_invalid')
