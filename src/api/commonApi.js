// 所有页面公用的api 存放
import request from '../utils/http'

const api = {
  getCountInfo: '/callback/getCountInfo',//统计应到未到
  getNoShowInfo: '/callback/getMember',//未签到列表
  getShowInfo: '/callback/getShowInfo',//已签到人员记录
  getNoShowDepartmentInfo: '/callback/getNoShowDepartmentInfo',//点击部门统计该部门未到人员信息
};

export default {
  getShowInfo() {
    return request.get(api.getShowInfo)
  },
  getNoShowInfo() {
    return request.get(api.getNoShowInfo)
  },
  getCountInfo() {
    return request.get(api.getCountInfo)
  },
  getNoShowDepartmentInfo(params) {
    return request.get(api.getNoShowDepartmentInfo, params)
  },
}
