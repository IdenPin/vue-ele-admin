/**
 * constant-routes
 * 需要用户登录才可以访问的路由，所有登录后的用户都可见，不做角色区分
 * 路由配置模板格式
 * Note: sub-menu only appear when route children.length >= 1
 *
 * iframe: false                  判断是否是iframe内链
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

import BaseRoutes from './base-routes'
import NestedRoutes from './modules/nested-routes'

/**
 * 注意，默认导出的是对象，如果是数组需要使用扩展运算符 ...
 */
const constantRoutes = [
  /**
   * iframe 内链demo
   */

  {
    path: 'https://idenpin.github.io/element-table/docs/#/',
    meta: {
      title: '报表内链',
      icon: 'el-icon-document-copy'
    },
    iframe: true
  },

  /**
   * 外链demo
   */
  {
    path: 'http://www.qq.com',
    meta: {
      title: '腾讯外链',
      icon: 'el-icon-brush'
    }
  },

  /**
   * 嵌套菜单
   */

  NestedRoutes,
  {
    path: '/user-manage',
    component: () => import('@/views/UserInfo.vue')
  },
  {
    path: '*',
    redirect: '/404'
  }
]

export default [...BaseRoutes, ...constantRoutes]
