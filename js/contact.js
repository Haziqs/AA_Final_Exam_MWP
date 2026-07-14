/* FILE OWNER: Member 4 — others do not edit */
(function initContactScene() {
  const sectionEl = document.getElementById('contact');

  sectionEl.innerHTML = `
    <style>
      #contact-form-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
        pointer-events: auto;
        width: min(400px, 82%);
        background: rgba(20, 18, 30, 0.7);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-radius: 24px;
        padding: 2rem 1.8rem;
        border: 1px solid rgba(255,255,255,0.06);
        box-shadow: 0 8px 48px rgba(0,0,0,0.4);
      }
      #contact-form-container label { display: block; font-weight: 500; color: #8a8a9c; font-size: 0.85rem; margin-bottom: 0.2rem; }
      #contact-form-container input, #contact-form-container textarea {
        width: 100%;
        padding: 0.6rem 0.8rem;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.05);
        background: rgba(0,0,0,0.3);
        color: #edeef4;
        font-size: 0.9rem;
        font-family: inherit;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }
      #contact-form-container input:focus, #contact-form-container textarea:focus {
        outline: none;
        border-color: #5ee7ff;
        background: rgba(0,0,0,0.4);
      }
      #contact-form-container .form-group { margin-bottom: 1rem; }
      #contact-form-container .submit-btn {
        background: linear-gradient(135deg, #5ee7ff, #b57bff);
        border: none;
        padding: 0.7rem 1.5rem;
        border-radius: 999px;
        font-weight: 600;
        color: #0a0810;
        cursor: pointer;
        width: 100%;
        font-size: 1rem;
        transition: transform 0.15s, box-shadow 0.2s;
      }
      #contact-form-container .submit-btn:hover { transform: scale(1.01); box-shadow: 0 0 30px rgba(94, 231, 255, 0.15); }
      #contact-form-container .social-links {
        margin-top: 1.2rem;
        display: flex;
        gap: 1.2rem;
        justify-content: center;
      }
      #contact-form-container .social-links a {
        color: #8a8a9c;
        text-decoration: none;
        font-size: 0.85rem;
        font-weight: 500;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        transition: color 0.2s, background 0.2s;
      }
      #contact-form-container .social-links a:hover { color: #edeef4; background: rgba(255,255,255,0.05); }
      #form-feedback {
        margin-top: 0.8rem;
        padding: 0.6rem;
        border-radius: 10px;
        text-align: center;
        font-size: 0.85rem;
        display: none;
      }
      #form-feedback.success { display: block; background: rgba(94, 231, 255, 0.1); color: #5ee7ff; border: 1px solid rgba(94, 231, 255, 0.1); }
      #form-feedback.error { display: block; background: rgba(255, 107, 157, 0.1); color: #ff6b9d; border: 1px solid rgba(255, 107, 157, 0.1); }
      @media (max-width: 600px) {
        #contact-form-container { padding: 1.5rem; }
      }
    </style>
    <div id="contact-heading" style="position:absolute;top:6%;left:50%;transform:translateX(-50%);text-align:center;z-index:10;color:#edeef4;pointer-events:none;">
      <h2 style="font-size:clamp(1.4rem,3vw,2.2rem);font-weight:600;margin:0;color:#edeef4;">Contact Us</h2>
    </div>
    <div id="contact-form-container">
      <form id="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
        <div class="form-group">
          <label>Your Name</label>
          <input type="text" name="name" required>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" required>
        </div>
        <div class="form-group">
          <label>Message</label>
          <textarea name="message" rows="3" required></textarea>
        </div>
        <button type="submit" class="submit-btn">Send Message</button>
      </form>
      <div id="form-feedback"></div>
      <div class="social-links">
        <a href="#" target="_blank">LinkedIn</a>
        <a href="#" target="_blank">GitHub</a>
        <a href="mailto:group8@utm.my">Email</a>
      </div>
    </div>
    <div class="hint" style="color:#5a5a6a;">drag to orbit · use arrow keys to nudge</div>
  `;

  // 3D Scene
  const scene = new THREE.Scene();
  scene.background = window.getBackgroundTexture();
  window.addEventListener('themeChanged', function(e) {
    scene.background = window.getBackgroundTexture();
    scene.background.needsUpdate = true;
  });
  const fogColor = document.body.classList.contains('dark-theme') ? 0x0d0b12 : 0xf2ede7;
  scene.fog = new THREE.Fog(fogColor, 6, 15);

  window.addEventListener('themeChanged', function(e) {
    const isDark = document.body.classList.contains('dark-theme');
    scene.fog.color.setHex(isDark ? 0x0d0b12 : 0xf2ede7);
    scene.background = window.getBackgroundTexture();
    scene.background.needsUpdate = true;
  });

  const camera = new THREE.PerspectiveCamera(45, sectionEl.clientWidth / sectionEl.clientHeight, 0.1, 100);
  const startPos = new THREE.Vector3(0, 2, 12);
  const endPos = new THREE.Vector3(0, 1.5, 8);
  camera.position.copy(startPos);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(sectionEl.clientWidth, sectionEl.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  sectionEl.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 4;
  controls.maxDistance = 14;
  controls.target.set(0, 0, 0);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const keyLight = new THREE.DirectionalLight(0xffe9dd, 0.8);
  keyLight.position.set(4, 6, 4);
  scene.add(keyLight);
  const backLight = new THREE.DirectionalLight(0x5ee7ff, 0.3);
  backLight.position.set(-4, 2, -6);
  scene.add(backLight);

  // Particles
  const pCount = 80;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const r = 2 + Math.random() * 3.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
    pPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
    pPos[i*3+2] = r * Math.cos(phi) * 0.6;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0xe8b4b8,
    size: 0.045,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // Floor
  const floorColor = document.body.classList.contains('dark-theme') ? 0x0a0810 : 0xe9e2d8;
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(8, 64),
    new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.9, metalness: 0.0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.0;
  floor.receiveShadow = true;
  scene.add(floor);
  window.addEventListener('themeChanged', function(e) {
    const isDark = document.body.classList.contains('dark-theme');
    floor.material.color.setHex(isDark ? 0x0a0810 : 0xe9e2d8);
  });

  // Rings
  const rings = [];
  for (let i = 0; i < 4; i++) {
    const radius = 0.8 + i * 0.55;
    const ringColor = document.body.classList.contains('dark-theme') ? 0x5ee7ff : 0xcdb8db;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.025, 12, 50),
      new THREE.MeshStandardMaterial({
        color: ringColor,
        transparent: true,
        opacity: 0.08 + i * 0.03,
        roughness: 0.4,
        metalness: 0.3
      })
    );
    ring.rotation.x = Math.PI / 3 + i * 0.15;
    ring.rotation.z = i * 0.4;
    ring.position.y = -0.4 + i * 0.35;
    ring.userData = { rotSpeed: 0.008 + i * 0.004, phase: i * 1.2 };
    scene.add(ring);
    rings.push(ring);
    window.addEventListener('themeChanged', function(e) {
      const isDark = document.body.classList.contains('dark-theme');
      const ringColor = isDark ? 0x5ee7ff : 0xcdb8db;
      rings.forEach(ring => {
        ring.material.color.setHex(ringColor);
      });
    });
  }

  // Intro
  let introProgress = 0;
  const introDuration = 60;

  const clock = new THREE.Clock();
  let running = true;
  let rafId = null;

  function animate() {
    if (!running) return;
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (introProgress < introDuration) {
      introProgress++;
      const p = introProgress / introDuration;
      const eased = 1 - Math.pow(1 - p, 3);
      camera.position.lerpVectors(startPos, endPos, eased);
    }

    rings.forEach((ring, i) => {
      ring.rotation.y += ring.userData.rotSpeed;
      ring.rotation.x += Math.sin(t * 0.4 + ring.userData.phase) * 0.0008;
      ring.position.y += Math.sin(t * 0.6 + ring.userData.phase) * 0.0004;
    });

    particles.rotation.y += 0.0015;
    particles.rotation.x = Math.sin(t * 0.015) * 0.015;

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

  // Form handler (inline feedback)
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    if (!name || !email || !message) {
      feedback.className = 'error';
      feedback.textContent = 'Please fill in all fields.';
      return;
    }

    feedback.className = 'success';
    feedback.textContent = '✓ Message sent successfully! We\'ll get back to you soon.';
    this.reset();

    // Uncomment to use Formspree:
    /*
    fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    }).then(res => {
      if (res.ok) {
        feedback.className = 'success';
        feedback.textContent = '✓ Message sent successfully!';
        form.reset();
      } else {
        feedback.className = 'error';
        feedback.textContent = '❌ Something went wrong. Please try again.';
      }
    }).catch(() => {
      feedback.className = 'error';
      feedback.textContent = '❌ Network error. Please check your connection.';
    });
    */
  });
})();