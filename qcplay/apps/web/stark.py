from stark.service.v1 import site
from web import models
from web.views import userinfo, idchost, website, sitedir, repo


site.register(models.UserInfo, userinfo.UserInfoHandler)

site.register(models.IdcHost, idchost.IdcHostHandler)

site.register(models.WebSite, website.WebSiteHandler)

site.register(models.SiteDir, sitedir.SiteDirHandler)

site.register(models.Repo, repo.RepoHandler)