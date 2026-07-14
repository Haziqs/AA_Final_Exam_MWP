/* FILE OWNER: Member 4 — others do not edit */
(function initContactScene() {
  const sectionEl = document.getElementById('contact');
  // Replace placeholder with actual contact UI
  sectionEl.innerHTML = `
    <div id="contact-heading" style="position:absolute;top:6%;left:50%;transform:translateX(-50%);text-align:center;z-index:10;color:#4a4038;pointer-events:none;">
      <h2 style="font-size:clamp(1.4rem,3vw,2.2rem);font-weight:600;margin:0;">Contact Us</h2>
    </div>
    <div style="position:absolute;top:20%;left:50%;transform:translateX(-50%);z-index:10;pointer-events:auto;width:min(400px,80%);background:rgba(255,255,255,0.75);backdrop-filter:blur(8px);border-radius:20px;padding:2rem;border:1px solid rgba(255,255,255,0.3);">
      <form id="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
        <div style="margin-bottom:1rem;">
          <label style="display:block;font-weight:500;color:#4a4038;font-size:0.9rem;">Name</label>
          <input type="text" name="name" required style="width:100%;padding:0.6rem;border-radius:8px;border:1px solid #d8cabb;background:rgba(255,255,255,0.8);font-size:0.9rem;">
        </div>
        <div style="margin-bottom:1rem;">
          <label style="display:block;font-weight:500;color:#4a4038;font-size:0.9rem;">Email</label>
          <input type="email" name="email" required style="width:100%;padding:0.6rem;border-radius:8px;border:1px solid #d8cabb;background:rgba(255,255,255,0.8);font-size:0.9rem;">
        </div>
        <div style="margin-bottom:1rem;">
          <label style="display:block;font-weight:500;color:#4a4038;font-size:0.9rem;">Message</label>
          <textarea name="message" rows="3" required style="width:100%;padding:0.6rem;border-radius:8px;border:1px solid #d8cabb;background:rgba(255,255,255,0.8);font-size:0.9rem;"></textarea>
        </div>
        <button type="submit" style="background:#cdb8db;border:none;padding:0.7rem 1.5rem;border-radius:999px;font-weight:600;color:#3d3630;cursor:pointer;width:100%;font-size:1rem;">Send</button>
      </form>
      <div style="margin-top:1.2rem;display:flex;gap:1rem;justify-content:center;">
        <a href="#" style="color:#6b5d4f;text-decoration:none;font-size:0.9rem;">LinkedIn</a>
        <a href="#" style="color:#6b5d4f;text-decoration:none;font-size:0.9rem;">GitHub</a>
        <a href="#" style="color:#6b5d4f;text-decoration:none;font-size:0.9rem;">Email</a>
      </div>
    </div>
    <div class="hint">drag to orbit · use arrow keys to move camera</div>
  `;

  // 3D scene – simple floating rings and particles
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2ede7);
  const camera = new THREE.PerspectiveCamera(45, sectionEl.clientWidth / sectionEl.clientHeight, 0.1, 100);
  camera.position.set(0, 1.5, 8);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(sectionEl.clientWidth, sectionEl.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  sectionEl.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 4;
  controls.maxDistance = 12;
  controls.target.set(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const keyLight = new THREE.DirectionalLight(0xffe9dd, 1.0);
  keyLight.position.set(4, 6, 4);
  scene.add(keyLight);
  const backLight = new THREE.DirectionalLight(0xd8e8f0, 0.5);
  backLight.position.set(-4, 2, -6);
  scene.add(backLight);

  // Floating rings (4 objects)
  const rings = [];
  for (let i = 0; i < 4; i++) {
    const radius = 1.0 + i * 0.6;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.03, 16, 60),
      new THREE.MeshStandardMaterial({ color: 0xd8cabb, transparent: true, opacity: 0.3 + i * 0.1 })
    );
    ring.rotation.x = Math.PI / 3 + i * 0.2;
    ring.rotation.z = i * 0.5;
    ring.position.y = -0.5 + i * 0.4;
    ring.userData = { rotSpeed: 0.01 + i * 0.005, tilt: 0.1 + i * 0.1 };
    scene.add(ring);
    rings.push(ring);
  }

  const clock = new THREE.Clock();
  let running = true;
  let rafId = null;

  function animate() {
    if (!running) return;
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    rings.forEach((ring, i) => {
      ring.rotation.y += ring.userData.rotSpeed;
      ring.rotation.x += Math.sin(t * 0.5 + i) * 0.001;
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

  // Handle form submission (replace FORM_ID with your own Formspree ID)
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    // You can replace the action URL with your own Formspree endpoint
    // For now, alert success
    alert('Message sent! (Demo)');
    this.reset();
  });
})();