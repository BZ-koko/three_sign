<template>
  <div>
    <div></div>
  </div>
</template>
<script>
  import * as THREE from 'three';
  import TWEEN from 'tween';
  import {TrackballControls} from '../../js/TrackballControls.js';
  // import OrbitControls from '../../js/OrbitControls.js';
  import {CSS3DRenderer, CSS3DObject} from '../../js/CSS3DRenderer.js';
  var scene, camera, renderer;
  var sphere;
  var lastDate = new Date();

  export default {
    mounted(){
      this.init();
      this.animate();
  },
    methods:{
      init() {

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 13.9);
        camera.position.set(0, 0, 15);
        scene.add(camera);

        var geometry = new THREE.SphereGeometry(5, 20, 20);
        var material = new THREE.MeshBasicMaterial({
          color: 0x0077aa,
          wireframe: true
        });

        sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        renderer = new THREE.WebGLRenderer({
          antialias: true
        });
        renderer.setClearColor(0x000000);
        renderer.setSize(innerWidth, innerHeight);
        document.body.appendChild(renderer.domElement);

      },
      animate() {

        var now = new Date();
        var delay = now - lastDate;
        lastDate = now;

        sphere.rotation.y += delay * 0.0001;

        requestAnimationFrame(this.animate);
        renderer.render(scene, camera);

      }
    }
  }
</script>
<style>

</style>
