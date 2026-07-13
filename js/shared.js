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

window.palette = { blush: 0xe8b4b8, sage: 0xb7c9b0, sand: 0xe3cba3, powder: 0xa9c6d8, lilac: 0xcdb8db };
