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
  scene.background = new THREE.Color(0xf2ede7);
  scene.fog = new THREE.Fog(0xf2ede7, 8, 20);

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

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const keyLight = new THREE.DirectionalLight(0xffe9dd, 1.0);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(9, 64),
    new THREE.MeshStandardMaterial({ color: 0xe9e2d8, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.4;
  floor.receiveShadow = true;
  scene.add(floor);

  let ringGroup = new THREE.Group();
  scene.add(ringGroup);
  let currentOrbs = [];

  function buildRingForMember(memberIndex) {
    ringGroup.children.forEach(child => { child.geometry.dispose(); child.material.dispose(); });
    scene.remove(ringGroup);
    ringGroup = new THREE.Group();
    currentOrbs = [];

    const skills = membersData[memberIndex].skills;
    const radius = 3.2;

    skills.forEach((skill, i) => {
      const angle = (i / skills.length) * Math.PI * 2;
      const orbRadius = 0.35 + skill.level * 0.5;
      const geometry = new THREE.SphereGeometry(orbRadius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: colorFor(skill.category), roughness: 0.45, metalness: 0.08,
        emissive: new THREE.Color(colorFor(skill.category)), emissiveIntensity: 0.12
      });
      const orb = new THREE.Mesh(geometry, material);
      orb.position.set(Math.cos(angle) * radius, 0.4, Math.sin(angle) * radius);
      orb.castShadow = true;
      orb.userData = { skill, baseScale: orb.scale.clone(), floatOffset: i * 1.1, baseY: orb.position.y };
      ringGroup.add(orb);
      currentOrbs.push(orb);
    });
    scene.add(ringGroup);
  }
  buildRingForMember(0);

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
