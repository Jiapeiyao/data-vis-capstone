function initbars() {
  camera = new THREE.PerspectiveCamera( 85, window.innerWidth / window.innerHeight, 1, 10000 );
  orthCamera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 100000);

  camera.position.z = 800;
  camera.position.y = 600;
  camera.position.x = 600;
  camera.lookAt(new THREE.Vector3(0, 0, 0));


  geometry3 = new THREE.BoxGeometry(2400, 10, 2000);
  material3 = new THREE.MeshNormalMaterial({
    color: 0xa0afaf,
    transparent: true,
    opacity: 0.5
  });

  mesh3 = new THREE.Mesh(geometry3, material3);

  scene.add(mesh3);

  mesh3.position.y = 0;

  renderer = new THREE.WebGLRenderer({
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  //add effect
  effect = new THREE.StereoEffect(renderer);
  effect.setSize( window.innerWidth, window.innerHeight );

  $('.visual').append( renderer.domElement );


  controls = new THREE.OrbitControls(camera, renderer.domElement);
  //        controls.damping = 0.2;
  controls.addEventListener('change', render);
}

function animate() {

  requestAnimationFrame(animate);
  render();
  checkHighlight();
}

function render() {
  if (vrModeIsOn) {
    effect.render(scene, camera);
  }
  else {
    renderer.render(scene, orthCamera);
  }
}


function addBar(x, y, z) {
  var frequency = 0.4;
  var geometry = new THREE.BoxGeometry(49, y, 49);
  //geometry.computeFaceNormals();
  //geometry.computeVertexNormals();
  var gcolor = new THREE.Color(Math.sin(x * frequency), Math.sin(x * frequency + 2), Math.sin(x * frequency + 4));
  var material = new THREE.MeshBasicMaterial({
    color: gcolor
  });
  geometry.colorsNeedUpdate = true;
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 1 + y/2;;
  mesh.position.x = x - 500;
  mesh.position.z = z;
  scene.add(mesh);
  var edges = new THREE.EdgesHelper(mesh, 0x000000);
  edges.material.linewidth = 2;
  meshes.push(mesh);
  meshes.push(edges);
  targetlist.push(mesh);
  scene.add(edges);
}

function createDictionary(_json) {
  var uniqarr = _.uniq(_json.column_name);
  return uniqarr
}

function renderData(data) {
  for (var i = 0; i < data.length; i++) {
    d = data[i];
    addBar(d.x * 50, d.y * 2, d.z * 50);
  }
}
