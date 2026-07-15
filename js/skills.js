/* FILE OWNER: Member 3 — others do not edit */
(function initSkillsScene() {
  const sectionEl = document.getElementById('skills');

  const membersData = [
    window.MEMBER1_DATA,
    window.MEMBER2_DATA,
    window.MEMBER3_DATA,
    window.MEMBER4_DATA
  ];

  const categoryColors = {
    'Programming': 0xa9c6d8, 'Graphics': 0xcdb8db, 'Frontend': 0xe8b4b8,
    'Backend': 0xb7c9b0, 'Design': 0xe3cba3, 'Data': 0xa9c6d8,
    'Soft Skill': 0xe8b4b8, 'Engineering': 0xb7c9b0, 'Media': 0xcdb8db, 'AI': 0xe3cba3
  };
  function colorFor(category) { return categoryColors[category] !== undefined ? categoryColors[category] : 0xd8cabb; }

  const scene = new THREE.Scene();
  scene.background = window.getBackgroundTexture();
  window.addEventListener('themeChanged', function(e) {
    scene.background = window.getBackgroundTexture();
    scene.background.needsUpdate = true;
  });
  scene.fog = new THREE.Fog(0x0d0b12, 8, 20);

  const camera = new THREE.PerspectiveCamera(45, sectionEl.clientWidth / sectionEl.clientHeight, 0.1, 100);
  camera.position.set(0, 3, 9);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(sectionEl.clientWidth, sectionEl.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  sectionEl.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 5;
  controls.maxDistance = 13;
  controls.target.set(0, 0.5, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const keyLight = new THREE.DirectionalLight(0xffe9dd, 0.8);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);

  const gridHelper = new THREE.GridHelper(10, 16, 0x5ee7ff, 0x5ee7ff);
  gridHelper.position.y = -1.4;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.08;
  scene.add(gridHelper);

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
  floor.position.y = -1.4;
  floor.receiveShadow = true;
  scene.add(floor);

  function makeSmokeTexture(){
    const size = 128;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.35)');
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,size,size);
    return new THREE.CanvasTexture(c);
  }

  const smokeTexture = makeSmokeTexture();

  let ringGroup = new THREE.Group();
  scene.add(ringGroup);
  let currentOrbs = [];
  function buildRingForMember(memberIndex) {
     ringGroup.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    scene.remove(ringGroup);
    ringGroup = new THREE.Group();
    currentOrbs = [];

    const skills = membersData[memberIndex].skills;
    const radius = 3.2;

    skills.forEach((skill, i) => {
      const angle = (i / skills.length) * Math.PI * 2;
      const orbRadius = 0.35 + skill.level * 0.5;
      const geometry = new THREE.IcosahedronGeometry(orbRadius,0);
      const material = new THREE.MeshPhysicalMaterial({
        color: colorFor(skill.category),
        roughness: 0.15,
        metalness: 0.15,
        transmission: 0.35,
        clearcoat: 0.6,
        reflectivity: 0.6,
        emissive: new THREE.Color(colorFor(skill.category)),
        emissiveIntensity: 0.08,
      })
      const orb = new THREE.Mesh(geometry, material);
      orb.position.set(Math.cos(angle) * radius, 0.4, Math.sin(angle) * radius);
      orb.castShadow = true;
      orb.userData = { skill, baseScale: orb.scale.clone(), floatOffset: i * 1.1, baseY: orb.position.y };
      ringGroup.add(orb);
      currentOrbs.push(orb);

      const particleCount = Math.round(6 + skill.level * 55);
      const auraGroup = new THREE.Group();
      const auraParticles = [];
      const color = new THREE.Color(colorFor(skill.category));

      for (let p = 0; p < particleCount; p++) {
        const spriteMat = new THREE.SpriteMaterial({
          map: smokeTexture,
          color: color,
          transparent: true,
          opacity: (0.15 + skill.level * 0.55) * (0.5 + Math.random() * 0.5),
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const sprite = new THREE.Sprite(spriteMat);
        const spriteScale = (0.3 + Math.random() * 0.4) * (0.7 + orbRadius);
        sprite.scale.set(spriteScale, spriteScale, spriteScale);

        const spread = orbRadius * (1.3 + skill.level * 0.4);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = spread * (0.4 + Math.random() * 0.6);
        sprite.position.set(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );
        sprite.userData = {
          driftSpeed: 0.15 + Math.random() * 0.3,
          driftOffset: Math.random() * Math.PI * 2,
          baseR: r,
          theta, phi
        };
        auraGroup.add(sprite);
        auraParticles.push(sprite);
      }
      auraGroup.position.copy(orb.position);
      ringGroup.add(auraGroup);
      orb.userData.aura = auraGroup;
      orb.userData.auraParticles = auraParticles;
    });
    scene.add(ringGroup);
  }
  buildRingForMember(0);

  // Update UI styles for dark theme
  const style = document.createElement('style');
  style.textContent = `
    #section-heading h2 { color: var(--text); }
    .member-tab { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: #8a8a9c; }
    .member-tab:hover { background: rgba(255,255,255,0.15); }
    .member-tab.active { background: #5ee7ff; border-color: #5ee7ff; color: #0a0810; }
    #skill-panel { background: rgba(20, 18, 30, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); color: #edeef4; }
    #skill-panel h3 { color: #edeef4; }
    #skill-panel .category { color: #8a8a9c; }
    #skill-bar-track { background: rgba(255,255,255,0.05); }
    #skill-bar-fill { background: linear-gradient(90deg, #5ee7ff, #b57bff); }
    #skill-level-text { color: #8a8a9c; }
    .hint { color: var(--muted2); }
  `;
  document.head.appendChild(style);

  const tabsContainer = document.getElementById('member-tabs');
  let activeMemberIndex = 0;
  membersData.forEach((member, index) => {
    const tab = document.createElement('div');
    tab.className = 'member-tab' + (index === 0 ? ' active' : '');
    tab.textContent = member.name;
    tab.addEventListener('click', () => {
      if (index === activeMemberIndex) return;
      activeMemberIndex = index;
      document.querySelectorAll('#member-tabs .member-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      buildRingForMember(index);
      hidePanel();
    });
    tabsContainer.appendChild(tab);
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const panel = document.getElementById('skill-panel');
  const skillNameEl = document.getElementById('skill-name');
  const skillCategoryEl = document.getElementById('skill-category');
  const skillBarFill = document.getElementById('skill-bar-fill');
  const skillLevelText = document.getElementById('skill-level-text');

  let lockedOrb = null;
  let hoveredOrb = null;

  function showPanel(orb) {
    const skill = orb.userData.skill;
    skillNameEl.textContent = skill.name;
    skillCategoryEl.textContent = skill.category;
    skillBarFill.style.width = Math.round(skill.level * 100) + '%';
    skillLevelText.textContent = Math.round(skill.level * 100) + '% proficiency';
    panel.classList.add('visible');
  }
  function hidePanel() { panel.classList.remove('visible'); lockedOrb = null; }
  function resetOrbScale(orb) { if (orb) orb.scale.copy(orb.userData.baseScale); }

  renderer.domElement.addEventListener('mousemove', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(currentOrbs);
    if (intersects.length > 0) {
      const orb = intersects[0].object;
      if (hoveredOrb !== orb) {
        resetOrbScale(hoveredOrb);
        hoveredOrb = orb;
        orb.scale.copy(orb.userData.baseScale).multiplyScalar(1.15);
        if (!lockedOrb) showPanel(orb);
      }
      renderer.domElement.style.cursor = 'pointer';
    } else {
      if (hoveredOrb && hoveredOrb !== lockedOrb) resetOrbScale(hoveredOrb);
      hoveredOrb = null;
      renderer.domElement.style.cursor = 'default';
      if (!lockedOrb) hidePanel();
    }
  });

  renderer.domElement.addEventListener('click', () => {
    if (hoveredOrb) {
      if (lockedOrb) resetOrbScale(lockedOrb);
      lockedOrb = hoveredOrb;
      lockedOrb.scale.copy(lockedOrb.userData.baseScale).multiplyScalar(1.3);
      showPanel(lockedOrb);
    } else {
      resetOrbScale(lockedOrb);
      hidePanel();
    }
  });

  window.addEventListener('keydown', (e) => {
    const rect = sectionEl.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5;
    if (!inView) return;
    if (e.key === 'ArrowRight') {
      const next = (activeMemberIndex + 1) % membersData.length;
      document.querySelectorAll('#member-tabs .member-tab')[next].click();
    } else if (e.key === 'ArrowLeft') {
      const prev = (activeMemberIndex - 1 + membersData.length) % membersData.length;
      document.querySelectorAll('#member-tabs .member-tab')[prev].click();
    }
  });

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
    const elapsed = clock.getElapsedTime();
    ringGroup.rotation.y += 0.0025;
    currentOrbs.forEach(orb => {
      orb.position.y = orb.userData.baseY + Math.sin(elapsed * 1.4 + orb.userData.floatOffset) * 0.18;

      const aura = orb.userData.aura;
      if (aura) {
        aura.position.copy(orb.position);
        const isActive = (orb === lockedOrb || orb === hoveredOrb);
        const auraScale = isActive ? 1.15 : 1.0;
        aura.scale.setScalar(auraScale);

        orb.userData.auraParticles.forEach(sprite => {
          const u = sprite.userData;
          const drift = elapsed * u.driftSpeed + u.driftOffset;
          const r = u.baseR + Math.sin(drift) * 0.05;
          const theta = u.theta + drift * 0.1;
          sprite.position.set(
            r * Math.sin(u.phi) * Math.cos(theta),
            r * Math.sin(u.phi) * Math.sin(theta) + Math.sin(drift * 1.3) * 0.05,
            r * Math.cos(u.phi)
          );
          sprite.material.rotation += 0.002;
        });
      }
    });
    controls.update();
    renderer.render(scene, camera);
  }

  observeSection(sectionEl,
    () => { if (!running) { running = true; animate(); } },
    () => { running = false; if (rafId) cancelAnimationFrame(rafId); }
  );

  animate();
})();