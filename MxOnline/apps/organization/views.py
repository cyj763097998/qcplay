from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
from django.views.generic.base import View

from organization.models import CourseOrg, CityDict, Teacher
from pure_pagination import Paginator, PageNotAnInteger

from operation.models import UserFavorite

from course.models import Course
from organization.form import UserAskForm

from utils.mixin_utils import LoginRequiredMixin

class OrgView(View):
    '''课程机构'''
    def get(self, request):
        #取出所有课程机构
        all_orgs = CourseOrg.objects.all()
        #取出所有城市
        all_citys = CityDict.objects.all()

        # 机构搜索功能
        search_keywords = request.GET.get('keywords', '')
        if search_keywords:
            # 在name字段进行操作,做like语句的操作。i代表不区分大小写
            # or操作使用Q
            all_orgs = all_orgs.filter(Q(name__icontains=search_keywords) | Q(desc__icontains=search_keywords))

        city_id = request.GET.get('city', '')
        #城市筛选
        if city_id:
            all_orgs = all_orgs.filter(city_id=int(city_id))  #从结果集筛选 filter

        #机构筛选
        category = request.GET.get('ct','')
        if category:
            all_orgs = all_orgs.filter(category=category)

        #机构数
        org_nums = all_orgs.count()

        #热门机构排名
        hot_orgs = all_orgs.order_by('-click_nums')[:3]

        #学习人数和课程数排序
        sort = request.GET.get('sort', '')
        if sort:
            if sort == "students":
                all_orgs.order_by('-students')
            elif sort == "course_nums":
                all_orgs.order_by('-course_nums')

        try:
            page = request.GET.get('page',1)
        except PageNotAnInteger:
            page = 1

        p = Paginator(all_orgs, 1, request=request)
        orgs = p.page(page)

        return render(request, 'org-list.html',{
            'all_orgs': orgs,
            'all_citys': all_citys,
            'org_nums': org_nums,
            'city_id': city_id,
            'category': category,
            'hot_orgs': hot_orgs,
            'sort': sort,
        })

class AddUserAskView(View):
    def post(self, request):
        userask_form = UserAskForm(request.POST)

        if userask_form.is_valid():

            user_ask = userask_form.save(commit=True)
            # 如果保存成功,返回json字符串,后面content type是告诉浏览器返回的数据类型
            return HttpResponse('{"status":"success"}', content_type='application/json')
        else:
            # 如果保存失败，返回json字符串,并将form的报错信息通过msg传递到前端
            #print(dir(userask_form))
            #print(userask_form.has_error('mobile'))
            #print(userask_form.errors['mobile'][0])
            #print(userask_form.errors)
            #print(dir(userask_form.errors['mobile'][0]))
            #if userask_form.has_error('mobile'):
                #return HttpResponse('{"status":"fail","msg": "' + str(userask_form.errors["mobile"][0])+'"}', content_type='application/json')
            #else:
                #return HttpResponse('{"status":"fail","msg": "添加出错"}',content_type='application/json')
            #print(userask_form.errors)
            #for key,error in userask_form.errors:
                #print(error)
            return HttpResponse('{"status":"fail","msg": "添加出错"}', content_type='application/json')
            #return HttpResponse('{"status":"fail","msg": "'+userask_form.errors+'"}', content_type='application/json')

class OrgHomeView(View):
    def get(self, request, org_id):
        current_page = 'home'
        # 根据id找到课程机构
        course_org = CourseOrg.objects.get(id=int(org_id))
        course_org.click_nums += 1
        course_org.save()
        # 判断收藏状态
        has_fav = False
        if request.user.is_authenticated:
            if UserFavorite.objects.filter(user=request.user, fav_id=course_org.id, fav_type=2):
                has_fav = True
        # 反向查询到课程机构的所有课程和老师
        all_course = course_org.course_set.all()[:4]
        all_teacher = course_org.teacher_set.all()[:2]
        #print(all_teacher)
        #print(all_course)
        #return HttpResponse('hello')
        return render(request, 'org-detail-homepage.html', {
            'current_page': current_page,
            'course_org': course_org,
            'all_course': all_course,
            'all_teacher': all_teacher,
            'has_fav': has_fav,
        })

class OrgCourseView(View):
    """
   机构课程列表页
    """
    def get(self, request, org_id):
        current_page = 'course'
        # 根据id取到课程机构
        course_org = CourseOrg.objects.get(id=int(org_id))
        # 通过课程机构找到课程。内建的变量，找到指向这个字段的外键引用
        all_courses = course_org.course_set.all()
        # 判断收藏状态
        has_fav = False
        if request.user.is_authenticated:
            if UserFavorite.objects.filter(user=request.user, fav_id=course_org.id, fav_type=2):
                has_fav = True
        #print(all_courses)
        return render(request, 'org-detail-course.html', {
            'current_page': current_page,
            'all_courses': all_courses,
            'course_org': course_org,
            'has_fav': has_fav,
        })

class OrgDescView(View):
    """
   机构介绍详情页
    """
    def get(self, request, org_id):
        current_page = 'desc'
        course_org = CourseOrg.objects.get(id=int(org_id))
        # 判断收藏状态
        has_fav = False
        if request.user.is_authenticated:
            if UserFavorite.objects.filter(user=request.user, fav_id=course_org.id, fav_type=2):
                has_fav = True
        return render(request, 'org-detail-desc.html', {
            'current_page': current_page,
            'course_org': course_org,
            'has_fav': has_fav,
        })

class OrgTeacherView(View):
    """
   机构讲师详情页
    """
    def get(self, request, org_id):
        current_page = 'teacher'
        course_org = CourseOrg.objects.get(id=int(org_id))
        all_teacher = course_org.teacher_set.all()
        # 判断收藏状态
        has_fav = False
        if request.user.is_authenticated:
            if UserFavorite.objects.filter(user=request.user, fav_id=course_org.id, fav_type=2):
                has_fav = True
        return render(request, 'org-detail-teachers.html', {
            'current_page': current_page,
            'all_teacher': all_teacher,
            'course_org': course_org,
            'has_fav': has_fav,
        })

class AddFavView(View):
    """
    用户收藏和取消收藏
    """
    def post(self, request):
        fav_id = int(request.POST.get('fav_id', 0))
        fav_type = int(request.POST.get('fav_type', 0))
        #print(fav_id, fav_type)
        #print(request.user)
        if not request.user.is_authenticated:
            return HttpResponse('{"status":"fail", "msg":"用户未登录"}', content_type='application/json')
        exist_record = UserFavorite.objects.filter(user=request.user, fav_id=fav_id, fav_type=fav_type)
        #print(dir(exist_record))
        if exist_record:
            exist_record.delete()
            if int(type) == 1:
                course = Course.objects.get(id=int(id))
                course.fav_nums -= 1
                if course.fav_nums < 0:
                    course.fav_nums = 0
                course.save()
            elif int(type) == 2:
                org = CourseOrg.objects.get(id=int(id))
                org.fav_nums -= 1
                if org.fav_nums < 0:
                    org.fav_nums = 0
                org.save()
            elif int(type) == 3:
                teacher = Teacher.objects.get(id=int(id))
                teacher.fav_nums -= 1
                if teacher.fav_nums < 0:
                    teacher.fav_nums = 0
                teacher.save()
            return HttpResponse('{"status": "success", "msg": "收藏"}', content_type='application/json')
        else:
            user_fav = UserFavorite()
            if fav_id > 0 and fav_type > 0:
                user_fav.user = request.user
                user_fav.fav_id = fav_id
                user_fav.fav_type = fav_type
                user_fav.save()
                if int(type) == 1:
                    course = Course.objects.get(id=int(id))
                    course.fav_nums += 1
                    course.save()
                elif int(type) == 2:
                    org = CourseOrg.objects.get(id=int(id))
                    org.fav_nums += 1
                    org.save()
                elif int(type) == 3:
                    teacher = Teacher.objects.get(id=int(id))
                    teacher.fav_nums += 1
                    teacher.save()
                return HttpResponse('{"status": "success", "msg": "已收藏"}', content_type='application/json')
            else:
                return HttpResponse('{"status":"fail", "msg":"收藏出错"}', content_type='application/json')

class TeacherListView(View):
    def get(self, request):
        #print(request.path)
        all_teachers = Teacher.objects.all()
        # 总共有多少老师使用count进行统计
        teacher_nums = all_teachers.count()

        # 搜索功能
        search_keywords = request.GET.get('keywords', '')
        if search_keywords:
            # 在name字段进行操作,做like语句的操作。i代表不区分大小写
            # or操作使用Q
            all_teachers = all_teachers.filter(name__icontains=search_keywords)
        # 人气排序
        sort = request.GET.get('sort','')
        if sort:
            if sort == 'hot':
                all_teachers = all_teachers.order_by('-click_nums')

        #讲师排行榜
        sorted_teacher = Teacher.objects.all().order_by('-click_nums')[:3]

        try:
            page = int(request.GET.get('page',1))
        except PageNotAnInteger:
            page = 1

        p = Paginator(all_teachers, 1, request=request)
        all_teachers = p.page(page)
        return render(request, 'teachers-list.html', {
            'all_teachers': all_teachers,
            'teacher_nums': teacher_nums,
            'sorted_teacher': sorted_teacher,
            'sort': sort,
        })

class TeacherDetailView(LoginRequiredMixin, View):
    def get(self, request, teacher_id):
        teacher = Teacher.objects.get(id=int(teacher_id))
        teacher.click_nums += 1
        teacher.save()

        all_course = Course.objects.filter(teacher=teacher)

        # 教师收藏和机构收藏
        has_teacher_faved = False
        if UserFavorite.objects.filter(user=request.user, fav_type=3, fav_id=teacher.id):
            has_teacher_faved = True

        has_org_faved = False
        if UserFavorite.objects.filter(user=request.user, fav_type=2, fav_id=teacher.org.id):
            has_org_faved = True

        # 讲师排行榜
        sorted_teacher = Teacher.objects.all().order_by('-click_nums')[:3]
        return render(request, 'teacher-detail.html', {
            'teacher': teacher,
            'all_course': all_course,
            'sorted_teacher': sorted_teacher,
        })