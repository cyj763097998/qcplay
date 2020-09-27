import json
import sys

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.shortcuts import render, redirect
import django.utils.timezone as timezone
from django.views.generic.base import View
from django.contrib.auth.hashers import check_password


from apps.rbac.service.init_permission import init_permission
from web.models import UserInfo
from apps.web.utils.SHA1 import gen_sha1


class LoginView(View):
    def get(self, request):
        #permission_dict = request.session.get(settings.PERMISSION_SESSION_KEY)
        #if permission_dict:
            #return redirect('/rbac/menu/list')
        return render(request, 'login.html')

    def post(self, request):
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')

        try:
            item = UserInfo.objects.get(name=username)
        except ObjectDoesNotExist:
            response_data = {}
            response_data['status'] = 'false'
            response_data['info'] = '用户名错误!'
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        #print((password, item.password))
        #print(check_password(password, item.password))
        if check_password(password, item.password):
            user_obj = UserInfo.objects.filter(name=username, password=item.password).first()
            init_permission(user_obj, request)  # 调用init_permission，初始化权限
            #user_obj.lastlogintime = timezone.now()
            #user_obj.save()

            response_data = {}
            response_data['status'] = 'true'
            response_data['url'] = '/rbac/menu/list/'
            response_data['info'] = '登录成功'
            request.session["username"] = username
            request.session["userid"] = user_obj.id
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        else:
            response_data = {}
            response_data['status'] = 'false'
            response_data['info'] = '密码错误!'
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        '''
        if not user_obj:
            response_data = {}
            response_data['status'] = 'false'
            response_data['info'] = '用户名或密码错误!'
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        else:
            init_permission(user_obj, request)  # 调用init_permission，初始化权限
            user_obj.lastlogintime = timezone.now()
            user_obj.save()

            response_data = {}
            response_data['status'] = 'true'
            response_data['url'] = '/rbac/menu/list'
            request.session["username"] = username
            request.session["userid"] = user_obj.id
            """
            for key,value in request.session.items():
                print(key)
                print('+'*50)
                print(value)
            """
            return HttpResponse(json.dumps(response_data), content_type="application/json")
            '''


class IndexView(View):
    def get(self,request):
        #(request.session["username"])
        return render(request, 'index.html')

class LooutView(View):
    def get(self,request):
        request.session.delete()
        return redirect('/login/')