import BlankPage from '@/components/globals/BlankPage'
import Layout from '@/components/layouts/Index.vue'
import RouteNode from '@/components/globals/RouteNode.vue'
import _ from 'lodash'
/**
 * dynamic-routes file <核心>
 * 根据权限树或者角色动态生成的路由
 * dynamicRoutes 计算通过 router.addRoutes 追加
 */
import Config from '@/config'

/**
 * 拍平后台返回的树
 * 生成路由所需要的信息
 * {
 *  "/work-manage": {
 *    "path": "/work-manage",
 *    "meta": {
 *      "title": "工作管理",
 *      "icon": "el-icon-tickets"
 *     },
 *    "component": {}
 * }
 * @param {*} apiRoutes
 * @returns
 */

export function flatMenuFn(apiRoutes) {
  let flatMenuObj = {}
  let handlerLoop = (data, prefix) => {
    if (Array.isArray(data)) {
      data.forEach(v => {
        const path = prefix ? `${prefix}${v.accessPath}` : v.accessPath

        let hasChild = v.children && v.children.length > 0

        flatMenuObj[path] = {
          path: v.accessPath,
          meta: {
            title: v.name,
            icon: 'el-icon-tickets'
          }
        }

        /**
         * 如果没有对应的 components， 则先展示默认的 BlankPage 或者 Layout
         */

        flatMenuObj[path].component = hasChild ? Layout : BlankPage

        /**
         * 如果 path 中 '/' 只有一个，说明没有children，则需要添加一层 layout
         */

        if (path.lastIndexOf('/') === 0) {
          /**
           * 如果没有孩子节点
           */

          if (!hasChild) {
            let hasNoChillRoute = Object.assign({}, flatMenuObj[path])
            hasNoChillRoute.path = 'index'

            /**
             * 生成一个 layout 布局
             */
            let temp = {
              component: Layout,
              path: path,
              redirect: `${path}/index`,
              children: [hasNoChillRoute]
            }
            flatMenuObj[path] = temp
          }
        } else {
          /**
           * 多层级树，除第一级和最后一级以外children component 设置为 RouteNode 空节点
           */

          if (hasChild) {
            flatMenuObj[path]['component'] = RouteNode
          }
        }

        if (hasChild) {
          /**
           * 有孩子节增加 redirect 属性，并重定向到第一个孩子
           */

          flatMenuObj[path]['redirect'] = `${path}/${v.children[0].accessPath}`

          handlerLoop(v.children, path + '/')
        }
      })
    }
  }
  handlerLoop(apiRoutes)
  return flatMenuObj
}

/**
 * 生成前台可以渲染的路由
 * 以后台返回的路由树为基础，通过 flatMenuObj 对象中的 key 查找 apiRoutes 中的 path
 * 如果相等就将 flatMenuObj 对象的 value 赋给apiRoutes 中 path 相等项
 * @param {*} apiRoutes
 * @param {*} routesObj
 * @returns
 */

export function createMenuFn(apiRoutes, flatMenuObj) {
  const cloneApiRoutes = apiRoutes.slice()
  let loopMenu = (data, prefix) => {
    if (Array.isArray(data)) {
      data.forEach(v => {
        const hasChild = v.children && v.children.length > 0
        /**
         * 生成唯一路径，避免 path 重复
         */

        const path = prefix ? `${prefix}${v.accessPath || v.path}` : v.accessPath || v.path
        v.path = path
        for (let key in flatMenuObj) {
          if (v.path === key) {
            const { path, meta, component, redirect } = flatMenuObj[key]

            meta && (v.meta = meta)
            redirect && (v.redirect = redirect)
            v.path = path
            v.alwaysShow = v.alwaysShow || false
            v.component = component

            if (flatMenuObj[key].lastIndexOf !== 0 && !v.children && flatMenuObj[key].children) {
              v.children = flatMenuObj[key].children
              v.alwaysShow = v.alwaysShow || false
            }
          }
        }
        if (hasChild) {
          loopMenu(v.children, path + '/')
        }
      })
    }
  }
  loopMenu(cloneApiRoutes)
  return cloneApiRoutes
}

/**
 * 删除路由无用的字段
 * @returns
 */
export function cleanKey(routes) {
  let loopMenu = data => {
    if (Array.isArray(data)) {
      data.forEach(v => {
        let hasChild = v.children && v.children.length > 0
        delete v.accessPath
        delete v.id
        delete v.icon
        delete v.name
        delete v.open
        if (hasChild) {
          loopMenu(v.children)
        }
      })
    }
  }
  loopMenu(routes)
}

export function createDynamicRoutes(apiRoutes) {
  // 拍平
  const flatMenuObj = flatMenuFn(apiRoutes)
  // 通过 path 递归查找赋值
  let routes = createMenuFn(apiRoutes, flatMenuObj)

  // 清除无用的值
  cleanKey(_.cloneDeep(routes))

  /**
   * 模糊路由匹配一定要放在最后
   */
  routes.push({
    path: '*',
    redirect: '/404'
  })
  return routes
}