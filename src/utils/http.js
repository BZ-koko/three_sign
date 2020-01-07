import axios from 'axios'
import {MessageBox, Message} from 'element-ui'

let instance = axios.create({
  baseURL: 'http://10.1.0.190:7200/',
  timeout: 60000,
  withCredentials: true, // send cookies when cross-domain requests
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  }
});
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

// 添加请求拦截器
instance.interceptors.request.use(config => {
  // 在发送请求之前做些什么
  console.log(config);
  return config;
}, error => {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
instance.interceptors.response.use(response => {
  // 对响应数据做点什么
  console.log(response, 'response');
  return response;
}, error => {
  Message({
    message: error.message,
    type: 'error',
    duration: 5 * 1000
  });
  // 对响应错误做点什么
  return Promise.reject(error);
});

export default instance;
