
    // ──────────────────────────────────────────────────────────────
    // CURSOR
    // ──────────────────────────────────────────────────────────────
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    let mx = 0, my = 0, rx = 0, ry = 0;

    window.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    function tickRing() {
        rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
        ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
        requestAnimationFrame(tickRing);
    }
    tickRing();

    document.querySelectorAll('a, button, .nav-link, .btn-pill, .spirit-btn').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // ──────────────────────────────────────────────────────────────
    // AMBIENT BLOBS — fade in after load
    // ──────────────────────────────────────────────────────────────
    document.querySelectorAll('.ambient-blob').forEach(b => {
        setTimeout(() => b.classList.add('visible'), 800);
    });

    // ──────────────────────────────────────────────────────────────
    // WebGL SCENE
    // ──────────────────────────────────────────────────────────────
    gsap.registerPlugin(ScrollTrigger);

    const container = document.getElementById('canvas-container');
    let scene, camera, renderer;
    let model1, model2, birdGroup;
    let particles, gridMat;
    let clock = new THREE.Clock();
    let mixer;
    let camPath, scrollTL;
    let modelsLoaded = 0;

    function initWebGL() {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 100);
        camera.position.set(0, 0, 5);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(innerWidth, innerHeight);
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.setClearColor(0x000000, 0); // transparent — shows light bg
        container.appendChild(renderer.domElement);

        // ── Camera spline ──────────────────────────────
        camPath = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 5),
            new THREE.Vector3(1.8, 0.6, 3.5),
            new THREE.Vector3(-1.6, -0.3, 2.8),
            new THREE.Vector3(0, 0, 2.0)
        ]);

        // ── Lights ─────────────────────────────────────
        scene.add(new THREE.AmbientLight(0xffffff, 1.2));

        const sun = new THREE.DirectionalLight(0xfffaf0, 2.8);
        sun.position.set(4, 6, 4);
        scene.add(sun);

        const fill = new THREE.DirectionalLight(0xcebdf8, 1.0);
        fill.position.set(-4, -2, -4);
        scene.add(fill);

        const rim = new THREE.DirectionalLight(0xc0d4f5, 0.8);
        rim.position.set(0, -5, -3);
        scene.add(rim);

        // ── Particles — warm tones to match light bg ───
        buildParticles();

        // ── GLSL Grid Plane ────────────────────────────
        buildGrid();

        // ── Load 3D Models ─────────────────────────────
        const gltf = new THREE.GLTFLoader();

        // Model 1: Foreground — Avocado or TorusKnot fallback
        gltf.load(
            'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb',
            gltf => {
                model1 = gltf.scene;
                model1.position.set(1.2, 0, 0);
                model1.rotation.set(0.2, 0.4, 0);
                model1.scale.setScalar(14);
                scene.add(model1);
                modelLoaded();
            }, undefined, () => {
                const g = new THREE.TorusKnotGeometry(0.35, 0.12, 128, 16);
                const m = new THREE.MeshStandardMaterial({ color: 0x8b6f3a, roughness: 0.3, metalness: 0.7 });
                model1 = new THREE.Mesh(g, m);
                model1.position.set(1.2, 0, 0);
                scene.add(model1);
                modelLoaded();
            }
        );

        // Model 2: Background — Duck or Sphere fallback
        gltf.load(
            'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb',
            gltf => {
                model2 = gltf.scene;
                model2.position.set(-1.0, -0.5, -1.8);
                model2.rotation.set(0.1, 0.8, 0);
                model2.scale.setScalar(0.8);
                scene.add(model2);
                modelLoaded();
            }, undefined, () => {
                const g = new THREE.SphereGeometry(0.45, 32, 32);
                const m = new THREE.MeshStandardMaterial({ color: 0xd4a844, roughness: 0.15, metalness: 0.3 });
                model2 = new THREE.Mesh(g, m);
                model2.position.set(-1.0, -0.5, -1.8);
                scene.add(model2);
                modelLoaded();
            }
        );

        // Model 3: Phoenix — proper glowing procedural bird (replaces broken stork)
        buildPhoenix();

        window.addEventListener('resize', () => {
            camera.aspect = innerWidth / innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(innerWidth, innerHeight);
        });

        // Mouse parallax
        window.addEventListener('mousemove', e => {
            const nx = (e.clientX / innerWidth) * 2 - 1;
            const ny = -(e.clientY / innerHeight) * 2 + 1;
            if (model1) gsap.to(model1.rotation, { y: model1.rotation.y + nx * 0.06, duration: 1.2, ease: 'power1.out' });
            if (model2) gsap.to(model2.rotation, { y: model2.rotation.y + nx * 0.03, duration: 1.6, ease: 'power1.out' });
            if (birdGroup) gsap.to(birdGroup.rotation, { y: Math.PI * 0.3 + nx * 0.12, duration: 1, ease: 'power1.out' });
            if (particles) gsap.to(particles.rotation, { x: ny * 0.04, y: particles.rotation.y + nx * 0.02, duration: 2, ease: 'power1.out' });
        });
    }

    function buildParticles() {
        const N = 2800;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(N * 3);
        const col = new Float32Array(N * 3);
        const sizes = new Float32Array(N);

        for (let i = 0; i < N; i++) {
            const i3 = i * 3;
            pos[i3]   = (Math.random() - 0.5) * 14;
            pos[i3+1] = (Math.random() - 0.5) * 14;
            pos[i3+2] = (Math.random() - 0.5) * 12;
            // Warm-toned particles: amber/rose/lavender mix — works on light bg
            const t = Math.random();
            if (t < 0.33) {
                // Amber
                col[i3] = 0.85 + Math.random() * 0.15;
                col[i3+1] = 0.65 + Math.random() * 0.2;
                col[i3+2] = 0.2 + Math.random() * 0.2;
            } else if (t < 0.66) {
                // Rose
                col[i3] = 0.80 + Math.random() * 0.15;
                col[i3+1] = 0.5 + Math.random() * 0.2;
                col[i3+2] = 0.75 + Math.random() * 0.2;
            } else {
                // Ice-blue
                col[i3] = 0.55 + Math.random() * 0.2;
                col[i3+1] = 0.65 + Math.random() * 0.2;
                col[i3+2] = 0.9 + Math.random() * 0.1;
            }
            sizes[i] = Math.random();
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Math.min(devicePixelRatio, 2) } },
            vertexShader: `
                attribute vec3 color;
                attribute float aSize;
                uniform float uTime;
                uniform float uPixelRatio;
                varying vec3 vColor;
                varying float vAlpha;
                void main() {
                    vColor = color;
                    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
                    // Gentle breathing
                    float breathe = sin(uTime * 1.4 + position.x * 0.8 + position.y * 0.5) * 0.5 + 0.5;
                    gl_PointSize = (3.0 + aSize * 4.0 + breathe * 1.5) * uPixelRatio * (1.0 / -mvPos.z);
                    vAlpha = 0.4 + breathe * 0.4;
                    gl_Position = projectionMatrix * mvPos;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                void main() {
                    vec2 uv = gl_PointCoord - 0.5;
                    float d = length(uv);
                    if (d > 0.5) discard;
                    float soft = 1.0 - smoothstep(0.1, 0.5, d);
                    gl_FragColor = vec4(vColor, soft * vAlpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: false
        });

        particles = new THREE.Points(geo, mat);
        scene.add(particles);
    }

    function buildGrid() {
        const geo = new THREE.PlaneGeometry(30, 30, 50, 50);
        gridMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColorA: { value: new THREE.Color(0xcebdf8) },
                uColorB: { value: new THREE.Color(0xc0d4f5) }
            },
            vertexShader: `
                uniform float uTime;
                varying vec2 vUv;
                varying float vElevation;
                void main() {
                    vUv = uv;
                    vec4 mp = modelMatrix * vec4(position, 1.0);
                    float el = sin(mp.x * 0.6 + uTime) * cos(mp.y * 0.6 + uTime * 0.7) * 0.3;
                    mp.y += el;
                    vElevation = el;
                    gl_Position = projectionMatrix * viewMatrix * mp;
                }
            `,
            fragmentShader: `
                uniform vec3 uColorA;
                uniform vec3 uColorB;
                varying vec2 vUv;
                varying float vElevation;
                void main() {
                    float gx = step(0.97, fract(vUv.x * 28.0));
                    float gy = step(0.97, fract(vUv.y * 28.0));
                    float grid = max(gx, gy);
                    if (grid < 0.1) discard;
                    vec3 col = mix(uColorA, uColorB, vElevation + 0.5);
                    gl_FragColor = vec4(col, 0.18 * grid);
                }
            `,
            transparent: true,
            wireframe: false
        });
        const mesh = new THREE.Mesh(geo, gridMat);
        mesh.rotation.x = -Math.PI * 0.5;
        mesh.position.set(0, -2.2, -2);
        scene.add(mesh);
    }

    function buildPhoenix() {
        // Procedural phoenix — elegant layered geometry with warm glow
        birdGroup = new THREE.Group();
        birdGroup.name = 'phoenix';

        const matGlow = new THREE.MeshStandardMaterial({
            color: 0xff6b1a,
            emissive: 0xff4400,
            emissiveIntensity: 2.5,
            roughness: 0.1,
            metalness: 0.05,
            transparent: true,
            opacity: 0.95
        });
        const matWing = new THREE.MeshStandardMaterial({
            color: 0xff8c33,
            emissive: 0xff5500,
            emissiveIntensity: 1.8,
            roughness: 0.2,
            metalness: 0.1,
            transparent: true,
            opacity: 0.88,
            side: THREE.DoubleSide
        });
        const matTail = new THREE.MeshStandardMaterial({
            color: 0xffb347,
            emissive: 0xff7700,
            emissiveIntensity: 2.0,
            roughness: 0.05,
            transparent: true,
            opacity: 0.75,
            side: THREE.DoubleSide
        });

        // Body — sleek teardrop (CylinderGeometry for r128 compat)
        const bodyGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.6, 12);
        const body = new THREE.Mesh(bodyGeo, matGlow);
        body.rotation.z = Math.PI * 0.5;
        birdGroup.add(body);

        // Head
        const headGeo = new THREE.SphereGeometry(0.13, 16, 16);
        const head = new THREE.Mesh(headGeo, matGlow);
        head.position.set(0.38, 0.08, 0);
        birdGroup.add(head);

        // Beak
        const beakGeo = new THREE.ConeGeometry(0.03, 0.18, 6);
        const beak = new THREE.Mesh(beakGeo, matGlow);
        beak.rotation.z = -Math.PI * 0.5;
        beak.position.set(0.55, 0.08, 0);
        birdGroup.add(beak);

        // Wing Left — curved quad via custom shape
        function makeWing(flip) {
            const shape = new THREE.Shape();
            shape.moveTo(0, 0);
            shape.bezierCurveTo(0.1, 0.6, 0.5, 0.7, 0.7, 0.3);
            shape.bezierCurveTo(0.55, 0.05, 0.2, -0.1, 0, 0);
            const wGeo = new THREE.ShapeGeometry(shape, 8);
            const wing = new THREE.Mesh(wGeo, matWing);
            wing.scale.set(0.9, 0.75, 1);
            wing.position.set(-0.05, 0.02, flip ? -0.05 : 0.05);
            if (flip) { wing.rotation.x = Math.PI; wing.rotation.y = Math.PI; }
            wing.name = flip ? 'wingR' : 'wingL';
            birdGroup.add(wing);
            return wing;
        }
        const wingL = makeWing(false);
        const wingR = makeWing(true);

        // Tail — three feather fins
        for (let i = 0; i < 3; i++) {
            const tailGeo = new THREE.PlaneGeometry(0.55, 0.14);
            const tail = new THREE.Mesh(tailGeo, matTail);
            tail.position.set(-0.42, -0.08 + (i - 1) * 0.12, 0);
            tail.rotation.y = ((i - 1) * 0.3);
            tail.name = `tail${i}`;
            birdGroup.add(tail);
        }

        // Glow point light inside bird
        const birdLight = new THREE.PointLight(0xff5500, 1.5, 3);
        birdLight.position.set(0.1, 0.05, 0);
        birdGroup.add(birdLight);

        birdGroup.position.set(-0.9, 0.5, 0.6);
        birdGroup.rotation.set(0.1, Math.PI * 0.3, 0);
        birdGroup.scale.setScalar(0.9);
        scene.add(birdGroup);

        modelLoaded();
    }

    function modelLoaded() {
        modelsLoaded++;
        if (modelsLoaded === 3) {
            startScene();
        }
    }

    function startScene() {
        hidePreloader();
        setupScroll();
        renderLoop();
        showSpiritBtn();
    }

    // Safety net — if any CDN model fails silently, force start after 7s
    setTimeout(() => {
        if (modelsLoaded < 3) {
            console.warn('Preloader timeout — forcing start with', modelsLoaded, 'models loaded.');
            modelsLoaded = 3;
            startScene();
        }
    }, 7000);

    function hidePreloader() {
        const pre = document.getElementById('preloader');
        setTimeout(() => pre.classList.add('hide'), 300);
    }

    function showSpiritBtn() {
        setTimeout(() => document.getElementById('spirit-btn').classList.add('visible'), 1800);
    }

    // ──────────────────────────────────────────────────────────────
    // SCROLL TIMELINE
    // ──────────────────────────────────────────────────────────────
    function setupScroll() {
        if (scrollTL) scrollTL.kill();

        scrollTL = gsap.timeline({
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1.5,
                invalidateOnRefresh: true
            }
        });

        // Camera along spline
        scrollTL.to({}, {
            duration: 3,
            onUpdate() {
                const p = scrollTL.scrollTrigger?.progress ?? 0;
                const pt = camPath.getPointAt(Math.min(p, 0.999));
                camera.position.copy(pt);
                camera.lookAt(0, 0, 0);
            }
        }, 0);

        // Model1 journey
        if (model1) {
            scrollTL
                .to(model1.position, { x: -1.0, y: -0.2, z: 0.3, ease: 'none', duration: 1 }, 0)
                .to(model1.position, { x: 1.0, y: 0.2, z: 0.6, ease: 'none', duration: 1 }, 1)
                .to(model1.position, { x: -0.8, y: 0.0, z: 0.0, ease: 'none', duration: 1 }, 2);
        }
        // Model2 journey
        if (model2) {
            scrollTL
                .to(model2.position, { x: 0.8, y: 0.3, z: -0.8, ease: 'none', duration: 1 }, 0)
                .to(model2.position, { x: -0.8, y: -0.3, z: -1.2, ease: 'none', duration: 1 }, 1)
                .to(model2.position, { x: 0.6, y: 0.1, z: -1.0, ease: 'none', duration: 1 }, 2);
        }
        // Phoenix journey
        if (birdGroup) {
            scrollTL
                .to(birdGroup.position, { x: 0.7, y: 0.2, z: 0.4, ease: 'none', duration: 1 }, 0)
                .to(birdGroup.position, { x: -0.7, y: -0.1, z: 0.7, ease: 'none', duration: 1 }, 1)
                .to(birdGroup.position, { x: 0.5, y: 0.3, z: 0.5, ease: 'none', duration: 1 }, 2);
        }
        // Particles — Z-depth pull + spin
        if (particles) {
            scrollTL
                .to(particles.rotation, { z: 1.0, ease: 'none', duration: 1 }, 0)
                .to(particles.position, { z: 1.8, ease: 'none', duration: 1 }, 1)
                .to(particles.rotation, { z: 2.4, ease: 'none', duration: 1 }, 2)
                .to(particles.position, { z: 0, ease: 'none', duration: 1 }, 2);
        }

        // Text reveals
        document.querySelectorAll('.reveal').forEach(el => {
            ScrollTrigger.create({
                trigger: el,
                start: 'top 88%',
                onEnter: () => el.classList.add('visible'),
                onLeaveBack: () => el.classList.remove('visible')
            });
        });

        ScrollTrigger.refresh();
    }

    // ──────────────────────────────────────────────────────────────
    // ANIMATION LOOP
    // ──────────────────────────────────────────────────────────────
    function renderLoop() {
        requestAnimationFrame(renderLoop);
        const t = clock.getElapsedTime();
        const delta = clock.getDelta();

        // Update shader time
        if (particles?.material?.uniforms?.uTime) particles.material.uniforms.uTime.value = t;
        if (gridMat?.uniforms?.uTime) gridMat.uniforms.uTime.value = t;

        // Phoenix wing flap
        if (birdGroup) {
            const wingL = birdGroup.getObjectByName('wingL');
            const wingR = birdGroup.getObjectByName('wingR');
            if (wingL) wingL.rotation.z = Math.sin(t * 4.5) * 0.45;
            if (wingR) wingR.rotation.z = -Math.sin(t * 4.5) * 0.45;

            // Tail feather shimmer
            for (let i = 0; i < 3; i++) {
                const tail = birdGroup.getObjectByName(`tail${i}`);
                if (tail) tail.rotation.z = Math.sin(t * 2.0 + i * 0.7) * 0.08;
            }

            // Phoenix glow breathing
            birdGroup.children.forEach(c => {
                if (c.isMesh && c.material.emissiveIntensity !== undefined) {
                    if (c.name === 'wingL' || c.name === 'wingR') return;
                    c.material.emissiveIntensity = 2.0 + Math.sin(t * 3) * 0.8;
                }
            });

            // Gentle float
            birdGroup.position.y += Math.sin(t * 1.8) * 0.0012;
        }

        // Idle floats
        if (model1 && modelsLoaded === 3) model1.position.y += Math.sin(t * 1.2) * 0.0007;
        if (model2 && modelsLoaded === 3) { model2.position.y += Math.cos(t * 0.9) * 0.0005; model2.rotation.y += 0.003; }
        if (particles) particles.rotation.y += 0.0006;

        renderer.render(scene, camera);
    }

    // ──────────────────────────────────────────────────────────────
    // AUDIO TOGGLE
    // ──────────────────────────────────────────────────────────────
    const bgAudio = new Audio('https://assets.mixkit.co/music/preview/mixkit-gentle-forest-ambient-1090.mp3');
    bgAudio.loop = true; bgAudio.volume = 0.2;
    let soundOn = false;
    document.getElementById('audio-toggle').addEventListener('click', () => {
        soundOn = !soundOn;
        if (soundOn) {
            bgAudio.play().catch(() => {});
            document.getElementById('audio-icon').textContent = '♫';
            document.getElementById('audio-label').textContent = 'Sound On';
        } else {
            bgAudio.pause();
            document.getElementById('audio-icon').textContent = '♪';
            document.getElementById('audio-label').textContent = 'Sound Off';
        }
    });

    // ──────────────────────────────────────────────────────────────
    // SCROLL-DRIVEN DARK MODE TRANSITION
    // ──────────────────────────────────────────────────────────────
    function setupDarkTransition() {
        // Progress bar element
        const bar = document.createElement('div');
        bar.className = 'theme-indicator';
        document.body.appendChild(bar);

        // Track raw scroll progress
        let darkProgress = 0; // 0 = fully light, 1 = fully dark
        let currentlyDark = false;

        // GSAP ScrollTrigger to toggle dark class + update progress bar
        ScrollTrigger.create({
            trigger: '#section-3',   // starts going dark at section 3
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: true,
            onUpdate(self) {
                darkProgress = self.progress;
                bar.style.width = (ScrollTrigger.getAll()[0]?.progress * 100 || 0) + '%';

                // Crossover at 50% of this trigger
                if (darkProgress > 0.5 && !currentlyDark) {
                    document.body.classList.add('dark');
                    currentlyDark = true;
                    // Shift particles to bright mode
                    if (particles?.material?.uniforms) {
                        gsap.to(particles.material, { opacity: 0.9, duration: 1.2 });
                    }
                    // Shift grid colors
                    if (gridMat?.uniforms) {
                        gsap.to(gridMat.uniforms.uColorA.value, { r: 0.33, g: 0.22, b: 1.0, duration: 1.2 });
                        gsap.to(gridMat.uniforms.uColorB.value, { r: 0.2, g: 0.5, b: 1.0, duration: 1.2 });
                    }
                } else if (darkProgress <= 0.5 && currentlyDark) {
                    document.body.classList.remove('dark');
                    currentlyDark = false;
                    // Restore particles
                    if (particles?.material) {
                        gsap.to(particles.material, { opacity: 0.6, duration: 1.2 });
                    }
                    // Restore grid
                    if (gridMat?.uniforms) {
                        gsap.to(gridMat.uniforms.uColorA.value, { r: 0.808, g: 0.741, b: 0.973, duration: 1.2 });
                        gsap.to(gridMat.uniforms.uColorB.value, { r: 0.752, g: 0.831, b: 0.961, duration: 1.2 });
                    }
                }
            }
        });

        // Also update bar on all scroll
        ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            onUpdate(self) {
                bar.style.width = (self.progress * 100) + '%';
            }
        });
    }

    // ──────────────────────────────────────────────────────────────
    // INIT
    // ──────────────────────────────────────────────────────────────
    initWebGL();
    // Dark transition runs after WebGL + scroll setup are done
    // Slight delay to let ScrollTrigger register all triggers first
    setTimeout(setupDarkTransition, 400);
    