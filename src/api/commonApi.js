// 所有页面公用的api 存放
import request from '../utils/http'

const api = {
  signRecord: '/sign/getSignRecord',//列表
  getMember: '/callback/getMember',//列表
};

export default {
  signRecord(params) {
    return request.get(api.signRecord, params)
  },
  getMember() {
    return request.get(api.getMember)
  },
}
