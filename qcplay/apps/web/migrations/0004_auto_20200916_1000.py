# Generated by Django 2.0.2 on 2020-09-16 02:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('web', '0003_auto_20200916_0933'),
    ]

    operations = [
        migrations.AlterField(
            model_name='repo',
            name='type',
            field=models.CharField(choices=[('git', 'git'), ('svn', 'svn')], default='git', max_length=10, verbose_name='更新类型'),
        ),
    ]