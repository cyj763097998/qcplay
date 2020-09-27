from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import render
from pure_pagination import Paginator, PageNotAnInteger
# Create your views here.
from django.views.generic.base import View
from course.models import Course, CourseResource, Video
from operation.models import UserFavorite, CourseComments, UserCourse

from apps.utils.mixin_utils import LoginRequiredMixin


class CourseListView(View):
    def get(self, request):
        all_courses = Course.objects.all().order_by('-add_time')
        #热门
        hot_courses =  Course.objects.all().order_by('-click_nums')[:3]
        #print(dir(hot_courses))

        # 搜索功能
        search_keywords = request.GET.get('keywords', '')
        if search_keywords:
            # icontains是包含的意思（不区分大小写）
            # Q可以实现多个字段，之间是or的关系
            all_courses = all_courses.filter(
                Q(name__icontains=search_keywords) | Q(desc__icontains=search_keywords) | Q(
                    detail__icontains=search_keywords))

        #排序
        sort = request.GET.get('sort', '')

        if sort:
            if sort == 'students':
                all_courses = Course.objects.all().order_by('-students')
            elif sort == 'hot':
                all_courses = Course.objects.all().order_by('-click_nums')
        # 分页
        try:
            page = request.GET.get('page', 1)
        except PageNotAnInteger:
            page = 1

        p = Paginator(all_courses, 5, request=request)
        courses = p.page(page)
        #print(courses.has_previous)
        return render(request, 'course-list.html', {
            'all_courses': courses,
            'hot_courses': hot_courses,
            'sort': sort,
        })


class CourseDetailView(LoginRequiredMixin, View):
    def get(self, request, course_id):
        course = Course.objects.get(id=int(course_id))
        #print(course.name)
        #点击数
        course.click_nums += 1
        course.save()

        #收藏
        has_fav_course = False
        has_fav_org = False

        # 必须是用户已登录我们才需要判断。
        if request.user.is_authenticated:
            if UserFavorite.objects.filter(user=request.user, fav_id=course.id, fav_type=1):
                has_fav_course = True
            if UserFavorite.objects.filter(user=request.user, fav_id=course.course_org.id, fav_type=2):
                has_fav_org = True
        #相关课程推荐
        tag = course.tag
        if tag:
            # 需要从1开始不然会推荐自己
            relate_courses = Course.objects.filter(tag=tag)[:3]
        else:
            relate_courses = []
        return render(request, 'course-detail.html', {
            'course': course,
            'relate_courses': relate_courses,
            "has_fav_course": has_fav_course,
            "has_fav_org": has_fav_org,
        })


class CourseInfoView(LoginRequiredMixin, View):
    def get(self, request, course_id):
        course = Course.objects.get(id=int(course_id))
        course.students += 1
        course.save()
        # 查询用户是否已经学习了该课程
        user_courses = UserCourse.objects.filter(user=request.user, course=course)
        if not user_courses:
            # 如果没有学习该门课程就关联起来
            user_course = UserCourse(user=request.user, course=course)
            user_course.save()

        # 相关课程推荐
        # 找到学习这门课的所有用户
        user_courses = UserCourse.objects.filter(course=course)
        # 找到学习这门课的所有用户的id
        user_ids = [user_course.user_id for user_course in user_courses]
        # 通过所有用户的id,找到所有用户学习过的所有课程
        all_user_courses = UserCourse.objects.filter(user_id__in=user_ids)
        # 取出所有课程id
        course_ids = [all_user_course.course_id for all_user_course in all_user_courses]
        # 通过所有课程的id,找到所有的课程，按点击量去五个
        relate_courses = Course.objects.filter(id__in=course_ids).order_by("-click_nums")[:5]

        #print(type(course))
        all_resources = CourseResource.objects.filter(course=course)
        #print(type(all_resources))
        return render(request, "course-video.html", {
            "course": course,
            "all_resources": all_resources,
            'relate_courses': relate_courses,
        })


class CourseCommentView(LoginRequiredMixin, View):
    def get(self, request, course_id):
        course = Course.objects.get(id=int(course_id))
        #获取课程资源
        all_resources = CourseResource.objects.filter(course=course)
        #获取所有评论
        all_comments = CourseComments.objects.all()
        return render(request, 'course-comment.html', {
            "course": course,
            "all_resources": all_resources,
            "all_comments": all_comments,
        })


class AddCommentView(View):
    def post(self, request):
        course_id = request.POST.get('course_id', 0)
        comments = request.POST.get('comments', '')
        if not request.user.is_authenticated:
            return HttpResponse('{"status":"fail","msg":"用户未登录"}', content_type='appalication/json')
        if int(course_id) > 0 and comments:
            courseComments = CourseComments()
            course = Course.objects.get(id=course_id)
            #print(course)
            courseComments.course = course
            courseComments.comments = comments
            courseComments.user = request.user
            courseComments.save()
            return HttpResponse('{"status":"success","msg":"评论成功"}', content_type='appalication/json')
        else:
            return HttpResponse('{"status":"fail","msg":"评论失败"}', content_type='appalication/json')


class VideoPlayView(LoginRequiredMixin, View):
    '''课程章节视频播放页面'''

    def get(self, request, video_id):
        video = Video.objects.get(id=int(video_id))
        print(video.url)
        # 通过外键找到章节再找到视频对应的课程
        course = video.lesson.course

        course.students += 1
        course.save()

        # 查询用户是否已经学习了该课程
        user_courses = UserCourse.objects.filter(user=request.user, course=course)
        if not user_courses:
            # 如果没有学习该门课程就关联起来
            user_course = UserCourse(user=request.user, course=course)
            user_course.save()

        # 相关课程推荐
        # 找到学习这门课的所有用户
        user_courses = UserCourse.objects.filter(course=course)
        # 找到学习这门课的所有用户的id
        user_ids = [user_course.user_id for user_course in user_courses]
        # 通过所有用户的id,找到所有用户学习过的所有过程
        all_user_courses = UserCourse.objects.filter(user_id__in=user_ids)
        # 取出所有课程id
        course_ids = [all_user_course.course_id for all_user_course in all_user_courses]
        # 通过所有课程的id,找到所有的课程，按点击量去五个
        relate_courses = Course.objects.filter(id__in=course_ids).order_by("-click_nums")[:5]

        # 资源
        all_resources = CourseResource.objects.filter(course=course)
        return render(request, 'course-play.html', {
            'course': course,
            'all_resources': all_resources,
            'relate_courses': relate_courses,
            'video': video,
        })