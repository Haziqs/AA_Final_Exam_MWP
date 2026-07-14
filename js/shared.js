/* FILE OWNER: Member 1 (Haziq) — others do not edit */

function createPastelTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f6ded2';
  ctx.fillRect(0, 0, size, size);
  const speckleColors = ['#eec9b8', '#f2e3d5', '#e3c9c9', '#ffffff'];
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = speckleColors[Math.floor(Math.random() * speckleColors.length)];
    ctx.globalAlpha = 0.35 + Math.random() * 0.4;
    const r = 2 + Math.random() * 5;
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

function observeSection(sectionEl, onEnter, onExit) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) onEnter(); else onExit();
    });
  }, { threshold: 0.15 });
  observer.observe(sectionEl);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line, x, curY);
      line = words[i] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}

// ---- THEME TOGGLING ----
function createLightBackground() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Warm cream base
  const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 400);
  gradient.addColorStop(0, '#faf5ee');
  gradient.addColorStop(1, '#f2ede7');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  // Pastel blobs (warm, soft)
  const colors = ['#e8b4b8', '#d8cabb', '#cdb8db', '#e3cba3', '#a9c6d8'];
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 60 + Math.random() * 140;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color + '40');
    grad.addColorStop(0.6, color + '20');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createDarkBackground() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 400);
  gradient.addColorStop(0, '#1a1625');
  gradient.addColorStop(1, '#0d0b12');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  const colors = ['#5ee7ff', '#b57bff', '#6effb5', '#ffb35e', '#ff6b9d'];
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 50 + Math.random() * 140;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color + '40');
    grad.addColorStop(0.5, color + '20');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff20';
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Track current theme
let currentTheme = 'light';

function getBackgroundTexture() {
  return currentTheme === 'light' ? createLightBackground() : createDarkBackground();
}

function toggleTheme() {
  currentTheme = (currentTheme === 'light' ? 'dark' : 'light');
  document.body.classList.toggle('dark-theme');
  document.body.classList.toggle('light-theme');
  // Dispatch event so scenes can update
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: currentTheme } }));
  return currentTheme;
}

window.palette = { blush: 0xe8b4b8, sage: 0xb7c9b0, sand: 0xe3cba3, powder: 0xa9c6d8, lilac: 0xcdb8db };
window.createLightBackground = createLightBackground;
window.createDarkBackground = createDarkBackground;
window.getBackgroundTexture = getBackgroundTexture;
window.toggleTheme = toggleTheme;
window.currentTheme = currentTheme;