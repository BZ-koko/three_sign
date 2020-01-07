import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);
const routes = [
  {
    path: '/',
    name: 'alarmPage',
    component: r => require.ensure([], () => r(require('../components/alarmPage/alarmPage')), 'alarmPage'),
  },
  {
    path: '/sphere',
    name: 'sphere',
    component: r => require.ensure([], () => r(require('../components/sphereView/sphereView')), 'sphereView'),
  },
];
const router = new Router({
  routes
});
export default router;

