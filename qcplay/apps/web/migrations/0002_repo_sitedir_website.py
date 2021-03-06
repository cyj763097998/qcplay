# Generated by Django 2.0.2 on 2020-09-16 01:08

import datetime
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('web', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Repo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=32, unique=True, verbose_name='版本库名')),
                ('type', models.CharField(choices=[('svn', 'svn'), ('git', 'git')], default='git', max_length=10, verbose_name='更新类型')),
                ('addr', models.CharField(max_length=100, verbose_name='仓库地址')),
                ('repoUser', models.CharField(blank=True, max_length=50)),
                ('repoPassword', models.CharField(blank=True, max_length=50)),
                ('add_time', models.DateTimeField(default=datetime.datetime.now, verbose_name='添加时间')),
            ],
        ),
        migrations.CreateModel(
            name='SiteDir',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=32, unique=True, verbose_name='名称')),
                ('path', models.CharField(max_length=32, unique=True, verbose_name='路径')),
            ],
        ),
        migrations.CreateModel(
            name='WebSite',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=32, unique=True, verbose_name='站点名称')),
                ('desc', models.CharField(blank=True, max_length=32, null=True, verbose_name='站点描述')),
                ('type', models.CharField(choices=[('svn', 'svn'), ('git', 'git')], default='git', max_length=10, verbose_name='更新类型')),
                ('addr', models.CharField(max_length=100, verbose_name='仓库地址')),
                ('add_time', models.DateTimeField(default=datetime.datetime.now, verbose_name='添加时间')),
                ('sitedir', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='web.SiteDir', verbose_name='站点目录')),
                ('target', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='web.IdcHost', verbose_name='主机')),
            ],
        ),
    ]
