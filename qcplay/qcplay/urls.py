"""qcplay URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""


from django.conf.urls import url,include
from django.contrib import admin
from stark.service.v1 import site
from web.views import views


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    # 路由系统
    url(r'^stark/', site.urls),
    # 权限系统
    url(r'^rbac/', include(('rbac.urls', 'rbac'), namespace='rbac')),


    url(r'^select2/', include("django_select2.urls")),

    # 用户
    #url(r'^$', views.LoginView.as_view(), name='login'),
    url(r'^login/', views.LoginView.as_view(), name='login'),
    url(r'^logout/', views.LooutView.as_view(), name='logout'),
    url(r'^index/', views.IndexView.as_view(), name='index'),

]
