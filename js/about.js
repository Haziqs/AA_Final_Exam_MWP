/* FILE OWNER: Member 2 — others do not edit */
(function initAboutScene() {
  const sectionEl = document.getElementById('about');
  const members = [
    window.MEMBER1_DATA,
    window.MEMBER2_DATA,
    window.MEMBER3_DATA,
    window.MEMBER4_DATA
  ];

  // Build UI with centered layout
  sectionEl.innerHTML = `
    <style>
      #about-cards {
        display: flex;
        gap: 1.2rem;
        flex-wrap: wrap;
        justify-content: center;
        max-width: 90%;
        pointer-events: none;
        z-index: 10;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -45%);
      }
      .about-card {
        background: rgba(20, 18, 30, 0.6);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-radius: 16px;
        padding: 1.2rem 1.2rem;
        min-width: 170px;
        max-width: 220px;
        flex: 1 1 auto;
        pointer-events: auto;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.06);
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      }
      .about-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 12px 48px rgba(94, 231, 255, 0.08);
        border-color: rgba(94, 231, 255, 0.15);
      }
      .about-card .name { font-weight: 600; font-size: 1.05rem; color: #edeef4; }
      .about-card .role { font-size: 0.75rem; color: #5ee7ff; margin: 0.2rem 0 0.4rem; }
      .about-card .detail { font-size: 0.7rem; color: #8a8a9c; margin-top: 0.15rem; line-height: 1.4; }
      .about-card .detail strong { font-weight: 600; color: #b57bff; }
      @media (max-width: 600px) {
        #about-cards { top: 55%; gap: 0.8rem; }
        .about-card { min-width: 140px; padding: 0.9rem; }
      }
    </style>
    <div id="about-heading" style="position:absolute;top:6%;left:50%;transform:translateX(-50%);text-align:center;z-index:10;color:#edeef4;pointer-events:none;">
      <h2 style="font-size:clamp(1.4rem,3vw,2.2rem);font-weight:600;margin:0;color:#edeef4;">About Us</h2>
      <p style="color:#8a8a9c;font-size:1rem;">Meet the team behind the portfolio</p>
    </div>
    <div id="about-cards">
      ${members.map((m) => `
        <div class="about-card">
          <div class="name">${m.name}</div>
          <div class="role">${m.about.role || 'Team Member'}</div>
          <div class="detail"><strong>Education:</strong> ${m.about.education || 'N/A'}</div>
          <div class="detail"><strong>Interests:</strong> ${m.about.interests || 'N/A'}</div>
          <div class="detail"><strong>Achievements:</strong> ${(m.about.achievements && m.about.achievements.length) ? m.about.achievements.join(', ') : 'None listed'}</div>
        </div>
      `).join('')}
    </div>
    <div class="hint" style="color:#8a8a9c;">drag to orbit · hover a shape to highlight</div>
  `;

  // ---------- 3D Scene ----------
  const scene = new THREE.Scene();
  scene.background = window.getBackgroundTexture();
  window.addEventListener('themeChanged', function(e) {
    scene.background = window.getBackgroundTexture();
    scene.background.needsUpdate = true;
  });
  const fogColor = document.body.classList.contains('dark-theme') ? 0x0d0b12 : 0xf2ede7;
  scene.fog = new THREE.Fog(fogColor, 8, 18);

  // Also update on theme change
  window.addEventListener('themeChanged', function(e) {
    const isDark = document.body.classList.contains('dark-theme');
    scene.fog.color.setHex(isDark ? 0x0d0b12 : 0xf2ede7);
  });

  const camera = new THREE.PerspectiveCamera(45, sectionEl.clientWidth / sectionEl.clientHeight, 0.1, 100);
  camera.position.set(0, 2, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(sectionEl.clientWidth, sectionEl.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  sectionEl.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 4;
  controls.maxDistance = 16;
  controls.target.set(0, 0.5, 0);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const keyLight = new THREE.DirectionalLight(0xffe9dd, 0.8);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0x5ee7ff, 0.3);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  // Grid
  const gridHelper = new THREE.GridHelper(10, 16, 0x5ee7ff, 0x5ee7ff);
  gridHelper.position.y = -1.2;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.1;
  scene.add(gridHelper);

  // Floor
  const floorColor = document.body.classList.contains('dark-theme') ? 0x0a0810 : 0xe9e2d8;
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(9, 64),
    new THREE.MeshStandardMaterial({ 
      color: floorColor, 
      roughness: 0.9, 
      metalness: 0.0 
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Particles
  const particleCount = 120;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const radius = 3 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    particlePos[i*3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePos[i*3+1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6 + 0.5;
    particlePos[i*3+2] = radius * Math.cos(phi) * 0.7;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xcdb8db,
    size: 0.04,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Member Shapes
  const colors = [0xe8b4b8, 0xa9c6d8, 0xcdb8db, 0xe3cba3];
  const geos = [
    new THREE.TorusKnotGeometry(0.6, 0.2, 64, 16),
    new THREE.OctahedronGeometry(0.7),
    new THREE.DodecahedronGeometry(0.6),
    new THREE.TorusGeometry(0.7, 0.25, 24, 48)
  ];

  const shapes = [];
  members.forEach((m, i) => {
    const mat = new THREE.MeshStandardMaterial({
      color: colors[i],
      roughness: 0.35,
      metalness: 0.15,
      emissive: new THREE.Color(colors[i]),
      emissiveIntensity: 0.05
    });
    const mesh = new THREE.Mesh(geos[i % geos.length], mat);
    const angle = (i / members.length) * Math.PI * 2;
    const radius = 3.4;
    mesh.position.set(Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius);
    mesh.castShadow = true;
    mesh.userData = {
      baseY: 0.5,
      floatOffset: i * 1.3,
      rotSpeed: 0.01 + i * 0.005,
      baseScale: 1,
      memberName: m.name,
      defaultEmissive: 0.05
    };
    scene.add(mesh);
    shapes.push(mesh);
  });

  // Connecting Lines
  const lineMat = new THREE.LineBasicMaterial({ color: 0x5ee7ff, transparent: true, opacity: 0.1 });
  const points = shapes.map(s => s.position.clone());
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const geo = new THREE.BufferGeometry().setFromPoints([points[i], points[j]]);
    const line = new THREE.Line(geo, lineMat);
    scene.add(line);
  }
  const center = new THREE.Vector3(0, 0.5, 0);
  points.forEach(p => {
    const geo = new THREE.BufferGeometry().setFromPoints([p, center]);
    const line = new THREE.Line(geo, lineMat);
    scene.add(line);
  });

  // Raycaster
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hoveredShape = null;

  renderer.domElement.addEventListener('mousemove', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(shapes);

    if (hoveredShape) {
      hoveredShape.material.emissiveIntensity = hoveredShape.userData.defaultEmissive;
      hoveredShape.scale.set(1, 1, 1);
      hoveredShape = null;
      renderer.domElement.style.cursor = 'default';
    }

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      hoveredShape = obj;
      obj.material.emissiveIntensity = 0.4;
      obj.scale.set(1.15, 1.15, 1.15);
      renderer.domElement.style.cursor = 'pointer';
    }
  });

  // Animation
  const clock = new THREE.Clock();
  let running = true;
  let rafId = null;

  function animate() {
    if (!running) return;
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    shapes.forEach((shape) => {
      shape.rotation.x += shape.userData.rotSpeed * 0.5;
      shape.rotation.y += shape.userData.rotSpeed;
      shape.position.y = shape.userData.baseY + Math.sin(t * 1.2 + shape.userData.floatOffset) * 0.25;
    });

    particles.rotation.y += 0.001;
    particles.rotation.x = Math.sin(t * 0.02) * 0.02;

    controls.update();
    renderer.render(scene, camera);
  }

  observeSection(sectionEl,
    () => { if (!running) { running = true; animate(); } },
    () => { running = false; if (rafId) cancelAnimationFrame(rafId); }
  );
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = sectionEl.clientWidth / sectionEl.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sectionEl.clientWidth, sectionEl.clientHeight);
  });
})();