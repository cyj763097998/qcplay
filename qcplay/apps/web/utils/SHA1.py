# by 362416272@qq.com
import hashlib


def gen_sha1(origin):
    """
    md5加密
    :param origin:
    :return:
    """
    #ha = hashlib.sha1(b'fasdfsdf')
    #ha.update(origin.encode('utf-8'))
    return hashlib.sha1(origin.encode("utf-8")).hexdigest()
