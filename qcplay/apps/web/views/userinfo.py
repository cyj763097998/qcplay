from django.utils.safestring import mark_safe

from apps.stark.service.v1 import StarkModelForm, StarkHandler, get_choice_text, Option
from web import models


class UserInfoModelForm(StarkModelForm):
    """
    修改字段显示顺序
    自定义展示顺序，因为原理用的ModelForm，所以这里直接引用修改即可
    """
    class Meta:
        model = models.UserInfo
        fields = ['name', 'password', 'nickname', 'gender', 'phone', 'email', 'roles']


class UserInfoHandler(StarkHandler):
    '''
    def display_reset_pwd(self, obj=None, is_header=None, *args, **kwargs):  # 自定义额外字段，然后加到list_display中即可
        if is_header:
            return '重置密码'
        reset_url = self.reverse_commons_url(self.get_url_name('rest_pwd'), pk=obj.pk)  # 带上id 反向生成别名
        return mark_safe('<a href="%s" class="layui-btn layui-btn-primary layui-btn-sm">重置密码</a>' % reset_url)
    '''
    #字段显示
    #list_display = ['nickname', get_choice_text('性别', 'gender'), 'phone', 'email', display_reset_pwd]
    list_display = ['nickname', get_choice_text('性别', 'gender'), 'phone', 'email' ]
    # 加上模糊搜索
    search_list = ['nickname__contains', 'name__contains']
    # 加上组合搜索
    search_group = [
        Option(field='gender'),
        Option(field='roles', is_multi=True),
    ]

    model_form_class = UserInfoModelForm  # 引用

