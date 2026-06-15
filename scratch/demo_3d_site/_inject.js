const PHOENIX_MODES = [
    {
        icon: '\uD83D\uDD25', btn: 'Ember Mode',
        body:  { color: 0xff6b1a, emissive: 0xff3300, ei: 2.5 },
        wing:  { color: 0xff8c33, emissive: 0xff5500, ei: 1.8 },
        tail:  { color: 0xffb347, emissive: 0xff7700, ei: 2.0 },
        light: 0xff5500,
        grid:  { a: [0.808, 0.741, 0.973], b: [0.752, 0.831, 0.961] }
    },
    {
        icon: '\u2744\uFE0F', btn: 'Ice Mode',
        body:  { color: 0x88ddff, emissive: 0x0088ff, ei: 2.8 },
        wing:  { color: 0xaaeeff, emissive: 0x00aaff, ei: 2.2 },
        tail:  { color: 0xccf5ff, emissive: 0x0055ff, ei: 2.0 },
        light: 0x0099ff,
        grid:  { a: [0.2, 0.7, 1.0], b: [0.4, 0.9, 1.0] }
    },
    {
        icon: '\u2600\uFE0F', btn: 'Solar Mode',
        body:  { color: 0xfff0aa, emissive: 0xffdd00, ei: 3.5 },
        wing:  { color: 0xfffacc, emissive: 0xffcc00, ei: 3.0 },
        tail:  { color: 0xffffff, emissive: 0xffee88, ei: 3.2 },
        light: 0xffdd00,
        grid:  { a: [1.0, 0.9, 0.3], b: [1.0, 0.95, 0.5] }
    },
    {
        icon: '\uD83C\uDF11', btn: 'Void Mode',
        body:  { color: 0x8833ff, emissive: 0x5500ff, ei: 3.0 },
        wing:  { color: 0xaa55ff, emissive: 0x7700ff, ei: 2.5 },
        tail:  { color: 0xcc88ff, emissive: 0x9900ff, ei: 2.2 },
        light: 0x6600ff,
        grid:  { a: [0.5, 0.1, 1.0], b: [0.3, 0.05, 0.8] }
    }
];
let phoenixModeIndex = 0;

function applyPhoenixMode(idx) {
    const mode = PHOENIX_MODES[idx];
    if (!birdGroup) return;
    birdGroup.traverse(child => {
        if (!child.isMesh) return;
        const n = child.name;
        let def = mode.body;
        if (n === 'wingL' || n === 'wingR') def = mode.wing;
        if (n && n.startsWith('tail')) def = mode.tail;
        const col = new THREE.Color(def.color);
        const em  = new THREE.Color(def.emissive);
        gsap.to(child.material.color,    { r: col.r, g: col.g, b: col.b, duration: 0.8 });
        gsap.to(child.material.emissive, { r: em.r,  g: em.g,  b: em.b,  duration: 0.8 });
        gsap.to(child.material,          { emissiveIntensity: def.ei, duration: 0.8 });
    });
    birdGroup.children.forEach(c => {
        if (c.isLight) {
            const lc = new THREE.Color(mode.light);
            gsap.to(c.color, { r: lc.r, g: lc.g, b: lc.b, duration: 0.8 });
        }
    });
    if (gridMat && !document.body.classList.contains('dark')) {
        gsap.to(gridMat.uniforms.uColorA.value, { r: mode.grid.a[0], g: mode.grid.a[1], b: mode.grid.a[2], duration: 1 });
        gsap.to(gridMat.uniforms.uColorB.value, { r: mode.grid.b[0], g: mode.grid.b[1], b: mode.grid.b[2], duration: 1 });
    }
    const spiritBtn = document.getElementById('spirit-btn');
    spiritBtn.querySelector('.spirit-btn-icon').textContent = mode.icon;
    spiritBtn.querySelector('.spirit-btn-text').textContent = mode.btn;
    gsap.fromTo(birdGroup.scale,
        { x: 1.2, y: 1.2, z: 1.2 },
        { x: 0.9, y: 0.9, z: 0.9, duration: 0.6, ease: 'elastic.out(1, 0.4)' }
    );
}

document.getElementById('spirit-btn').addEventListener('click', () => {
    phoenixModeIndex = (phoenixModeIndex + 1) % PHOENIX_MODES.length;
    applyPhoenixMode(phoenixModeIndex);
    spawnRipple(document.getElementById('spirit-btn'));
});

function spawnRipple(el) {
    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    const r = document.createElement('div');
    r.style.cssText = 'position:absolute;top:50%;left:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;border:1px solid rgba(206,189,248,0.9);pointer-events:none;z-index:10;filter:blur(1px);';
    el.appendChild(r);
    gsap.fromTo(r,
        { scale: 0.2, opacity: 0.9 },
        { scale: 10, opacity: 0, duration: 0.65, ease: 'power2.out', onComplete: () => r.remove() }
    );
}

document.querySelectorAll('.glass-card').forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    const spot = document.createElement('div');
    spot.style.cssText = 'position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:0;opacity:0;transition:opacity 0.35s ease;';
    card.appendChild(spot);
    card.addEventListener('mouseenter', () => { spot.style.opacity = '1'; });
    card.addEventListener('mouseleave', () => {
        spot.style.opacity = '0';
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'power2.out' });
    });
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const px = (cx / rect.width  - 0.5) * 2;
        const py = (cy / rect.height - 0.5) * 2;
        spot.style.background = 'radial-gradient(circle 220px at ' + cx + 'px ' + cy + 'px, rgba(255,255,255,0.14) 0%, transparent 70%)';
        gsap.to(card, { rotateX: -py * 7, rotateY: px * 9, duration: 0.35, ease: 'power1.out', transformPerspective: 900 });
    });
    card.addEventListener('click', () => spawnRipple(card));
});

document.querySelectorAll('.nav-link, .btn-pill').forEach(el => {
    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.addEventListener('click', () => spawnRipple(el));
});
