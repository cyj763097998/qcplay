"""MxOnline URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls import include
#from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import TemplateView

#from apps.users import views
from django.views.static import serve

from MxOnline.settings import MEDIA_ROOT
#from MxOnline.settings import STATIC_ROOT

from apps.users.views import IndexView, LoginView, LogoutView, RegisterView, ActiveUserView, ForgetPwdView, ResetView, ModifyPwdView, LoginUnsafeView
from apps.organization.views import OrgView, OrgTeacherView, OrgCourseView
from extra_apps import xadmin

from users.views import LoginUnsafeView



urlpatterns = [
    path('xadmin/', xadmin.site.urls),
    path('', IndexView.as_view(), name='index'),
    path('index/', IndexView.as_view(), name='index'),
    path('login/', LoginView.as_view(), name='login'),
    #测试sql注入
    #path('login/', LoginUnsafeView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name="logout"),
    path('register/', RegisterView.as_view(), name='register'),
    path('captcha', include('captcha.urls')),
    re_path('active/(?P<active_code>.*)/', ActiveUserView.as_view(), name='user_active'),
    path('forgetpwd/', ForgetPwdView.as_view(), name='forget_pwd'),
    re_path('reset/(?P<active_code>.*)/', ResetView.as_view(), name='reset_pwd'),
    path('modify_pwd/', ModifyPwdView.as_view(), name='modify_pwd'),
    path('org/', include('organization.urls', namespace='org')),
    path('course/', include('course.urls', namespace='course')),
    path('users/', include('users.urls', namespace='users')),
    re_path(r'^media/(?P<path>.*)', serve, {"document_root": MEDIA_ROOT }),
    #静态文件
    #re_path(r'^static/(?P<path>.*)', serve, {"document_root": STATIC_ROOT }),
]


# 全局404页面配置
handler404 = 'users.views.pag_not_found'
# 全局500页面配置
handler500 = 'users.views.page_error'