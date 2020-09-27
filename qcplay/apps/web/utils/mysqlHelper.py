# -*- coding: UTF-8 -*-
#author: jim
#mysql操作类

import pymysql
class MyDB:
    cursor = ''   #句柄
    db = ''       #打开数据库连接
    '''
        定义构造方法
        host：主机名
        username;用户名
        password:密码
        dbname:数据库名
        db:打开数据库连接
        cursor:获取游标句柄
    '''
    def __init__(self,host,username,password,dbname,port=3306):
 
        self.host = host
        self.username = username
        self.password = password
        self.dbname = dbname
        self.port = port
 
        self.db = pymysql.connect(self.host,self.username,self.password,self.dbname,self.port,charset="utf8")
        self.cursor = self.db.cursor()
 
    #获取所有的结果集
    def getAllResult(self,sql):
        self.cursor.execute(sql)
        results = self.cursor.fetchall()
        return results
 
    #获取所有的结果集
    def getSignleResult(self,sql):
        self.cursor.execute(sql)
        results = self.cursor.fetchone()
        return results
 
    #插入或更新数据
    def insertOrUdateInfo(self,sql):
        try:
            # 执行SQL语句
            self.cursor.execute(sql)
            # 提交到数据库执行
            self.db.commit()
        except:
            # 发生错误时回滚
            self.db.rollback()
        #返回受影响的行数
        return self.cursor.rowcount

    # 插入多条数据
    def mul_insertInfo(self, sql, args):
        try:
            # self.cursor.executemany("insert into user (id,name) values (%s,%s)",[(1,"aaa"),(2,"bbb"),(3,"ccc")])  传参方式
            self.cursor.executemany(sql, args)
            self.conn.commit()
        except:
            # 发生错误时回滚
            self.db.rollback()
        # 返回受影响的行数

        return self.cursor.rowcount

    #执行多条语句
    def mult_sql(self,sql_list):
        if not isinstance(sql_list,list):
            return False
        try:
            for sql in sql_list:
                # 执行SQL语句
                self.cursor.execute(sql)
            # 提交到数据库执行
            self.db.commit()
        except:
            # 发生错误时回滚
            self.db.rollback()
        return True



    #关闭链接
    def close(self):
        self.db.close()

