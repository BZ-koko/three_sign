<template>
  <div class="detail-container">
    <div id="container"></div>
    <img class="music-view" :src="musicImgUrl" alt="" @click="openMusic">
    <div class="bottom-settings">
      <el-button id="table" class="bottom-btn" style="display: none">表格</el-button>
      <el-button id="sphere" class="bottom-btn" style="display: none">球体</el-button>
      <el-button id="helix" class="bottom-btn" style="display: none">螺旋</el-button>
      <el-button id="grid" class="bottom-btn" style="display: none">网格</el-button>
      <el-button class="bottom-btn" @click="animationClick">{{animationStatus? '暂停' :'启动'}}</el-button>
      <!--<el-button @click="changeTable2" class="bottom-btn">签到模拟</el-button>-->
      <div class="lucky-start-view">
        <!--抽奖人数：-->
        <el-input-number style="margin-right: 15px;" v-model="luckyNum" @change="handleChange" :min="1"
                         :max="table2.length"></el-input-number>
      </div>
      <el-button v-if="luckyBtnStatus" @click="startLucky" class="bottom-btn">开始选人</el-button>
      <el-button v-if="!luckyBtnStatus" @click="endLucky" class="bottom-btn">停</el-button>

      <audio controls autoplay loop muted="muted" id="vd" style="display: none">
        <source src="../../assets/mp3/no_love.mp3" type="audio/mpeg">
        <source src="../../assets/mp3/no_love.mp3" type="audio/ogg">
        <!--<embed height="50" width="100" src="../../assets/mp3/no_love.mp3">-->
      </audio>
    </div>
    <div class="lucky-view" v-if="popoverVisible">
      <div class="lucky-header">
        <span>中奖名单</span>
        <span class="close-lucky" @click="hidePopover">❌</span>
      </div>
      <div v-for="item in luckyArr">
        <div class="lucky-item">
          <img class="lucky-item-avatar" :src="item.logoUrl" alt="">
          <div class="lucky-item-info">
            <span style="padding-bottom: 3px;">{{item.username}}</span>
            <span>{{item.departmentName}}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="sign-stat-view">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<script>
  import * as THREE from 'three';
  import TWEEN from 'tween';
  // import {} from 'element-ui'
  import {TrackballControls} from '../../js/TrackballControls.js';
  // import OrbitControls from '../../js/OrbitControls.js';
  import {CSS3DRenderer, CSS3DObject} from '../../js/CSS3DRenderer.js';
  import commonApi from '../../api/commonApi';
  import {table} from '../../mockData/tableData'
  import open_music from '../../assets/open_music.png';
  import close_music from '../../assets/close_music.png';

  var camera, scene, renderer;
  var controls;
  var objects = [];
  var targets = {table: [], sphere: [], helix: [], grid: []};

  export default {
    name: "alarmPage",
    data() {
      return {
        table2: table,
        signList: [],//签到人员
        theta: 0,//初始频率
        thetaAdd: 0.004,//频率递增值
        luckyNum: 3,
        luckyIndex: 1,
        luckyBtnStatus: true,
        popoverVisible: false,
        luckyArr: [],//中奖名单
        randomArr: [],//随机数组
        strandArr: [],//标准数组 校验
        innerHeight: window.innerHeight,
        RTData: {},//实时table数据
        signPerson: '',

        RTinArr: [],//未签到人员

        animationStatus: true,//模型动画状态

        musicImgUrl: open_music,

        userName: '余秋雨',
      }
    },
    beforeDestroy() {
      this.onbeforeunload()
    },
    mounted() {
      this.init();
      this.animate();
      // this.getAllData()
      // this.openMusic();
      this.connectWebsocket();
      for (let i = 0; i < this.table2.length; i++) {
        this.strandArr.push(i);
        this.RTinArr.push(i);
      }
      setInterval(() => this.transform(targets.table, 2000), 10000);
      setInterval(() => this.transform(targets.helix, 2000), 20000);
      setInterval(() => this.transform(targets.grid, 2000), 30000);
      setInterval(() => this.transform(targets.sphere, 2000), 40000);
    },
    methods: {
      openMusic() {
        var music = document.getElementById("vd");//获取ID  
        if (music.paused) { //判读是否播放
          music.play(); //没有就播放 
          this.musicImgUrl = close_music
        } else {
          music.pause();
          this.musicImgUrl = open_music
        }
      },
      getAllData() {
        commonApi.getMember().then(res => {
          console.log(res);
        }).catch(err => {
          console.log(err, 'err');
        })
      },
      connectWebsocket() {
        // WebSocketx
        if ('WebSocket' in window) {
          this.websocket = new WebSocket('ws://10.1.0.190:7200/websocket/' + this.userName);
          this.initWebSocket()
        } else {
          alert('当前浏览器不支持websocket')
        }
      },
      initWebSocket() {
        // 连接错误
        this.websocket.onerror = this.setErrorMessage;

        // 连接成功
        this.websocket.onopen = this.setOnopenMessage;

        // 收到消息的回调
        this.websocket.onmessage = this.setOnmessageMessage;

        // 连接关闭的回调
        this.websocket.onclose = this.setOncloseMessage;

        // 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        window.onbeforeunload = this.onbeforeunload
      },
      setErrorMessage() {
        console.log('WebSocket连接发生错误   状态码：' + this.websocket.readyState)
      },
      setOnopenMessage() {
        console.log('WebSocket连接成功    状态码：' + this.websocket.readyState)
      },
      setOnmessageMessage(event) {
        console.log('服务端返回：' + event.data);
        this.signList.push(JSON.parse(event.data));
        this.changeTable2(JSON.parse(event.data));
      },
      setOncloseMessage() {
        console.log('WebSocket连接关闭    状态码：' + this.websocket.readyState);
        this.reConnect()
      },
      onbeforeunload() {
        this.closeWebSocket()
      },
      closeWebSocket() {
        this.websocket.close()
      },
      reConnect() {
        console.log("socket 连接断开，正在尝试重新建立连接");
        this.initWebSocket();
      },
      //模拟签到
      changeTable2(data) {
        this.$notify({
          // title: '标题名称',
          message: `<div style="display: flex;justify-content: center;align-items: center">
                      <img style="width: 60px;height: 60px;border-radius: 50%" src="${data.logoUrl}" alt="">
                    <div style="font-size: 15px">
                      <span style="padding: 0 0 15px 10px;">${data.username}</span><br/>
                      <span style="padding: 0 0 5px 10px;">${data.departmentName}</span>
                    </div>
                    </div>`,
          showClose: false,
          duration: 2500,
          dangerouslyUseHTMLString: true
        });
        let curEvent = scene.children[this.randomNum()].element;
        curEvent.getElementsByClassName("image-info")[0].src = data.logoUrl;
        curEvent.getElementsByClassName("details")[0].innerHTML = data.username;
        curEvent.getElementsByClassName("partment")[0].innerHTML = data.departmentName;
      },
      //开始抽奖
      startLucky() {
        if (this.luckyNum > this.signList.length) {
          this.$message({
            message: '签到人数小于抽奖人数！',
            type: 'warning',
            duration: 3000
          });
          return;
        }

        if (this.luckyNum < 1 || this.luckyNum === undefined) {
          this.$message({
            message: '请输入抽奖人数！',
            type: 'warning',
            duration: 3000
          });
          return;
        }
        // this.randomNums();
        this.luckyBtnStatus = false;
        this.popoverVisible = false;
        // this.thetaAdd = 0.1;
        // scene.rotation.x = this.theta;
        // scene.rotation.z = this.theta;
        scene.rotation.y = this.theta;
        this.luckyRandom();
      },
      //结束抽奖
      endLucky() {
        this.luckyBtnStatus = true;
        this.popoverVisible = true;
        // this.theta = 0;
        // this.thetaAdd = 0.001;
        // scene.rotation.x =6 0;
        // scene.rotation.z = 0;
        scene.rotation.y = this.theta;
        this.strandArr.forEach(item => {
          scene.children[item].element.style.backgroundColor = "rgba(5, 39, 175, 0.463)"
        });
        this.randomArr = [];
        cancelAnimationFrame(this.luckyAnm);
      },
      //随机抽奖
      luckyRandom() {
        // this.luckyArr = JSON.parse(JSON.stringify(this.table2));
        this.luckyArr = JSON.parse(JSON.stringify(this.signList));
        this.luckyArr.sort(() => {//随机打乱数组
          return Math.random() - 0.5;
        });
        this.luckyArr.length = this.luckyNum;
        console.log(this.luckyArr)//中奖名单
        this.luckyAnm();
      },
      //随机取数
      randomNums() {
        for (let i = 0; i < this.table2.length; i++) {
          this.randomArr.push(i);
        }
        // for (let i = 0; i < this.signList.length; i++) {
        //   this.randomArr.push(i);
        // }
        this.randomArr.sort(() => {
          return Math.random() - 0.5;
        });
        this.randomArr.length = this.luckyNum;

      },
      //随机取不重复数组元素
      randomNum() {
        let randomNArr = [];
        this.RTinArr.sort(() => {
          return Math.random() - 0.5;
        });
        randomNArr = JSON.parse(JSON.stringify(this.RTinArr));
        randomNArr.length = 1;
        this.RTinArr.splice(randomNArr[0], 1);
        return randomNArr[0];
      },
      //动画控制
      animationClick() {
        this.animationStatus = !this.animationStatus;
        this.animationStatus ? this.thetaAdd = 0.001 : this.thetaAdd = 0
      },
      handleChange(v) {
        this.luckyNum = v;
      },
      hidePopover() {
        this.popoverVisible = false;
      },
      init() {
        camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.x = 3000;
        scene = new THREE.Scene();
        scene.translateZ(200);

        //表格
        for (var i = 0; i < this.table2.length; i++) {
          var element = document.createElement('div');
          element.className = 'element';
          element.style.backgroundColor = 'rgba(5, 39, 175,' + (Math.random() * 0.5 + 0.25) + ')';
          var number = document.createElement('div');
          number.className = 'number';
          number.textContent = i + 1;
          var image = document.createElement('img');
          image.className = 'image-info';
          image.style.width = '80px';
          image.style.height = '100px';
          image.src = this.table2[i].avatar;
          element.appendChild(image);
          var details = document.createElement('div');
          details.className = 'details';
          details.innerHTML = this.table2[i].name;
          details.style.color = '#fff';
          element.appendChild(details);
          var partment = document.createElement('div');
          partment.className = 'partment';
          partment.style.color = '#fff';
          partment.innerHTML = this.table2[i].department;
          element.appendChild(partment);
          var object = new CSS3DObject(element);
          object.position.x = Math.random() * 4000 - 2000;
          object.position.y = Math.random() * 4000 - 2000;
          object.position.z = Math.random() * 4000 - 2000;
          scene.add(object);
          objects.push(object);
          //
          var object = new THREE.Object3D();
          object.position.x = (this.table2[i].positionX) * 140 - 1330;
          object.position.y = -(this.table2[i].positionY) * 180 + 990;
          targets.table.push(object);
        }

        // 球体
        this.sphere = new THREE.Vector3();
        for (var i = 0, l = objects.length; i < l; i++) {
          var phi = Math.acos(-1 + (2 * i) / l);
          var theta = Math.sqrt(l * Math.PI) * phi;
          var object = new THREE.Object3D();
          object.position.setFromSphericalCoords(800, phi, theta);
          this.sphere.copy(object.position).multiplyScalar(2);
          object.lookAt(this.sphere);
          targets.sphere.push(object);
        }
        // 螺旋
        var vector = new THREE.Vector3();
        for (var i = 0, l = objects.length; i < l; i++) {
          var theta = i * 0.175 + Math.PI;
          var y = -(i * 8) + 450;
          var object = new THREE.Object3D();
          object.position.setFromCylindricalCoords(900, theta, y);
          vector.x = object.position.x * 2;
          vector.y = object.position.y;
          vector.z = object.position.z * 2;
          object.lookAt(vector);
          targets.helix.push(object);
        }
        // 网格
        for (var i = 0; i < objects.length; i++) {
          var object = new THREE.Object3D();
          object.position.x = ((i % 5) * 400) - 800;
          object.position.y = (-(Math.floor(i / 5) % 5) * 400) + 800;
          object.position.z = (Math.floor(i / 25)) * 1000 - 2000;
          targets.grid.push(object);
        }
        //实例
        renderer = new CSS3DRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight - 100);
        document.getElementById('container').appendChild(renderer.domElement);
        //
        this.controls = new TrackballControls(camera, renderer.domElement);
        this.controls.minDistance = 500;
        this.controls.maxDistance = 6000;

        var button = document.getElementById('table');
        button.addEventListener('click', () => {
          this.transform(targets.table, 2000);
        }, false);
        //监听
        var button = document.getElementById('sphere');
        button.addEventListener('click', () => {
          this.transform(targets.sphere, 2000);
        }, false);
        var button = document.getElementById('helix');
        button.addEventListener('click', () => {
          this.transform(targets.helix, 2000);
        }, false);
        var button = document.getElementById('grid');
        button.addEventListener('click', () => {
          this.transform(targets.grid, 2000);
        }, false);

        this.transform(targets.sphere, 2000); //初始化 图型
        window.addEventListener('resize', this.onWindowResize, false);
      },
      animate() {
        this.theta += this.thetaAdd;
        scene.rotation.y = this.theta;
        renderer.render(scene, camera);
        requestAnimationFrame(this.animate);
        TWEEN.update();
        this.controls.update();
        this.controls.rotateCamera();
      },
      transform(targets, duration) {
        TWEEN.removeAll();
        for (var i = 0; i < objects.length; i++) {
          var object = objects[i];
          var target = targets[i];
          new TWEEN.Tween(object.position)
            .to({x: target.position.x, y: target.position.y, z: target.position.z}, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
          new TWEEN.Tween(object.rotation)
            .to({x: target.rotation.x, y: target.rotation.y, z: target.rotation.z}, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
        new TWEEN.Tween(this)
          .to({}, duration * 2)
          .onUpdate(this.render)
          .start();
      },
      onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight - 100);
        this.render();
      },
      //抽奖动画
      luckyAnm() {
        let strArr = [];
        for (let i = 0; i < this.table2.length; i++) {
          strArr.push(i);
        }
        if (!this.luckyBtnStatus) { //抽奖动画
          this.luckyIndex += 1;
          this.randomNums();
          if (this.luckyIndex % 6 === 0) {
            this.randomArr.forEach(item => {
              strArr.splice(item, 1)
            });
            this.randomArr.forEach(item => {
              scene.children[item].element.style.backgroundColor = 'red';
            });
            strArr.forEach(item => {
              scene.children[item].element.style.backgroundColor = 'rgba(5, 39, 175, 0.463)';
            })
          }
          requestAnimationFrame(this.luckyAnm);
          TWEEN.update();
          this.controls.update();
          this.controls.rotateCamera();
        }
      },
      render() {
        renderer.render(scene, camera);
      }
    },
  }
</script>

<style>
  .detail-container {
    background-color: #000;
    width: 100vw;
    height: 100vh;
    background: url('../../assets/timg.jpg') no-repeat 100% 100%;
    background-size: cover;

  }

  .music-view {
    width: 30px;
    height: 30px;
    position: fixed;
    top: 20px;
    right: 20px;
    cursor: pointer;
  }

  .lucky-view {
    width: 250px;
    background-color: #fff;
    position: fixed;
    right: 30px;
    top: 80px;
    border-radius: 6px;
    padding: 0 20px;
    padding-bottom: 10px;
  }

  .lucky-item {
    display: flex;
    align-items: center;
    padding: 5px 0;
    border-bottom: dotted 1px #ccc;
  }

  .lucky-item-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .lucky-item-info {
    display: flex;
    flex-direction: column;
    font-size: 13px;
    color: #333;
    padding-left: 10px;
  }

  .lucky-header {
    display: flex;
    /*width: 100%;*/
    height: 35px;
    justify-content: space-between;
    align-items: center;
    /*padding: 0 10px;*/
  }

  .close-lucky {
    cursor: pointer;
    font-size: 14px;
  }

  .person-item {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 300px;
    height: 80px;
    background-color: #ffffff;
  }

  .lucky-start-view {
    margin-left: 15px;
  }

  .bottom-settings {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    flex-wrap: wrap;
    /*border: solid 1px red;*/

  }

  .bottom-btn {
    width: 100px;
    /*margin-left: 10px;*/
  }

  a {
    color: #8ff;
  }

  .sign-stat-view {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 40px;
  }

  #menu {
    position: absolute;
    bottom: 100px;
    width: 100%;
    text-align: center;
  }

  .element {
    width: 120px;
    height: 160px;
    box-shadow: 0px 0px 12px rgba(0, 255, 255, 0.5);
    border: 1px solid rgba(127, 255, 255, 0.25);
    font-family: Helvetica, sans-serif;
    text-align: center;
    line-height: normal;
    cursor: default;
  }

  .element:hover {
    box-shadow: 0px 0px 12px rgba(0, 255, 255, 0.75);
    border: 1px solid rgba(127, 255, 255, 0.75);
  }

  .element .number {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 12px;
    color: rgba(127, 255, 255, 0.75);
  }

  .element .symbol {
    position: absolute;
    top: 40px;
    left: 0px;
    right: 0px;
    font-size: 60px;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.75);
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.95);
  }

  .element .details {
    position: absolute;
    bottom: 15px;
    left: 0px;
    right: 0px;
    font-size: 12px;
    color: rgba(127, 255, 255, 0.75);
  }

  button {
    color: rgba(127, 255, 255, 0.75);
    background: transparent;
    outline: 1px solid rgba(127, 255, 255, 0.75);
    border: 0px;
    padding: 5px 10px;
    cursor: pointer;
  }

  button:hover {
    background-color: rgba(0, 255, 255, 0.5);
  }

  button:active {
    color: #000000;
    background-color: rgba(0, 255, 255, 0.75);
  }
</style>
