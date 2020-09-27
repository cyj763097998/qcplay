from django.contrib import admin

from web.models import UserInfo

from rbac.models import Menu, Permission, Role

admin.site.register(UserInfo)
admin.site.register(Permission)
admin.site.register(Role)
admin.site.register(Menu)
