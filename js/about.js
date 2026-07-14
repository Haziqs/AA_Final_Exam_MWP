/* FILE OWNER: Member 2 — others do not edit */
(function initAboutScene() {
  const sectionEl = document.getElementById('about');
  const members = [
    window.MEMBER1_DATA,
    window.MEMBER2_DATA,
    window.MEMBER3_DATA,
    window.MEMBER4_DATA
  ];

  // Remove placeholder text and style the section
  sectionEl.innerHTML = `
    <div id="about-heading" style="position:absolute;top:6%;left:50%;transform:translateX(-50%);text-align:center;z-index:10;color:#4a4038;pointer-events:none;">
      <h2 style="font-size:clamp(1.4rem,3vw,2.2rem);font-weight:600;margin:0;">About Us</h2>
      <p style="color:#8a7d70;font-size:1rem;">Meet the team behind the portfolio</p>
    </div>
    <div id="about-cards" style="position:absolute;top:20%;left:50%;transform:translateX(-50%);display:flex;gap:1.5rem;flex-wrap:wrap;justify-content:center;z-index:10;pointer-events:none;max-width:80%;">
      ${members.map((m, i) => `
        <div style="background:rgba(255,255,255,0.75);backdrop-filter:blur(8px);border-radius:16px;padding:1.2rem 1.5rem;min-width:180px;max-width:220px;pointer-events:auto;box-shadow:0 4px 20px rgba(0,0,0,0.05);border:1px solid rgba(255,255,255,0.3);">
          <div style="font-weight:600;font-size:1.1rem;color:#4a4038;">${m.name}</div>
          <div style="font-size:0.8rem;color:#8a7d70;margin:0.3rem 0;">${m.about.role || 'Team Member'}</div>
          <div style="font-size:0.75rem;color:#6b5d4f;margin-top:0.4rem;"><span style="font-weight:500;">Education:</span> ${m.about.education || 'N/A'}</div>
          <div style="font-size:0.75rem;color:#6b5d4f;margin-top:0.2rem;"><span style="font-weight:500;">Interests:</span> ${m.about.interests || 'N/A'}</div>
          <div style="font-size:0.75rem;color:#6b5d4f;margin-top:0.2rem;"><span style="font-weight:500;">Achievements:</span> ${(m.about.achievements && m.about.achievements.length) ? m.about.achievements.join(', ') : 'None listed'}</div>
        </div>
      `).join('')}
    </div>
    <div class="hint">drag to orbit · hover to see details</div>
  `;

  // 3D scene: floating geometric shapes representing each member
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2ede7);
  const camera = new THREE.PerspectiveCamera(45, sectionEl.clientWidth / sectionEl.clientHeight, 0.1, 100);
  camera.position.set(0, 2, 10);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(sectionEl.clientWidth, sectionEl.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  sectionEl.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 5;
  controls.maxDistance = 15;
  controls.target.set(0, 0.5, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const keyLight = new THREE.DirectionalLight(0xffe9dd, 1.0);
  keyLight.position.set(5, 8, 5);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xd8e8f0, 0.4);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  // Floor
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(8, 64),
    new THREE.MeshStandardMaterial({ color: 0xe9e2d8, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.2;
  scene.add(floor);

  // Create floating shapes for each member (5 objects total, we already have 5 in landing, but we add 4 more here – that's fine, we already meet the requirement)
  const colors = [0xe8b4b8, 0xa9c6d8, 0xcdb8db, 0xe3cba3];
  const geos = [
    new THREE.TorusKnotGeometry(0.6, 0.2, 64, 16),
    new THREE.OctahedronGeometry(0.7),
    new THREE.DodecahedronGeometry(0.6),
    new THREE.TorusGeometry(0.7, 0.25, 24, 48)
  ];

  const shapes = [];
  members.forEach((m, i) => {
    const mesh = new THREE.Mesh(geos[i % geos.length], new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.4, metalness: 0.1 }));
    const angle = (i / members.length) * Math.PI * 2;
    const radius = 3.2;
    mesh.position.set(Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius);
    mesh.castShadow = true;
    mesh.userData = { baseY: 0.5, floatOffset: i * 1.3, rotSpeed: 0.01 + i * 0.005 };
    scene.add(mesh);
    shapes.push(mesh);
  });

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
      shape.position.y = shape.userData.baseY + Math.sin(t * 1.2 + shape.userData.floatOffset) * 0.2;
    });
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