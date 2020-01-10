// 所有页面公用的api 存放
import request from '../utils/http'

const api = {
  signRecord: '/sign/getSignRecord',//列表
  getMember: '/callback/getMember',//列表
  // getNoShowInfo: '/callback/getNoShowInfo',//未签到列表
  getNoShowInfo: '/callback/getMember',//未签到列表
};

export default {
  getNoShowInfo() {
    return request.get(api.getNoShowInfo)
  },
  signRecord(params) {
    return request.get(api.signRecord, params)
  },
  getMember() {
    return request.get(api.getMember)
  },
}
