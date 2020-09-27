import hashlib


from django.contrib.auth.hashers import make_password
from django.db import models
from datetime import datetime
from rbac.models import UserInfo as RbacUserInfo


class UserInfo(RbacUserInfo):  # 继承rbac的UserInfo基类
    """
    用户表
    """
    nickname = models.CharField(verbose_name='真实姓名', max_length=16)
    phone = models.CharField(verbose_name='手机号', max_length=32)

    gender_choices = ((1, '男'), (2, '女'))
    gender = models.IntegerField(verbose_name='性别', choices=gender_choices, default=1)
    #depart = models.ForeignKey(verbose_name='部门', to='Department', on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        #self.password = hashlib.sha1(self.password.encode("utf-8")).hexdigest()
        self.password = make_password(self.password, salt='qc', hasher ='pbkdf2_sha1')
        super(UserInfo, self).save(*args, **kwargs)

    def __str__(self):
        return self.nickname


class IdcHost(models.Model):
    """
    主机表
    """
    title = models.CharField(verbose_name='主机名', max_length=32,unique=True)
    system = models.CharField(verbose_name='系统', max_length=32,null=True, blank=True)
    outernet_ip = models.CharField(verbose_name='外网ip', max_length=32)
    intranet_ip = models.CharField(verbose_name='内网ip', max_length=32)
    cpu = models.CharField(verbose_name='CPU', max_length=32,null=True, blank=True)
    memory = models.CharField(verbose_name='内存', max_length=32,null=True, blank=True)
    disk = models.CharField(verbose_name='硬盘', max_length=32,null=True, blank=True)
    username = models.CharField(verbose_name='用户', max_length=32,null=True, blank=True)
    password = models.CharField(verbose_name='密码', max_length=32,null=True, blank=True)
    port = models.CharField(verbose_name='端口', max_length=32,null=True, blank=True)
    ssh_port = models.CharField(verbose_name='ssh端口', max_length=32,null=True, blank=True)
    status_choices = ((1, '启用'), (2, '禁用'))
    status = models.IntegerField(verbose_name='当前状态', choices=status_choices, default=1)
    add_time = models.DateTimeField(default=datetime.now, verbose_name="添加时间", null=True, blank=True)

    def __str__(self):
        return self.title
    def get_outernet_ip(self):
        if self.outernet_ip:
            return self.outernet_ip

class Repo(models.Model):
    type_choices = (
        ('git', u'git'),
        ('svn',u'svn'),
    )
    title = models.CharField(verbose_name='版本库名', max_length=32, unique=True)
    rtype = models.CharField(choices=type_choices, verbose_name='更新类型', max_length=10)
    addr = models.CharField(verbose_name='仓库地址', max_length=100)
    repoUser = models.CharField(max_length=50, verbose_name='用户', null=True, blank=True)
    repoPassword = models.CharField(max_length=50, verbose_name='密码', null=True, blank=True)
    add_time = models.DateTimeField(default=datetime.now, verbose_name="添加时间")

    def __str__(self):
        return self.addr


class SiteDir(models.Model):
    title = models.CharField(verbose_name='名称', max_length=32, unique=True)
    path = models.CharField(verbose_name='路径', max_length=32, unique=True)

    def __str__(self):
        return self.title

class WebSite(models.Model):
    type_choices = (
        ('git', u'git'),
        ('svn',u'svn'),
    )
    title = models.CharField(verbose_name='站点名称', max_length=32,unique=True)
    desc = models.CharField(verbose_name='站点描述', max_length=32, null=True, blank=True)
    target = models.ForeignKey(to='IdcHost',verbose_name='主机', on_delete=models.CASCADE)
    sitedir = models.ForeignKey(to='SiteDir',verbose_name='站点目录', on_delete=models.CASCADE)
    wtype = models.CharField(choices=type_choices, verbose_name='更新类型', max_length=10)
    addr = models.ForeignKey(Repo, on_delete=models.CASCADE, verbose_name='仓库地址')
    add_time = models.DateTimeField(default=datetime.now, verbose_name="添加时间")

    def __str__(self):
        return self.title