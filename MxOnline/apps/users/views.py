import json

from django.apps.registry import Apps
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.hashers import make_password


from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render

# Create your views here.
from django.urls import reverse
from django.views.generic.base import View
from pure_pagination import Paginator, PageNotAnInteger
from users.models import UserProfile, EmailVerifyRecord

from users.form import LoginForm, RegisterForm, ForgetPwdForm, ModifyPwdForm, ImageUploadForm, UserInfoForm
from utils.email_send import send_register_email
from django.http import Http404, HttpResponseNotFound

from operation.models import UserCourse, UserFavorite, UserMessage

from organization.models import CourseOrg, Teacher

from course.models import Course

from users.models import Banner
from apps.utils.mixin_utils import LoginRequiredMixin


class CustomBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            #不希望用户存在两个，get只能有一个
            user = UserProfile.objects.get(Q(username=username) | Q(email=username))
            if user.check_password(password):
                return user
        except Exception as e:
                return None


class IndexView(View):
    def get(self, request):

        #轮播图
        all_banners = Banner.objects.all().order_by('index')
        #课程
        courses = Course.objects.filter(is_banner=False)[:6]
        #轮播课程
        banner_courses = Course.objects.filter(is_banner=True)[:3]
        #课程机构
        course_orgs = CourseOrg.objects.all()[:15]
        return render(request, 'index.html', {
            'all_banners':all_banners,
            'courses':courses,
            'banner_courses':banner_courses,
            'course_orgs':course_orgs,
        })


class LoginView(View):
    def get(self, request):
        return render(request, 'login.html')
    def post(self, request):
        login_form = LoginForm(request.POST)
        if login_form.is_valid():
            username = request.POST.get('username', '')
            password = request.POST.get('password', '')
            # 成功返回user对象,失败None
            user = authenticate(username=username, password=password)
            if user is not None:
                if user.is_active:
                    login(request, user)
                    return HttpResponseRedirect(reverse('index'))
                else:
                    return render(request, 'login.html', {'msg': '用户未激活', 'login_form': login_form})
            else:
                return render(request, 'login.html', {'msg': '用户名或密码错误', 'login_form':login_form})
        else:
            return render(request, 'login.html', {'login_form':login_form})


class LogoutView(View):
    '''用户登出'''
    def get(self,request):
        logout(request)
        return HttpResponseRedirect(reverse('index'))


class RegisterView(View):
    def get(self, request):
        register_form = RegisterForm()
        return render(request, 'register.html', {'register_form':register_form})
    def post(self, request):
        register_form = RegisterForm(request.POST)
        if register_form.is_valid():
            username = request.POST.get('email', '')
            #如果用户已经存在，则提示错误信息
            if UserProfile.objects.filter(email = username):
                return render(request, 'register.html', {'register_form':register_form, 'msg':'用户已存在'})
            password = request.POST.get('password', '')
            # 实例化一个user_profile对象
            user_profile = UserProfile()
            user_profile.email = username
            user_profile.username = username
            user_profile.is_active = False
            #密码加密
            user_profile.password = make_password(password)
            user_profile.save()
            send_register_email(username, 'register')
            return render(request, 'login.html')
        else:
            return render(request, 'register.html', {'register_form':register_form})


class ActiveUserView(View):
    def get(self, request, active_code):
        all_record = EmailVerifyRecord.objects.filter(code=active_code)
        if all_record:
            for record in all_record:
                #获取对应的邮箱
                email = record.email
                user = UserProfile.objects.get(email=email)
                user.is_active = True
                user.save()
        # 验证码不对的时候跳转到激活失败页面
        else:
            return render(request, 'active_fail.html')
        # 激活成功跳转到登录页面
        return render(request, 'login.html')


class ForgetPwdView(View):
    def get(self, request):
        forget_form = ForgetPwdForm()
        return render(request, 'forgetpwd.html', {'forget_form':forget_form})
    def post(self, request):
        forget_form = ForgetPwdForm(request.POST)
        if forget_form.is_valid():
            email = request.POST.get('email', '')
            send_register_email(email, 'forget')
            return render(request, 'send_success.html')
        else:
            return render(request, 'forgetpwd.html', {'forget_form':forget_form})


class ResetView(View):
    def get(self, request, active_code):
        all_records = EmailVerifyRecord.objects.filter(code=active_code)
        if all_records:
            for record in all_records:
                email = record.email
                return render(request, 'password_reset.html', {"email":email})
        else:
            return render(request, 'active_fail.html')
        return render(request, 'login.html')


class ModifyPwdView(View):
    def post(self, request):
        modify_form = ModifyPwdForm(request.POST)
        if modify_form.is_valid():
            password1 = request.POST.get('password1', '')
            password2 = request.POST.get('password2', '')
            email = request.POST.get('email', '')
            if password1 != password2:
                return render(request, 'password_reset.html', {'email':email, 'msg':'密码不一致', "modify_form":modify_form})
            user = UserProfile.objects.get(email=email)
            user.password = make_password(password2)
            user.save()
            return render(request, 'login.html')
        else:
            email = request.POST.get('email', '')
            return render(request, 'password_reset.html', {'email':email, "modify_form":modify_form})


class UsersInfoView(LoginRequiredMixin,View):
    '''用户个人信息'''
    def get(self,request):
        return render(request,'usercenter-info.html')

    def post(self, request):
        user_info_form = UserInfoForm(request.POST, instance=request.user)
        #print(request.POST)
        if user_info_form.is_valid():
            user_info_form.save()
            return HttpResponse('{"status":"success"}', content_type='application/json')
        else:
            return HttpResponse(json.dumps(user_info_form.errors), content_type='application/json')


class ImageUploadView(LoginRequiredMixin, View):
    '''更改用户头像'''
    def post(self, request):
        # 上传的文件都在request.FILES里面获取，所以这里要多传一个这个参数
        image_form = ImageUploadForm(request.POST, request.FILES)
        #print(dir(image_form))

        if image_form.is_valid():
            '''
            print(dir(image_form))
            print(type(image_form.cleaned_data))
            print(list(image_form.cleaned_data.keys()))
            '''

            image = image_form.cleaned_data['image']
            request.user.image = image
            request.user.save()
            return HttpResponse('{"status":"success"}', content_type='application/json')
        else:
            return HttpResponse('{"status":"fail"}', content_type='application/json')


class UpdatePwdView(View):
    def post(self, request):

        modify_form = ModifyPwdForm(request.POST)
        if modify_form.is_valid():
            pwd1 = request.POST.get('password1', '')
            pwd2 = request.POST.get('password2', '')
            if pwd1 != pwd2:
                return HttpResponse('{"status":"fail","msg":"密码不一致"}', content_type='application/json')
            user = request.user
            user.password = make_password(pwd2)
            user.save()
            return HttpResponse('{"status":"success"}', content_type='application/json')
        else:
            return HttpResponse(json.dumps(modify_form.errors), content_type='application/json')


class SendEmailCodeView(LoginRequiredMixin, View):
    '''发送邮箱修改验证码'''
    def get(self,request):
        email = request.GET.get('email','')

        if UserProfile.objects.filter(email=email):
            return HttpResponse('{"email":"邮箱已存在"}', content_type='application/json')

        send_register_email(email,'update_email')
        return HttpResponse('{"status":"success"}', content_type='application/json')


class UpdateEmailView(View):
    '''修改邮箱'''
    def post(self, request):
        email = request.POST.get('email','')
        code = request.POST.get('code','')
        existed_records = EmailVerifyRecord.objects.filter(email=email, code=code, send_type="update_email")
        if existed_records:
            user = request.user
            user.email = email
            user.save()
            return HttpResponse('{"status":"success"}', content_type='applications/json')
        else:
            return HttpResponse('{"email":"验证码无效"}', content_type='applications/json')


class MyCourseView(View):
    '''我的课程'''
    def get(self, request):
        user_courses = UserCourse.objects.filter(user=request.user)

        return render(request, 'usercenter-mycourse.html', {"user_courses":user_courses})


class MyFavOrgView(View):
    def get(self, request):
        org_lists = []
        fav_orgs = UserFavorite.objects.filter(user=request.user, fav_type=2)
        #print(fav_orgs)
        for fav_org in fav_orgs:
            org_id = fav_org.fav_id
            org = CourseOrg.objects.get(id=org_id)
            org_lists.append(org)

        return render(request, 'usercenter-fav-org.html',{'org_lists':org_lists})


class MyFavTeacherView(View):
    def get(self, request):
        teacher_lists = []
        fav_teachers = UserFavorite.objects.filter(user=request.user, fav_type=3)

        for fav_teacher in fav_teachers:
            teacher_id = fav_teacher.fav_id
            teacher = Teacher.objects.get(id=teacher_id)
            teacher_lists.append(teacher)
        return render(request, 'usercenter-fav-teacher.html',{'teacher_lists':teacher_lists})


class MyFavCourseView(View):
    def get(self, request):
        course_lists = []
        fav_courses = UserFavorite.objects.filter(user=request.user, fav_type=1)

        for fav_course in fav_courses:
            course_id = fav_course.fav_id
            course = Course.objects.get(id=course_id)
            course_lists.append(course)
        return render(request, 'usercenter-fav-course.html', {'course_lists':course_lists})


class MyMessageView(View):
    def get(self, request):
        all_messages = UserMessage.objects.filter(user=request.user.id)

        try:
            page = request.GET.get('page',1)
        except PageNotAnInteger:
            page = 1

        p = Paginator(all_messages, 3, request=request)
        messages = p.page(page)
        return render(request, 'usercenter-message.html', {'messages':messages})


from django.shortcuts import render_to_response
def pag_not_found(request):
    # 全局404处理函数
    response = render_to_response('404.html', {})
    response.status_code = 404
    return response


def page_error(request):
    # 全局500处理函数
    from django.shortcuts import render_to_response
    response = render_to_response('500.html', {})
    response.status_code = 500
    return response


class LoginUnsafeView(View):
    def get(self, request):
        return render(request, "login.html", {})
    def post(self, request):
        user_name = request.POST.get("username", "")
        pass_word = request.POST.get("password", "")

        import MySQLdb
        conn = MySQLdb.connect(host='192.168.16.214', user='root', passwd='1qaz0okm', db='mxonline', charset='utf8')
        cursor = conn.cursor()
        #sql_select = "select * from users_userprofile where email='{0}' and password='{1}'".format(user_name, pass_word)
        #print(sql_select)
        #result = cursor.execute(sql_select)
        cursor.execute("select * from users_userprofile where email='%s' and password='%s'", (user_name, pass_word))
        for row in cursor.fetchall():
            # 查询到用户
            print(row)
        return HttpResponse('test')