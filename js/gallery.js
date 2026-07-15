/* FILE OWNER: Member 4 — others do not edit */
(function initGalleryScene() {
  const sectionEl = document.getElementById('gallery');

  const membersProjects = [
    window.MEMBER1_DATA,
    window.MEMBER2_DATA,
    window.MEMBER3_DATA,
    window.MEMBER4_DATA
  ];

  function createCardTexture(project) {
    const w = 512, h = 320;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas);

    const isDark = document.body.classList.contains('dark-theme');
    const bgColor = isDark ? '#1a1625' : '#faf5ee';
    const textColor = isDark ? '#edeef4' : '#4a4038';
    const mutedColor = isDark ? '#8a8a9c' : '#8a7d70';
    const accentColor = isDark ? '#5ee7ff' : '#cdb8db';

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 0, w, 4);

    // Title
    ctx.fillStyle = textColor;
    ctx.font = 'bold 34px Segoe UI, sans-serif';
    wrapText(ctx, project.title, 28, 55, w - 56, 40);

    // Tech Stack
    ctx.fillStyle = mutedColor;
    ctx.font = '20px Segoe UI, sans-serif';
    ctx.fillText(project.tech.slice(0, 3).join('  ·  '), 28, h - 25);

    // Find the first image URL
    let coverImgUrl = null;
    if (project.mediaGallery && project.mediaGallery.length > 0) {
      const firstImg = project.mediaGallery.find(m => m.type === 'image');
      if (firstImg) coverImgUrl = firstImg.src;
    } else if (project.imageSrc) {
      coverImgUrl = project.imageSrc;
    } else if (project.mediaSrc) {
      coverImgUrl = project.mediaSrc;
    }

    if (coverImgUrl) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        // Draw a thumbnail box in the middle (under the title)
        const boxX = 28;
        const boxY = 110;
        const boxW = w - 56;
        const boxH = 140;

        const scale = Math.max(boxW / img.width, boxH / img.height);
        const nw = img.width * scale;
        const nh = img.height * scale;
        const ox = boxX + (boxW - nw) / 2;
        const oy = boxY + (boxH - nh) / 2;
        
        ctx.save();
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(boxX, boxY, boxW, boxH, 8);
        } else {
          ctx.rect(boxX, boxY, boxW, boxH);
        }
        ctx.clip();
        ctx.drawImage(img, ox, oy, nw, nh);
        ctx.restore();

        // Subtle border for the thumbnail
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(boxX, boxY, boxW, boxH, 8);
        } else {
          ctx.rect(boxX, boxY, boxW, boxH);
        }
        ctx.stroke();

        texture.needsUpdate = true;
      };
      img.src = coverImgUrl;
    }

    // Subtle glow over everything
    const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
    const glowColor = isDark ? 'rgba(94, 231, 255, 0.02)' : 'rgba(205, 184, 219, 0.03)';
    gradient.addColorStop(0, glowColor);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    return texture;
  }

  const scene = new THREE.Scene();
  scene.background = window.getBackgroundTexture();
  window.addEventListener('themeChanged', function(e) {
    const isDark = document.body.classList.contains('dark-theme');
    scene.background = window.getBackgroundTexture();
    scene.background.needsUpdate = true;
    floor.material.color.setHex(isDark ? 0x0a0810 : 0xe9e2d8);
    buildCarouselForMember(activeMemberIndex);
  });
  scene.fog = new THREE.Fog(0x0d0b12, 8, 20);

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

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const keyLight = new THREE.DirectionalLight(0xffe9dd, 0.8);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);

  const gridHelper = new THREE.GridHelper(10, 16, 0x5ee7ff, 0x5ee7ff);
  gridHelper.position.y = -1.2;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.06;
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
    const sideColor = new THREE.MeshStandardMaterial({ color: 0x2a2535, roughness: 0.6 });

    projects.forEach((project, i) => {
      const angle = (i / projects.length) * Math.PI * 2;
      const texture = createCardTexture(project);
      const frontMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.4, metalness: 0.2 });

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

  // Update UI styles for dark theme
  const style = document.createElement('style');
  style.textContent = `
    #gallery-heading h2 { color: var(--text); }
    #gallery-member-tabs .member-tab { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: #8a8a9c; }
    #gallery-member-tabs .member-tab:hover { background: rgba(255,255,255,0.15); }
    #gallery-member-tabs .member-tab.active { background: #5ee7ff; border-color: #5ee7ff; color: #0a0810; }
    #gallery-detail-panel { background: rgba(20, 18, 30, 0.9); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.05); color: #edeef4; }
    #gallery-detail-panel h3 { color: #edeef4; }
    #gallery-detail-panel p { color: #8a8a9c; }
    .tech-chip { background: rgba(255,255,255,0.05); color: #8a8a9c; }
    #gallery-detail-close { color: #8a8a9c; }
    #gallery-detail-close:hover { color: #edeef4; }
    #gallery-project-media { background: rgba(255,255,255,0.02); color: #5a5a6a; }
    .hint { color: var(--muted2); }
  `;
  document.head.appendChild(style);

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
    mediaEl.innerHTML = '';
    mediaEl.style.display = 'block';
    mediaEl.style.position = 'relative';

    const mediaList = [];
    
    // Check if new mediaGallery array exists
    if (project.mediaGallery && project.mediaGallery.length > 0) {
      project.mediaGallery.forEach(item => {
        if (item.type === 'image') {
          mediaList.push('<img src="' + item.src + '" alt="' + project.title + '" style="width:100%; max-height:400px; object-fit:contain; border-radius:6px; display:block;" />');
        } else if (item.type === 'video') {
          mediaList.push('<video src="' + item.src + '" controls style="width:100%; max-height:400px; object-fit:contain; border-radius:6px; background:#000; display:block;" preload="metadata"></video>');
        }
      });
    } else {
      // Legacy support for imageSrc, videoSrc, mediaSrc
      if (project.imageSrc) {
        mediaList.push('<img src="' + project.imageSrc + '" alt="' + project.title + '" style="width:100%; max-height:400px; object-fit:contain; border-radius:6px; display:block;" />');
      }
      if (project.videoSrc) {
        mediaList.push('<video src="' + project.videoSrc + '" controls style="width:100%; max-height:400px; object-fit:contain; border-radius:6px; background:#000; display:block;" preload="metadata"></video>');
      }
      if (project.mediaSrc && !project.videoSrc && !project.imageSrc) {
        mediaList.push('<img src="' + project.mediaSrc + '" alt="' + project.title + '" style="width:100%; max-height:400px; object-fit:contain; border-radius:6px; display:block;" />');
      }
    }

    if (mediaList.length === 0) {
      mediaEl.innerHTML = '<div style="padding:10px;">Add an image or video path</div>';
    } else if (mediaList.length === 1) {
      mediaEl.innerHTML = mediaList[0];
    } else {
      // Create a slider
      mediaEl.innerHTML = `
        <div id="media-slider-container" style="position:relative; width:100%;">
          <div id="media-slider-content" style="display:flex; justify-content:center; align-items:center; min-height:400px; background:rgba(0,0,0,0.2); border-radius:6px;">
            ${mediaList[0]}
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:10px; align-items:center;">
            <button id="slider-prev" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:white; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px; transition:0.2s;">&laquo; Prev</button>
            <span id="slider-indicator" style="color:#8a8a9c; font-size:12px;">1 / ${mediaList.length}</span>
            <button id="slider-next" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:white; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px; transition:0.2s;">Next &raquo;</button>
          </div>
        </div>
      `;
      
      let currentIndex = 0;
      const contentEl = document.getElementById('media-slider-content');
      const prevBtn = document.getElementById('slider-prev');
      const nextBtn = document.getElementById('slider-next');
      const indicator = document.getElementById('slider-indicator');

      const updateSlider = () => {
        contentEl.innerHTML = mediaList[currentIndex];
        indicator.textContent = (currentIndex + 1) + ' / ' + mediaList.length;
        prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
        nextBtn.style.opacity = currentIndex === mediaList.length - 1 ? '0.3' : '1';
        prevBtn.style.cursor = currentIndex === 0 ? 'default' : 'pointer';
        nextBtn.style.cursor = currentIndex === mediaList.length - 1 ? 'default' : 'pointer';
      };
      
      updateSlider();

      prevBtn.onclick = () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateSlider();
        }
      };

      nextBtn.onclick = () => {
        if (currentIndex < mediaList.length - 1) {
          currentIndex++;
          updateSlider();
        }
      };
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