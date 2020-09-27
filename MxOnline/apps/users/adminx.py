from .models import EmailVerifyRecord, Banner
import xadmin

# 创建xadmin的最基本管理器配置，并与view绑定
class BaseSetting(object):
    # 开启主题功能
    enable_themes = True
    use_bootswatch = True

class GlobalSettings(object):
    # 修改title
    site_title = '在线教育后台管理界面'
    # 修改footer
    site_footer = 'jim在线教育站点'
    # 收起菜单
    menu_style = 'accordion'

class EmailVerifyRecordAdmin(object):
    list_display = ['code', 'email', 'send_type', 'send_time']
    search_filter = ['code', 'email', 'send_type']
    list_filter = ['code', 'email', 'send_type', 'send_time']

class BannerAdmin(object):
    list_display = ['title', 'image', 'url','index', 'add_time']
    search_fields = ['title', 'image', 'url','index']
    list_filter = ['title', 'image', 'url','index', 'add_time']

# 将基本配置管理与view绑定
xadmin.site.register(xadmin.views.BaseAdminView, BaseSetting)
# 将title和footer信息进行注册
xadmin.site.register(xadmin.views.CommAdminView, GlobalSettings)
xadmin.site.register(EmailVerifyRecord, EmailVerifyRecordAdmin)
xadmin.site.register(Banner, BannerAdmin)

