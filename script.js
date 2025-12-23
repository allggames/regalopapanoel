// script.js
// Canvas rendering "procedural" con gradientes y brillos, animaciones, posicionamiento de botones,
// modal con cupón + QR generado dinámicamente y confetti.

(() => {
  // Elementos
  const canvas = document.getElementById('santaCanvas');
  const wrap = document.getElementById('canvasWrap');
  const ctx = canvas.getContext('2d', { alpha: true });

  const giftLeft = document.getElementById('giftLeft');
  const giftRight = document.getElementById('giftRight');

  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modalMessage') || null;
  const modalOk = document.getElementById('modalOk');
  const modalClose = document.querySelector('.modal-close');
  const couponArea = document.getElementById('couponArea');

  const confettiContainer = document.getElementById('confetti-container');

  // Mensajes y cupones
  const giftsData = {
    left: { text: "¡Has ganado 50 puntos navideños! 🎉", code: "NAVIDAD50" },
    right: { text: "¡Cupón 10% descuento! 🎁", code: "FIESTA10" }
  };

  // DPI / tamaño
  function resize() {
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // evitar valores extremos
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    layoutButtons(); // reposicionar regalos
  }

  // Coordinates computed relative to canvas CSS size
  let layout = {
    cx: 0, cy: 0, w: 0, h: 0,
    leftHand: { x: 0, y: 0 },
    rightHand: { x: 0, y: 0 }
  };

  function layoutButtons() {
    const rect = canvas.getBoundingClientRect();
    // Use stored layout values computed in draw step (scaled to CSS px)
    // If not set, compute approximate positions
    const left = layout.leftHand;
    const right = layout.rightHand;
    if (left && right && left.x && right.x) {
      // place center of buttons at those coordinates relative to wrap
      const wrapRect = wrap.getBoundingClientRect();
      const btnW = giftLeft.offsetWidth;
      const btnH = giftLeft.offsetHeight;

      giftLeft.style.left = `${Math.round(left.x - btnW/2)}px`;
      giftLeft.style.top  = `${Math.round(left.y - btnH/2)}px`;

      giftRight.style.left = `${Math.round(right.x - btnW/2)}px`;
      giftRight.style.top  = `${Math.round(right.y - btnH/2)}px`;
    } else {
      // fallback positions
      giftLeft.style.left = `8%`;
      giftLeft.style.top  = `46%`;
      giftRight.style.right = `8%`;
      giftRight.style.top  = `46%`;
    }
  }

  // Procedural drawing parameters
  let t0 = performance.now();

  function draw(timestamp) {
    const t = (timestamp - t0) / 1000;
    // clear
    const rect = canvas.getBoundingClientRect();
    layout.cx = rect.width/2;
    layout.cy = rect.height/2;
    layout.w = rect.width;
    layout.h = rect.height;

    ctx.clearRect(0,0,rect.width,rect.height);

    // background soft vignette
    const bgGrad = ctx.createLinearGradient(0, 0, 0, rect.height);
    bgGrad.addColorStop(0, 'rgba(255,245,246,0.85)');
    bgGrad.addColorStop(1, 'rgba(255,235,236,0.95)');
    ctx.fillStyle = bgGrad;
    roundRect(ctx, 0, 0, rect.width, rect.height, 18);
    ctx.fill();

    // compute sizes (based on canvas area)
    const base = Math.min(rect.width, rect.height);
    const chairW = base * 0.75; // visual width in CSS px
    const chairH = base * 0.5;
    const chairX = (rect.width - chairW)/2;
    const chairY = rect.height*0.32;

    // bobbing animation
    const bob = Math.sin(t*1.2) * Math.max(2, base*0.006);

    // draw chair with layers to simulate volume
    drawChair(ctx, chairX, chairY + bob, chairW, chairH, t);

    // Santa body/position relative to chair
    const santaX = rect.width/2;
    const santaY = chairY + chairH*0.12 + bob;
    drawSanta(ctx, santaX, santaY, base, t, (handPos) => {
      // update layout positions in CSS coordinates (handPos provided in CSS px)
      layout.leftHand.x = handPos.left.x;
      layout.leftHand.y = handPos.left.y;
      layout.rightHand.x = handPos.right.x;
      layout.rightHand.y = handPos.right.y;
    });

    // position buttons after draw
    layoutButtons();

    requestAnimationFrame(draw);
  }

  // Utility: rounded rect path
  function roundRect(ctx, x, y, w, h, r) {
    const radius = r;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  // Draw chair (multiple layered rounded rects with gradients and highlights)
  function drawChair(ctx, x, y, w, h, t) {
    // shadow under chair (ellipse)
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(x + w/2, y + h + (h*0.18), w*0.45, h*0.12, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    // back cushion
    const backH = h * 0.6;
    const backY = y;
    const backW = w;
    // gradient for depth
    const gradBack = ctx.createLinearGradient(x, backY, x + backW, backY + backH);
    gradBack.addColorStop(0, '#ff9599');
    gradBack.addColorStop(1, '#e94a4f');
    ctx.fillStyle = gradBack;
    roundRect(ctx, x, backY, backW, backH, Math.min(40, w*0.06));
    ctx.fill();

    // inner cushion
    const innerX = x + w*0.08, innerY = backY + backH*0.12;
    const innerW = w*0.84, innerH = h*0.52;
    const gradInner = ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
    gradInner.addColorStop(0, '#ffb0b5');
    gradInner.addColorStop(1, '#ff6c71');
    ctx.fillStyle = gradInner;
    roundRect(ctx, innerX, innerY, innerW, innerH, Math.min(36, w*0.05));
    ctx.fill();

    // subtle highlight top-left
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.12;
    const highlight = ctx.createRadialGradient(innerX + innerW*0.25, innerY + innerH*0.15, 10, innerX + innerW*0.25, innerY + innerH*0.15, innerW);
    highlight.addColorStop(0, 'rgba(255,255,255,0.9)');
    highlight.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = highlight;
    roundRect(ctx, innerX, innerY, innerW, innerH, Math.min(36, w*0.05));
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // armrests (rounded pill shapes)
    const armW = w*0.22, armH = innerH*0.9;
    const leftArmX = x - w*0.04, leftArmY = innerY + innerH*0.04;
    const rightArmX = x + w - armW + w*0.04, rightArmY = leftArmY;

    // left armrest gradient
    const armGrad = ctx.createLinearGradient(leftArmX, leftArmY, leftArmX + armW, leftArmY + armH);
    armGrad.addColorStop(0, '#ff7f85');
    armGrad.addColorStop(1, '#e94a4f');
    ctx.fillStyle = armGrad;
    roundRect(ctx, leftArmX, leftArmY, armW, armH, Math.min(28, w*0.04));
    ctx.fill();
    roundRect(ctx, rightArmX, rightArmY, armW, armH, Math.min(28, w*0.04));
    ctx.fill();

    // small stitched circles (decor) - like the reference
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.ellipse(leftArmX + armW*0.25, leftArmY + armH*0.35, armW*0.15, armW*0.12, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(rightArmX + armW*0.75, rightArmY + armH*0.35, armW*0.15, armW*0.12, 0, 0, Math.PI*2);
    ctx.fill();

    // seat cushion shadow / crease
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    roundRect(ctx, innerX, innerY + innerH*0.62, innerW, innerH*0.18, Math.min(28, w*0.05));
    ctx.fill();

    // legs of chair (wood)
    const legW = w*0.06, legH = h*0.28;
    ctx.fillStyle = '#e7b988';
    roundRect(ctx, x + w*0.2, y + h - legH*0.05, legW, legH, 6);
    ctx.fill();
    roundRect(ctx, x + w*0.72, y + h - legH*0.05, legW, legH, 6);
    ctx.fill();
  }

  // Draw Santa with simple forms and highlights. We compute hand positions to overlay buttons.
  function drawSanta(ctx, cx, cy, base, t, onHands) {
    // sizes relative to base
    const headR = base * 0.09;
    const bodyW = base * 0.32;
    const bodyH = base * 0.22;

    // body center sits slightly above seat
    const bodyX = cx - bodyW/2;
    const bodyY = cy + (base*0.02);

    // body shadow
    ctx.save();
    const bodyGrad = ctx.createLinearGradient(bodyX, bodyY, bodyX + bodyW, bodyY + bodyH);
    bodyGrad.addColorStop(0, '#ff7a7f');
    bodyGrad.addColorStop(1, '#ff5a60');
    ctx.fillStyle = bodyGrad;
    roundRect(ctx, bodyX, bodyY, bodyW, bodyH, bodyW*0.18);
    ctx.fill();

    // belt
    ctx.fillStyle = '#111';
    roundRect(ctx, bodyX + bodyW*0.2, bodyY + bodyH*0.36, bodyW*0.6, bodyH*0.18, 8);
    ctx.fill();
    // buckle
    ctx.fillStyle = '#e0b43a';
    roundRect(ctx, cx - bodyW*0.04, bodyY + bodyH*0.32, bodyW*0.08, bodyH*0.28, 3);
    ctx.fill();

    // legs / boots
    const bootW = bodyW*0.22, bootH = bodyH*0.32;
    ctx.fillStyle = '#111';
    roundRect(ctx, cx - bodyW*0.32, bodyY + bodyH*0.58, bootW, bootH, 10);
    ctx.fill();
    roundRect(ctx, cx + bodyW*0.1, bodyY + bodyH*0.58, bootW, bootH, 10);
    ctx.fill();

    // arms with slight rotation (animated)
    const armLen = base*0.14;
    const leftArm = {
      ox: bodyX + bodyW*0.08,
      oy: bodyY + bodyH*0.22,
      angle: -0.35 + Math.sin(t*2.5)*0.06
    };
    const rightArm = {
      ox: bodyX + bodyW*0.92,
      oy: bodyY + bodyH*0.22,
      angle: 0.35 + Math.sin(t*2.6 + 0.8)*0.06
    };

    // Draw arms as rounded rectangles rotated
    drawRoundRotatedRect(ctx, leftArm.ox, leftArm.oy, armLen, base*0.045, leftArm.angle, '#ff6f73', 10);
    drawRoundRotatedRect(ctx, rightArm.ox - armLen, rightArm.oy, armLen, base*0.045, rightArm.angle, '#ff6f73', 10);

    // hands coordinates (tip where gift should be)
    // compute end point of arms
    const leftHandX = leftArm.ox + Math.cos(leftArm.angle) * armLen;
    const leftHandY = leftArm.oy + Math.sin(leftArm.angle) * armLen;
    const rightHandX = rightArm.ox - Math.cos(rightArm.angle) * armLen;
    const rightHandY = rightArm.oy + Math.sin(rightArm.angle) * armLen;

    // draw hands (skin)
    ctx.beginPath();
    ctx.fillStyle = '#ffd6c4';
    ctx.ellipse(leftHandX, leftHandY, base*0.03, base*0.03, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(rightHandX, rightHandY, base*0.03, base*0.03, 0, 0, Math.PI*2);
    ctx.fill();

    // save positions for overlay (convert canvas coords to CSS pixels)
    // canvas CSS rect:
    const cssRect = canvas.getBoundingClientRect();
    const dpr = canvas.width / cssRect.width;
    const leftCss = { x: leftHandX, y: leftHandY };
    const rightCss = { x: rightHandX, y: rightHandY };
    // convert canvas coordinate space (we drew in CSS px) -> position relative to wrap
    onHands({
      left: { x: Math.round(leftCss.x - giftLeft.offsetWidth/2), y: Math.round(leftCss.y - giftLeft.offsetHeight/2) },
      right: { x: Math.round(rightCss.x - giftRight.offsetWidth/2), y: Math.round(rightCss.y - giftRight.offsetHeight/2) }
    });

    // Head
    const headX = cx;
    const headY = bodyY - base*0.14;
    // face glow
    const faceGrad = ctx.createRadialGradient(headX - headR*0.2, headY - headR*0.2, headR*0.2, headX, headY, headR*1.4);
    faceGrad.addColorStop(0, '#fff0e8'); faceGrad.addColorStop(1, '#ffd2c0');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.ellipse(headX, headY, headR, headR*0.95, 0, 0, Math.PI*2);
    ctx.fill();

    // beard (simple layered shapes for volume)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(headX - headR*1.1, headY + headR*0.2);
    ctx.quadraticCurveTo(headX, headY + headR*1.3, headX + headR*1.1, headY + headR*0.2);
    ctx.quadraticCurveTo(headX, headY + headR*0.9, headX - headR*1.1, headY + headR*0.2);
    ctx.fill();

    // mustache
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(headX - headR*0.28, headY + headR*0.02, headR*0.28, headR*0.18, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + headR*0.28, headY + headR*0.02, headR*0.28, headR*0.18, 0, 0, Math.PI*2);
    ctx.fill();

    // nose
    ctx.fillStyle = '#ff7d7d';
    ctx.beginPath();
    ctx.ellipse(headX, headY + headR*0.05, headR*0.16, headR*0.12, 0, 0, Math.PI*2);
    ctx.fill();

    // eyes (happy)
    ctx.strokeStyle = '#2b2b2b';
    ctx.lineWidth = Math.max(2, base*0.006);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(headX - headR*0.45, headY - headR*0.05);
    ctx.quadraticCurveTo(headX - headR*0.24, headY + headR*0.15, headX - headR*0.05, headY - headR*0.05);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(headX + headR*0.45, headY - headR*0.05);
    ctx.quadraticCurveTo(headX + headR*0.24, headY + headR*0.15, headX + headR*0.05, headY - headR*0.05);
    ctx.stroke();

    // hat: main (with highlight moving)
    const hatW = headR*2.1, hatH = headR*0.9;
    const hatX = headX - hatW*0.5, hatY = headY - headR*1.02;
    const hatGrad = ctx.createLinearGradient(hatX, hatY, hatX, hatY + hatH);
    hatGrad.addColorStop(0, '#e74046');
    hatGrad.addColorStop(1, '#c83b3f');
    ctx.fillStyle = hatGrad;
    ctx.beginPath();
    ctx.moveTo(hatX, hatY + hatH*0.8);
    ctx.quadraticCurveTo(headX, hatY - hatH*0.6 + Math.sin(t*2)*4, hatX + hatW, hatY + hatH*0.8);
    ctx.lineTo(hatX + hatW, hatY + hatH);
    ctx.lineTo(hatX, hatY + hatH);
    ctx.closePath();
    ctx.fill();

    // hat rim (white)
    ctx.fillStyle = '#fff';
    roundRect(ctx, hatX + hatW*0.08, hatY + hatH*0.76, hatW*0.84, hatH*0.24, hatH*0.12);
    ctx.fill();

    // pompom with dynamic highlight
    ctx.fillStyle = '#fff';
    const pomX = hatX + hatW - hatW*0.08 + Math.sin(t*3)*2;
    const pomY = hatY + hatH*0.16;
    ctx.beginPath();
    ctx.ellipse(pomX - 4, pomY, headR*0.18, headR*0.18, 0, 0, Math.PI*2);
    ctx.fill();
    // hat glossy highlight
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.ellipse(hatX + hatW*0.35 + Math.sin(t*1.5)*6, hatY + hatH*0.28, hatW*0.28, hatH*0.16, -0.3, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // small rosy cheeks
    ctx.fillStyle = 'rgba(255,120,120,0.9)';
    ctx.beginPath();
    ctx.ellipse(headX - headR*0.45, headY + headR*0.07, headR*0.16, headR*0.12, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + headR*0.45, headY + headR*0.07, headR*0.16, headR*0.12, 0, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();

    // decorative gifts drawn beneath buttons (to match visuals)
    ctx.save();
    // left decorative
    drawDecorGift(ctx, leftHandX - base*0.02, leftHandY - base*0.045, base*0.10, t, true);
    // right decorative
    drawDecorGift(ctx, rightHandX + base*0.02, rightHandY - base*0.045, base*0.10, t, false);
    ctx.restore();
  }

  // Helper: draw rounded rotated rect
  function drawRoundRotatedRect(ctx, x, y, w, h, angle, color, r = 8) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    roundRect(ctx, 0, -h/2, w, h, r);
    // gradient
    const g = ctx.createLinearGradient(0, -h/2, w, h/2);
    g.addColorStop(0, lighten(color, 0.06));
    g.addColorStop(1, darken(color, 0.08));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  // decorative gift drawn in canvas (matches button)
  function drawDecorGift(ctx, x, y, size, t, left = true) {
    const s = size;
    ctx.save();
    ctx.translate(x, y);
    // box shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    roundRect(ctx, -s*0.5 + 4, -s*0.5 + 6, s, s, 8);
    ctx.fill();

    // box
    const grad = ctx.createLinearGradient(-s*0.5, -s*0.5, s*0.5, s*0.5);
    grad.addColorStop(0, '#ffd86d');
    grad.addColorStop(1, '#ffc63a');
    ctx.fillStyle = grad;
    roundRect(ctx, -s*0.5, -s*0.5, s, s, s*0.16);
    ctx.fill();

    // ribbon vertical + horizontal
    ctx.fillStyle = '#d94248';
    roundRect(ctx, -s*0.08, -s*0.5, s*0.16, s, s*0.04);
    ctx.fill();
    roundRect(ctx, -s*0.5, -s*0.08, s, s*0.16, s*0.04);
    ctx.fill();

    // bow (animated slightly)
    const bowW = s*0.28, bowH = s*0.16;
    ctx.save();
    const bob = Math.sin(t*6 + (left?0:1))*2;
    ctx.translate(0, -s*0.45 + bob);
    // left loop
    ctx.beginPath();
    ctx.ellipse(-bowW*0.25, 0, bowW*0.5, bowH, -0.4, 0, Math.PI*2);
    ctx.fill();
    // right loop
    ctx.beginPath();
    ctx.ellipse(bowW*0.25, 0, bowW*0.5, bowH, 0.4, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // small color helpers
  function lighten(hex, amt) {
    // simple hex parse
    const c = hexToRgb(hex);
    return `rgb(${Math.min(255, c.r + Math.round(255*amt))},${Math.min(255, c.g + Math.round(255*amt))},${Math.min(255, c.b + Math.round(255*amt))})`;
  }
  function darken(hex, amt) {
    const c = hexToRgb(hex);
    return `rgb(${Math.max(0, c.r - Math.round(255*amt))},${Math.max(0, c.g - Math.round(255*amt))},${Math.max(0, c.b - Math.round(255*amt))})`;
  }
  function hexToRgb(hex) {
    // accept #rrggbb
    const m = hex.replace('#','');
    return { r: parseInt(m.substring(0,2),16), g: parseInt(m.substring(2,4),16), b: parseInt(m.substring(4,6),16) };
  }

  // Modal handling & coupon + QR creation
  function showModalForGift(which) {
    const data = giftsData[which];
    if (!data) return;
    // text
    const msg = data.text;
    // set message text
    const contentP = modal.querySelector('#modalMessage');
    if (contentP) {
      contentP.textContent = msg;
    } else {
      const p = document.createElement('p');
      p.id = 'modalMessage';
      p.textContent = msg;
      modal.querySelector('.modal-content').insertBefore(p, couponArea);
    }

    // build coupon card with QR image (data url)
    couponArea.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'coupon-card';
    const code = document.createElement('div');
    code.className = 'coupon-code';
    code.textContent = data.code;
    const qrImg = document.createElement('img');
    qrImg.alt = `QR para ${data.code}`;
    qrImg.width = 120;
    qrImg.height = 120;
    qrImg.src = generateFakeQRDataURL(data.code, 120);
    card.appendChild(qrImg);
    card.appendChild(code);
    couponArea.appendChild(card);

    modal.setAttribute('aria-hidden', 'false');
    setTimeout(()=> modalOk.focus(), 80);
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
  }

  modalClose.addEventListener('click', closeModal);
  modalOk && modalOk.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e)=> {
    if (e.key === 'Escape') closeModal();
  });

  // Hook gift buttons
  giftLeft.addEventListener('click', ()=> { handleGift('left'); });
  giftRight.addEventListener('click', ()=> { handleGift('right'); });
  // keyboard accessibility
  [giftLeft, giftRight].forEach(btn => {
    btn.addEventListener('keydown', (e)=> {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); btn.click();
      }
    });
  });

  function handleGift(which) {
    showModalForGift(which);
    launchConfetti(36);
    if (navigator.vibrate) navigator.vibrate([60,20,30]);
  }

  // Confetti
  function launchConfetti(count = 30) {
    const colors = ["#ff6b6f","#ffd358","#6bcf8c","#7bb8ff","#f08bff","#ffd1bf"];
    const w = window.innerWidth;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'confetti';
      const size = 6 + Math.random()*16;
      el.style.width = `${Math.round(size)}px`;
      el.style.height = `${Math.round(size*1.3)}px`;
      el.style.background = colors[Math.floor(Math.random()*colors.length)];
      const startX = (w/2) + (Math.random()*300 - 150);
      el.style.left = `${startX}px`;
      el.style.top = `${-20 - Math.random()*80}px`;
      el.style.opacity = '' + (0.85 + Math.random()*0.15);
      el.style.animationDuration = `${900 + Math.random()*1400}ms`;
      el.style.transform = `rotate(${Math.random()*360}deg)`;
      confettiContainer.appendChild(el);
      setTimeout(()=> el.remove(), 2400 + Math.random()*1200);
    }
  }

  // Generate a simple "QR-like" SVG data URL based on code string (visual only)
  function generateFakeQRDataURL(text, size) {
    // create a deterministic pseudo-random grid based on hash
    const grid = 21; // typical QR small grid
    const seed = Array.from(text).reduce((s, c) => (s * 31 + c.charCodeAt(0))>>>0, 7);
    let rnd = seed;
    function rand() { rnd = (rnd * 1664525 + 1013904223) >>> 0; return rnd / 4294967296; }

    const cell = Math.floor(size / grid);
    const svgParts = [];
    svgParts.push(`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>`);
    svgParts.push(`<rect width='100%' height='100%' fill='#fff' />`);
    // border
    svgParts.push(`<rect x='2' y='2' width='${size-4}' height='${size-4}' rx='8' ry='8' fill='none' stroke='#ddd' stroke-width='2'/>`);
    // generate blocks
    for (let y=0;y<grid;y++){
      for (let x=0;x<grid;x++){
        // make three finder-like corners for authenticity
        if ((x<3 && y<3) || (x<3 && y>grid-4) || (x>grid-4 && y<3)) {
          // put solid large squares in corners
          if ((x<3 && y<3) || (x<3 && y>grid-4) || (x>grid-4 && y<3)) {
            const bx = Math.round(x * cell + cell*0.1);
            const by = Math.round(y * cell + cell*0.1);
            svgParts.push(`<rect x='${bx}' y='${by}' width='${Math.round(cell*2.8)}' height='${Math.round(cell*2.8)}' fill='#000' rx='4'/>`);
          }
          continue;
        }
        if (rand() > 0.7) {
          const bx = Math.round(x * cell + cell*0.18);
          const by = Math.round(y * cell + cell*0.18);
          const bw = Math.round(cell*0.64);
          svgParts.push(`<rect x='${bx}' y='${by}' width='${bw}' height='${bw}' fill='#000' rx='2'/>`);
        }
      }
    }
    svgParts.push('</svg>');
    const svg = svgParts.join('');
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }

  // utilities: draw rounded rectangle helper called inside svg path style
  // Already implemented as roundRect above.

  // Start up
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);

  // initial focus handling
  giftLeft.setAttribute('tabindex', '0');
  giftRight.setAttribute('tabindex', '0');
})();
