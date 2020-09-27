from django.contrib.auth.hashers import make_password, check_password

a = make_password("abcdef", None, 'pbkdf2_sha256')
b = "abcdef"

print(check_password(b, a))

{
    '1': {
        'title': '配置管理',
        'icon': 'fa-twitch',
        'sort': 1,
        'children': [{
            'id': 1,
            'title': '用户列表',
            'url': '/stark/web/userinfo/list/'
        }, {
            'id': 2,
            'title': '角色列表',
            'url': '/rbac/role/list/'
        }, {
            'id': 3,
            'title': '菜单列表',
            'url': ' / rbac / menu / list / '
        },
            {'id ': 4,
             'title ': '分配权限 ',
             'url ': ' / rbac / distribute / permissions / '
             }
        ]
    }
}
