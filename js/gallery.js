/* FILE OWNER: Member 4 — others do not edit */
(function initGalleryScene() {
  const sectionEl = document.getElementById('gallery');

  const membersProjects = [
    window.MEMBER1_DATA,
    window.MEMBER2_DATA,
    window.MEMBER3_DATA,
    window.MEMBER4_DATA
  ];

  function createCardTexture(title, tech) {
    const w = 512, h = 320;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#faf5ee';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#e3cba3';
    ctx.fillRect(0, 0, w, 10);

    ctx.fillStyle = '#4a4038';
    ctx.font = 'bold 34px Segoe UI, sans-serif';
    wrapText(ctx, title, 28, 70, w - 56, 40);

    ctx.fillStyle = '#8a7d70';
    ctx.font = '20px Segoe UI, sans-serif';
    ctx.fillText(tech.slice(0, 3).join('  ·  '), 28, h - 36);

    return new THREE.CanvasTexture(canvas);
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2ede7);
  scene.fog = new THREE.Fog(0xf2ede7, 8, 20);

  const camera = new THREE.PerspectiveCamera(45, sectionEl.clientWidth / sectionEl.clientHeight, 0.1, 100);
  camera.position.set(0, 1.6, 8);

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
  controls.maxDistance = 12;
  controls.target.set(0, 0.8, 0);

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
  floor.position.y = -1.2;
  floor.receiveShadow = true;
  scene.add(floor);

  let carousel = new THREE.Group();
  scene.add(carousel);
  let currentCards = [];
  let targetRotation = 0;

  function buildCarouselForMember(memberIndex) {
    carousel.children.forEach(card => {
      card.geometry.dispose();
      (Array.isArray(card.material) ? card.material : [card.material]).forEach(m => m.dispose());
    });
    scene.remove(carousel);
    carousel = new THREE.Group();
    currentCards = [];
    targetRotation = 0;

    const projects = membersProjects[memberIndex].projects;
    const radius = 3.6;
    const sideColor = new THREE.MeshStandardMaterial({ color: 0xddd0bf, roughness: 0.6 });

    projects.forEach((project, i) => {
      const angle = (i / projects.length) * Math.PI * 2;
      const texture = createCardTexture(project.title, project.tech);
      const frontMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5 });

      const geometry = new THREE.BoxGeometry(2.1, 1.35, 0.12);
      const materials = [sideColor, sideColor, sideColor, sideColor, frontMat, sideColor];
      const card = new THREE.Mesh(geometry, materials);

      card.position.set(Math.cos(angle) * radius, 0.8, Math.sin(angle) * radius);
      card.lookAt(0, 0.8, 0);
      card.rotateY(Math.PI); 
      card.castShadow = true;
      card.userData = { project, baseScale: card.scale.clone(), angle };

      carousel.add(card);
      currentCards.push(card);
    });
    scene.add(carousel);
  }
  buildCarouselForMember(0);

  const tabsContainer = document.getElementById('gallery-member-tabs');
  let activeMemberIndex = 0;
  membersProjects.forEach((member, index) => {
    const tab = document.createElement('div');
    tab.className = 'member-tab' + (index === 0 ? ' active' : '');
    tab.textContent = member.name;
    tab.addEventListener('click', () => {
      if (index === activeMemberIndex) return;
      activeMemberIndex = index;
      document.querySelectorAll('#gallery-member-tabs .member-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      buildCarouselForMember(index);
      closeDetailPanel();
    });
    tabsContainer.appendChild(tab);
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const detailPanel = document.getElementById('gallery-detail-panel');
  const titleEl = document.getElementById('gallery-project-title');
  const descEl = document.getElementById('gallery-project-desc');
  const techEl = document.getElementById('gallery-project-tech');
  const mediaEl = document.getElementById('gallery-project-media');
  const closeBtn = document.getElementById('gallery-detail-close');

  let hoveredCard = null;

  function openDetailPanel(card) {
    const project = card.userData.project;
    titleEl.textContent = project.title;
    descEl.textContent = project.description;
    techEl.innerHTML = '';
    project.tech.forEach(t => {
      const chip = document.createElement('span');
      chip.className = 'tech-chip';
      chip.textContent = t;
      techEl.appendChild(chip);
    });
    if (project.mediaSrc) {
      mediaEl.innerHTML = '<img src="' + project.mediaSrc + '" alt="' + project.title + '" />';
    } else {
      mediaEl.innerHTML = 'Add an image or video path in mediaSrc';
    }
    detailPanel.classList.add('visible');
  }
  function closeDetailPanel() { detailPanel.classList.remove('visible'); }
  closeBtn.addEventListener('click', closeDetailPanel);

  renderer.domElement.addEventListener('mousemove', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(currentCards);

    if (intersects.length > 0) {
      const card = intersects[0].object;
      if (hoveredCard !== card) {
        if (hoveredCard) hoveredCard.scale.copy(hoveredCard.userData.baseScale);
        hoveredCard = card;
      }
      renderer.domElement.style.cursor = 'pointer';
    } else {
      if (hoveredCard) hoveredCard.scale.copy(hoveredCard.userData.baseScale);
      hoveredCard = null;
      renderer.domElement.style.cursor = 'default';
    }
  });

  renderer.domElement.addEventListener('click', () => {
    if (hoveredCard) openDetailPanel(hoveredCard);
  });

  window.addEventListener('keydown', (e) => {
    const rect = sectionEl.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5;
    if (!inView) return;
    const step = (Math.PI * 2) / Math.max(currentCards.length, 1);
    if (e.key === 'ArrowRight') targetRotation -= step;
    if (e.key === 'ArrowLeft') targetRotation += step;
    if (e.key === 'Escape') closeDetailPanel();
  });

  window.addEventListener('resize', () => {
    camera.aspect = sectionEl.clientWidth / sectionEl.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sectionEl.clientWidth, sectionEl.clientHeight);
  });

  const clock = new THREE.Clock();
  let running = true;
  let rafId = null;
  let autoRotate = 0;

  function animate() {
    if (!running) return;
    rafId = requestAnimationFrame(animate);
    const delta = clock.getDelta();

    autoRotate += delta * 0.12;
    carousel.rotation.y += (targetRotation + autoRotate - carousel.rotation.y) * 0.06;

    currentCards.forEach(card => {
      const targetScale = card === hoveredCard ? card.userData.baseScale.clone().multiplyScalar(1.12) : card.userData.baseScale;
      card.scale.lerp(targetScale, 0.15);
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
