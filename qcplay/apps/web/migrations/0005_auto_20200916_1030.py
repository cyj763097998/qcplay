# Generated by Django 2.0.2 on 2020-09-16 02:30

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('web', '0004_auto_20200916_1000'),
    ]

    operations = [
        migrations.AlterField(
            model_name='website',
            name='addr',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='web.Repo', verbose_name='仓库地址'),
        ),
        migrations.AlterField(
            model_name='website',
            name='type',
            field=models.CharField(choices=[('git', 'git'), ('svn', 'svn')], default='git', max_length=10, verbose_name='更新类型'),
        ),
    ]
