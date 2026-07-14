/* FILE OWNER: Member 1 — others do not edit */
(function initLandingScene() {
  const sectionEl = document.getElementById('landing');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2ede7);
  scene.fog = new THREE.Fog(0xf2ede7, 8, 22);

  const camera = new THREE.PerspectiveCamera(45, sectionEl.clientWidth / sectionEl.clientHeight, 0.1, 100);
  camera.position.set(0, 2, 16);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(sectionEl.clientWidth, sectionEl.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  sectionEl.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 5;
  controls.maxDistance = 14;
  controls.maxPolarAngle = Math.PI / 1.9;
  controls.target.set(0, 0.6, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const keyLight = new THREE.DirectionalLight(0xffe9dd, 1.1);
  keyLight.position.set(6, 9, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xd8e8f0, 0.35);
  rimLight.position.set(-6, 4, -4);
  scene.add(rimLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(9, 64),
    new THREE.MeshStandardMaterial({ color: 0xe9e2d8, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.6;
  floor.receiveShadow = true;
  scene.add(floor);

  const pastelTexture = createPastelTexture();
  const palette = window.palette;
  const objects = []; 

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.15, 1),
    new THREE.MeshStandardMaterial({ map: pastelTexture, roughness: 0.55, metalness: 0.05 })
  );
  core.position.set(0, 0.6, 0);
  core.castShadow = true;
  scene.add(core);
  objects.push(core);
  core.userData = { baseScale: core.scale.clone(), isCore: true };

  const satelliteDefs = [
    { name: 'Member 1', geometry: new THREE.TorusGeometry(0.55, 0.2, 24, 80), color: palette.blush, orbitSpeed: 0.35, orbitRadius: 3.0, tilt: 0.15 },
    { name: 'Member 2', geometry: new THREE.BoxGeometry(0.9, 0.9, 0.9, 3, 3, 3), color: palette.powder, orbitSpeed: -0.28, orbitRadius: 3.3, tilt: -0.1 },
    { name: 'Member 3', geometry: new THREE.CylinderGeometry(0.45, 0.45, 1.1, 40), color: palette.lilac, orbitSpeed: 0.22, orbitRadius: 2.7, tilt: 0.22 },
    { name: 'Member 4', geometry: new THREE.ConeGeometry(0.6, 1.1, 40), color: palette.sand, orbitSpeed: -0.4, orbitRadius: 3.5, tilt: -0.18 }
  ];

  const orbitPivots = [];

  satelliteDefs.forEach((def, i) => {
    const pivot = new THREE.Group();
    pivot.position.copy(core.position);
    pivot.rotation.z = def.tilt;          
    pivot.rotation.y = (i / satelliteDefs.length) * Math.PI * 2; 

    const satellite = new THREE.Mesh(
      def.geometry,
      new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.5, metalness: 0.05 })
    );
    satellite.position.set(def.orbitRadius, 0, 0);
    satellite.castShadow = true;
    satellite.userData = { baseScale: satellite.scale.clone(), memberName: def.name };

    pivot.add(satellite);
    scene.add(pivot);
    orbitPivots.push({ pivot, satellite, orbitSpeed: def.orbitSpeed });
    objects.push(satellite);
  });

  orbitPivots.forEach(({ pivot }, i) => {
    const ringGeo = new THREE.RingGeometry(satelliteDefs[i].orbitRadius - 0.02, satelliteDefs[i].orbitRadius + 0.02, 80);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xd8cabb, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.rotation.z = satelliteDefs[i].tilt;
    ring.position.copy(core.position);
    scene.add(ring);
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let selectedObject = null;

  renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(objects);
    if (selectedObject) selectedObject.scale.copy(selectedObject.userData.baseScale);
    if (intersects.length > 0) {
      selectedObject = intersects[0].object;
      selectedObject.scale.copy(selectedObject.userData.baseScale).multiplyScalar(1.25);
    } else {
      selectedObject = null;
    }
  });

  const keyState = {};
  window.addEventListener('keydown', (e) => { keyState[e.key] = true; });
  window.addEventListener('keyup', (e) => { keyState[e.key] = false; });
  function handleKeyboardCamera() {
    const nudge = 0.05;
    if (keyState['ArrowLeft']) camera.position.x -= nudge;
    if (keyState['ArrowRight']) camera.position.x += nudge;
    if (keyState['ArrowUp']) camera.position.y += nudge;
    if (keyState['ArrowDown']) camera.position.y -= nudge;
  }

  let introProgress = 0;
  const introDuration = 90;
  const introStart = camera.position.clone();
  const introEnd = new THREE.Vector3(0, 2.5, 8.5);

  window.addEventListener('resize', () => {
    camera.aspect = sectionEl.clientWidth / sectionEl.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sectionEl.clientWidth, sectionEl.clientHeight);
  });

  const clock = new THREE.Clock();
  let running = true;
  let rafId = null;

  function animate() {
    if (!running) return;
    rafId = requestAnimationFrame(animate);
    const delta = clock.getDelta();

    orbitPivots.forEach(({ pivot, orbitSpeed }) => {
      pivot.rotation.y += orbitSpeed * delta;
    });

    objects.forEach((obj) => {
      obj.rotation.x += 0.004;
      obj.rotation.y += 0.008;
    });
    core.position.y = 0.6 + Math.sin(clock.getElapsedTime() * 0.8) * 0.08;

    if (introProgress < introDuration) {
      introProgress++;
      const t = introProgress / introDuration;
      const eased = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(introStart, introEnd, eased);
    }
    handleKeyboardCamera();
    controls.update();
    renderer.render(scene, camera);
  }

  observeSection(sectionEl,
    () => { if (!running) { running = true; animate(); } },
    () => { running = false; if (rafId) cancelAnimationFrame(rafId); }
  );

  animate();

  const fadeElements = document.querySelectorAll('.scroll-fade');
  const observer = new IntersectionObserver((entries)=> {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
      }
    })
  },{threshold: 0.15}); 

  fadeElements.forEach(el => observer.observe(el))
})();
