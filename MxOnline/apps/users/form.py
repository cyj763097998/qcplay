from captcha.fields import CaptchaField
from django import forms

from users.models import UserProfile


class LoginForm(forms.Form):
    #用户密码不能为空
    username = forms.CharField(required=True)
    password = forms.CharField(required=True, min_length=5)


class RegisterForm(forms.Form):

    email = forms.EmailField(required=True, label='邮箱',
                             error_messages={
                                 'invalid':'邮箱格式不正确',
                                 'required': "邮箱不能为空"
                             })
    password = forms.CharField(required=True, min_length=5,  error_messages={
                                    'min_length': '密码最少5位',
                                    'required': "密码不能为空"})
    # 验证码，字段里面可以自定义错误提示信息
    captcha = CaptchaField(error_messages={'required': "请填写验证码", 'invalid':'验证码错误'})


class ForgetPwdForm(forms.Form):
    email = forms.EmailField(required=True, label='邮箱',
                             error_messages={
                                 'invalid':'邮箱格式不正确',
                                 'required': "邮箱不能为空"
                             })
    # 验证码，字段里面可以自定义错误提示信息
    captcha = CaptchaField(error_messages={'required': "请填写验证码", 'invalid': '验证码错误'})


class ModifyPwdForm(forms.Form):
    '''重置密码'''
    password1 = forms.CharField(required=True, min_length=5, error_messages={
                                    'min_length': '密码最少5位',
                                    'required': "密码不能为空"})
    password2 = forms.CharField(required=True, min_length=5, error_messages={
                                    'min_length': '密码最少5位',
                                    'required': "密码不能为空"})


class ImageUploadForm(forms.ModelForm):
    '''用户更改图像'''

    class Meta:
        model = UserProfile
        fields = ['image']


class UserInfoForm(forms.ModelForm):
    '''个人中心信息修改'''
    class Meta:
        model = UserProfile
        fields = ['nick_name','gender','birthday','adress','mobile']