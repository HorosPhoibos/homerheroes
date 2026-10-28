/* =====================================================================
   MEGAH.JS — membuat dunia Homeric lebih megah
   ---------------------------------------------------------------------
   • Siang–senja–malam berganti (langit, matahari, bulan, bintang, kunang-kunang)
   • Efek cahaya berpendar (bloom) untuk emas, api, dan lampu malam
   • Laut bergelombang, Sungai Scamander, jalan batu ke setiap wilayah
   • Agora megah dengan patung emas Athena, Olympus dengan patung Zeus,
     pulau melayang, pilar cahaya & pelangi; Troya dengan benteng, menara,
     bendera & citadel; kemah Yunani dengan 18 kapal, tembok & api unggun;
     mercusuar, pulau Calypso, pusaran Charybdis, taman patung batu Medusa
   • Burung, kupu-kupu, asap api unggun, dan musik lira yang dibangkitkan kode
   Dimuat SETELAH script.js dan memperluas OpenWorld tanpa mengubah data.
   ===================================================================== */
(function () {
    'use strict';
    const T = window.THREE;
    const TAU = Math.PI * 2;
    const PLAZA = { x: 0, z: 50 };
    const DAY_LENGTH = 720; // detik untuk satu hari penuh

    /* ---------------- jalur jalan & sungai ---------------- */
    const OLY = { x: 0, z: -205 };
    const spiral = [];
    for (let i = 0; i <= 26; i++) { const a = Math.PI / 2 + i * 0.2, r = 66 - i * 2.05; spiral.push([OLY.x + Math.cos(a) * r, OLY.z + Math.sin(a) * r]); }
    const ROADS = [
        [[0, 50], [0, 10], [0, -60], [0, -139], ...spiral],
        [[0, 50], [60, 47], [100, 43], [141, 40]],
        [[0, 50], [-60, 58], [-120, 70], [-170, 76]],
        [[0, 50], [-55, 5], [-115, -55], [-168, -96]],
        [[0, 50], [35, 105], [70, 150], [96, 185]],
        [[0, 50], [-35, 105], [-70, 150], [-92, 178]]
    ];
    const RIVER = [[262, -175], [210, -115], [158, -62], [128, -5], [124, 45], [116, 100], [132, 165], [150, 228], [158, 310]];
    const segs = (poly) => { const out = []; for (let i = 0; i < poly.length - 1; i++) out.push([poly[i][0], poly[i][1], poly[i + 1][0], poly[i + 1][1]]); return out; };
    const ROAD_SEGS = ROADS.flatMap(segs), RIVER_SEGS = segs(RIVER);
    const segDist = (x, z, s) => {
        const [ax, az, bx, bz] = s, dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz;
        const t = L ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L)) : 0;
        return Math.hypot(x - (ax + dx * t), z - (az + dz * t));
    };
    const minDist = (x, z, list) => { let m = 1e9; for (const s of list) { const d = segDist(x, z, s); if (d < m) m = d; } return m; };
    const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const lp = (a, b, t) => a + (b - a) * t;
    const rnd = (a, b) => a + Math.random() * (b - a);

    /* ---------------- bentuk tanah tambahan ---------------- */
    const baseHeight = Terrain.height.bind(Terrain);
    Terrain.roadDist = (x, z) => minDist(x, z, ROAD_SEGS);
    Terrain.riverDist = (x, z) => minDist(x, z, RIVER_SEGS);
    Terrain.height = function (x, z) {
        let h = baseHeight(x, z);
        const dT = Math.hypot(x - TROY.x, z - TROY.z);
        h += 5.5 * (1 - sm(9, 17, dT));                         // bukit citadel Pergamos
        // tanggul jalan ke atas citadel (dari gerbang barat)
        const dr = this.riverDist(x, z);
        if (dr < 12) h = lp(-0.9, h, sm(3.5, 11, dr));          // Sungai Scamander
        const dR = this.roadDist(x, z);
        if (dR < 5) h = Math.max(h, lp(1.8, h, sm(2.6, 5, dR))); // jalan & tempat menyeberang sungai
        const dp = Math.hypot(x - PLAZA.x, z - PLAZA.z);
        h = lp(h, 3.2, 1 - sm(20, 28, dp));                     // Agora rata
        return h;
    };
    Terrain.land = function (x, z) { return this.height(x, z) > 0.9; };

    /* ---------------- pembangun statis (digabung jadi sedikit mesh) ---------------- */
    const GC = new Map();
    const geo = (k, f) => { if (!GC.has(k)) GC.set(k, f()); return GC.get(k); };
    const BOX = (w, h, d) => geo(`b${w},${h},${d}`, () => new T.BoxGeometry(w, h, d));
    const CYL = (a, b, h, s = 8) => geo(`c${a},${b},${h},${s}`, () => new T.CylinderGeometry(a, b, h, s));
    const CONE = (r, h, s = 6) => geo(`k${r},${h},${s}`, () => new T.ConeGeometry(r, h, s));
    const PRISM = () => geo('prism', () => { const g = new T.CylinderGeometry(1, 1, 1, 3); g.rotateZ(Math.PI / 2); g.rotateX(-Math.PI / 2); g.translate(0, 0.5, 0); return g; });
    const mk = (g, c, glow) => { const m = new T.Mesh(g); m.userData.c = c; if (glow) m.userData.glow = true; return m; };
    const box = (w, h, d, c, x = 0, y = 0, z = 0, glow) => { const m = mk(BOX(w, h, d), c, glow); m.position.set(x, y, z); return m; };
    const cyl = (a, b, h, c, x = 0, y = 0, z = 0, s = 8, glow) => { const m = mk(CYL(a, b, h, s), c, glow); m.position.set(x, y, z); return m; };
    const G = (...k) => { const g = new T.Group(); k.forEach((o) => o && g.add(o)); return g; };


    /* ---------------- peta padat (v5.1): setiap balok bangunan dicatat ke grid ----------------
       Dipakai untuk: tabrakan pemain & tokoh dengan dinding/rumah/kolom (presisi per 0,75 m),
       menempatkan tokoh agar tidak pernah di dalam bangunan, kamera, dan label nama. */
    const GRID = { S: 0.75, half: 700 };
    GRID.N = Math.ceil(GRID.half * 2 / GRID.S);
    GRID.solid = new Uint8Array(GRID.N * GRID.N);
    GRID.top = new Float32Array(GRID.N * GRID.N).fill(-1e9);
    GRID.gh = new Float32Array(GRID.N * GRID.N).fill(NaN);
    const gIdx = (x, z) => { const i = Math.floor((x + GRID.half) / GRID.S), j = Math.floor((z + GRID.half) / GRID.S); return (i < 0 || j < 0 || i >= GRID.N || j >= GRID.N) ? -1 : j * GRID.N + i; };
    const gGround = (k, x, z) => { let h = GRID.gh[k]; if (h !== h) { h = GRID.gh[k] = Terrain.height(x, z); } return h; };
    const _bb = new T.Box3(), _inv = new T.Matrix4(), _v = new T.Vector3();
    function recordSolid(m) {
        const g = m.geometry; if (!g.boundingBox) g.computeBoundingBox();
        const lb = g.boundingBox, cylR = g.type === 'CylinderGeometry' ? Math.max(g.parameters.radiusTop, g.parameters.radiusBottom) : 0;
        _bb.copy(lb).applyMatrix4(m.matrixWorld);
        if (_bb.max.y - _bb.min.y < 0.05) return;
        const thin = (_bb.max.x - _bb.min.x) < 0.55 && (_bb.max.z - _bb.min.z) < 0.55;
        _inv.copy(m.matrixWorld).invert();
        const inside = (x, y, z) => {
            _v.set(x, y, z).applyMatrix4(_inv);
            if (_v.y < lb.min.y || _v.y > lb.max.y) return false;
            if (cylR) return _v.x * _v.x + _v.z * _v.z <= cylR * cylR;
            return _v.x >= lb.min.x && _v.x <= lb.max.x && _v.z >= lb.min.z && _v.z <= lb.max.z;
        };
        const S = GRID.S, i0 = Math.floor((_bb.min.x + GRID.half) / S), i1 = Math.floor((_bb.max.x + GRID.half) / S), j0 = Math.floor((_bb.min.z + GRID.half) / S), j1 = Math.floor((_bb.max.z + GRID.half) / S);
        const midY = (_bb.min.y + _bb.max.y) / 2, topY = _bb.max.y;
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
            if (i < 0 || j < 0 || i >= GRID.N || j >= GRID.N) continue;
            const k = j * GRID.N + i, x = (i + 0.5) * S - GRID.half, z = (j + 0.5) * S - GRID.half;
            // apakah balok ini mengisi kolom sel ini?
            const hitMid = inside(x, midY, z) || inside(x, topY - 0.02, z) || inside(x, _bb.min.y + 0.02, z);
            if (!hitMid) continue;
            const gh = gGround(k, x, z);
            if (topY < gh + 0.6) continue; // cukup rendah untuk dilangkahi (lantai jembatan, anak tangga pertama)
            if (!thin && (inside(x, gh + 0.75, z) || inside(x, gh + 1.25, z) || inside(x, gh + 1.75, z))) GRID.solid[k] = 1;
            if (!thin && topY > GRID.top[k]) GRID.top[k] = topY;
        }
    }
    const solidAt = (x, z) => { const k = gIdx(x, z); return k >= 0 && GRID.solid[k] === 1; };
    const solidNear = (x, z, r = 0.35) => solidAt(x, z) || solidAt(x + r, z) || solidAt(x - r, z) || solidAt(x, z + r) || solidAt(x, z - r);
    const topAt = (x, z) => { const k = gIdx(x, z); return k < 0 ? -1e9 : GRID.top[k]; };
    function bake(group, mats, local) {
        group.updateMatrixWorld(true);
        const inv = local ? new T.Matrix4().copy(group.matrixWorld).invert() : null, M = new T.Matrix4();
        const solid = [], glow = [], col = new T.Color();
        group.traverse((m) => {
            if (!m.isMesh || m.userData.c === undefined) return;
            if (!local) recordSolid(m);
            let g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
            Object.keys(g.attributes).forEach((k) => { if (k !== 'position' && k !== 'normal') g.deleteAttribute(k); });
            M.copy(m.matrixWorld); if (inv) M.premultiply(inv);
            g.applyMatrix4(M);
            col.set(m.userData.c);
            const n = g.attributes.position.count, a = new Float32Array(n * 3);
            for (let i = 0; i < n; i++) { a[i * 3] = col.r; a[i * 3 + 1] = col.g; a[i * 3 + 2] = col.b; }
            g.setAttribute('color', new T.BufferAttribute(a, 3));
            (m.userData.glow ? glow : solid).push(g);
        });
        const out = new T.Group();
        if (solid.length) out.add(new T.Mesh(T.BufferGeometryUtils.mergeGeometries(solid), mats.solid));
        if (glow.length) out.add(new T.Mesh(T.BufferGeometryUtils.mergeGeometries(glow), mats.glow));
        solid.concat(glow).forEach((g) => g.dispose());
        return out;
    }

    /* ---------------- bangunan ---------------- */
    function temple(w, d, o = {}) {
        const g = new T.Group(), colC = o.col || '#fff6e6', roof = o.roof || '#ff8f6b', gold = o.gold || '#ffcf4a';
        for (let t = 0; t < 3; t++) g.add(box(w + 4 - t * 1.2, 0.55, d + 4 - t * 1.2, t % 2 ? '#f3e6cf' : '#fff8ec', 0, 0.28 + t * 0.55, 0));
        const base = 1.65, H = o.h || 7;
        const nw = o.cols || Math.max(4, Math.round(w / 2.4) + 1), nd = Math.max(3, Math.round(d / 2.6) + 1);
        const colG = CYL(0.42, 0.5, H, 10), capG = BOX(1.2, 0.35, 1.2);
        const colAt = (x, z) => { const c = mk(colG, colC); c.position.set(x, base + H / 2, z); g.add(c); const cp = mk(capG, '#f3e6cf'); cp.position.set(x, base + H + 0.17, z); g.add(cp); };
        for (let i = 0; i < nw; i++) { const x = -w / 2 + (i / (nw - 1)) * w; colAt(x, -d / 2); colAt(x, d / 2); }
        for (let i = 1; i < nd - 1; i++) { const z = -d / 2 + (i / (nd - 1)) * d; colAt(-w / 2, z); colAt(w / 2, z); }
        g.add(box(w - 1.6, H * 0.85, d - 1.6, o.cella || '#e8d6b8', 0, base + H * 0.42, 0));
        g.add(box(w + 1.4, 0.7, d + 1.4, colC, 0, base + H + 0.7, 0));
        g.add(box(w + 1.5, 0.45, d + 1.5, o.frieze || '#5cb8ff', 0, base + H + 1.25, 0));
        const top = base + H + 1.5;
        const r = mk(PRISM(), roof); r.scale.set(w + 1.8, 2.2 / 1.5, (d + 2) / 1.732); r.position.y = top; g.add(r);
        [-1, 1].forEach((s) => { const a = mk(BOX(0.6, 0.9, 0.6), gold); a.position.set(s * (w / 2 + 0.7), top + 0.4, 0); g.add(a); });
        const a = mk(BOX(0.7, 1.1, 0.7), gold); a.position.set(0, top + 2.4, 0); g.add(a);
        if (o.door) g.add(box(2.2, 3.6, 0.2, '#6b4428', 0, base + 1.8, d / 2 - 0.75));
        return g;
    }
    function house(c1, roofC) {
        const g = new T.Group();
        g.add(box(4, 3.2, 4, c1, 0, 1.6, 0));
        g.add(box(4.5, 0.5, 4.5, roofC, 0, 3.45, 0));
        g.add(box(3.6, 0.6, 3.6, roofC, 0, 3.9, 0));
        g.add(box(1, 1.6, 0.15, '#6b4428', 0, 0.8, 2.05));
        g.add(box(0.8, 0.8, 0.12, '#ffd27a', 1.2, 2.1, 2.06, true));
        return g;
    }
    function torch(h = 3.2) { return G(box(0.25, h, 0.25, '#6b4428', 0, h / 2, 0), box(0.5, 0.35, 0.5, '#9b6a2c', 0, h + 0.1, 0), box(0.36, 0.6, 0.36, '#ffb347', 0, h + 0.55, 0, true)); }
    function ship(sail, stripe) {
        const g = new T.Group();
        g.add(box(3.4, 1.6, 12, '#8b5a3c', 0, 1.0, 0));
        g.add(box(2.8, 0.4, 11, '#a8744c', 0, 1.9, 0));
        g.add(box(2.4, 1.2, 2.4, '#6b4428', 0, 2.2, 5.4));
        const prow = mk(BOX(0.6, 3.2, 0.6), '#5a3a24'); prow.position.set(0, 3, 6.6); prow.rotation.x = -0.4; g.add(prow);
        const stern = mk(BOX(0.6, 3, 0.6), '#5a3a24'); stern.position.set(0, 2.8, -6.4); stern.rotation.x = 0.5; g.add(stern);
        [-1, 1].forEach((s) => { g.add(box(0.1, 0.5, 0.9, '#ffffff', s * 1.72, 1.4, 4.6)); g.add(box(0.11, 0.25, 0.4, '#1d1530', s * 1.73, 1.4, 4.6)); for (let k = 0; k < 7; k++) { const o = mk(BOX(0.12, 0.12, 3.4), '#c98a3c'); o.position.set(s * 2.6, 0.9, -4 + k * 1.3); o.rotation.y = s * 0.15; o.rotation.z = s * 0.5; g.add(o); } });
        g.add(box(0.35, 10, 0.35, '#5a3a24', 0, 6.5, 0));
        g.add(box(0.2, 0.2, 7.6, '#5a3a24', 0, 10.6, 0));
        g.add(box(0.15, 5.6, 7, sail, 0, 7.8, 0));
        g.add(box(0.17, 1.2, 7, stripe, 0, 8.2, 0));
        return g;
    }
    function tent(c, big) {
        const s = big ? 1.8 : 1;
        const g = new T.Group();
        const p = mk(PRISM(), c); p.scale.set(4.6 * s, 3.2 * s / 1.5, 3.8 * s / 1.732); g.add(p);
        g.add(box(1.2 * s, 1.8 * s, 0.1, '#5a3a24', 0, 0.9 * s, 1.1 * s));
        return g;
    }

    /* =====================================================================
       Penimpaan (override) metode OpenWorld
       ===================================================================== */
    const OW = OpenWorld.prototype;

    OW._mats = function () {
        if (this.mats) return this.mats;
        this.mats = {
            solid: new T.MeshToonMaterial({ vertexColors: true, gradientMap: this.g.gradient }),
            glow: new T.MeshBasicMaterial({ vertexColors: true, color: new T.Color(2.2, 2.2, 2.2) }),
            gold: new T.MeshToonMaterial({ color: '#ffd04a', emissive: '#8a5200', emissiveIntensity: 0.55, gradientMap: this.g.gradient }),
            stone: new T.MeshToonMaterial({ color: '#cfc8db', gradientMap: this.g.gradient }),
            bronze: new T.MeshStandardMaterial({ color: '#d99a4e', metalness: 0.7, roughness: 0.35, emissive: '#3a1a00', emissiveIntensity: 0.3, flatShading: true })
        };
        return this.mats;
    };
    OW._add = function (group) { const b = bake(group, this._mats()); this.scene.add(b); return b; };
    OW._place = function (o, x, z, yaw = 0, lift = 0) { o.position.set(x, Terrain.height(x, z) + lift, z); o.rotation.y = yaw; return o; };
    OW._statue = function (id, scale, mat, x, z, yaw = 0, pedestal = true) {
        const h = this.g.data.byId.get(id);
        const bh = new BlockHero(h);
        bh.play('Idle'); bh.update(0.01);
        bh.root.traverse((m) => { if (m.isMesh) { m.material = mat; m.castShadow = false; } });
        bh.root.scale.setScalar(scale);
        const y = Terrain.height(x, z);
        if (pedestal) {
            const p = G(box(scale * 1.6, scale * 0.5, scale * 1.6, '#fff6e6', 0, scale * 0.25, 0), box(scale * 1.9, scale * 0.2, scale * 1.9, '#f3e6cf', 0, scale * 0.1, 0), box(scale * 1.65, scale * 0.12, scale * 1.65, '#ffcf4a', 0, scale * 0.52, 0));
            this._add(this._place(p, x, z, yaw));
            bh.root.position.set(x, y + scale * 0.58, z);
        } else bh.root.position.set(x, y, z);
        bh.root.rotation.y = yaw;
        this.scene.add(bh.root);
        return bh;
    };

    /* ---------- langit hidup ---------- */
    OW._sky = function () {
        const geoS = new T.SphereGeometry(1200, 32, 18);
        geoS.setAttribute('color', new T.BufferAttribute(new Float32Array(geoS.attributes.position.count * 3), 3));
        this.skyDome = new T.Mesh(geoS, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false }));
        this.skyDome.renderOrder = -10;
        this.scene.add(this.skyDome);
        // matahari & bulan
        const disc = (c, r) => new T.Mesh(new T.CircleGeometry(r, 24), new T.MeshBasicMaterial({ color: c, fog: false, transparent: true, depthWrite: false }));
        this.sunDisc = disc(new T.Color(1.25, 1.12, 0.85), 30); this.sunHalo = disc('#fff1c0', 70); this.sunHalo.material.opacity = 0.12;
        this.moonDisc = disc(new T.Color(1.6, 1.7, 2), 24);
        [this.sunDisc, this.sunHalo, this.moonDisc].forEach((m) => { m.renderOrder = -9; this.scene.add(m); });
        // bintang
        const N = 1600, sp = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) { const v = new T.Vector3(rnd(-1, 1), rnd(0.05, 1), rnd(-1, 1)).normalize().multiplyScalar(1100); sp.set([v.x, v.y, v.z], i * 3); }
        const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp, 3));
        this.stars = new T.Points(sg, new T.PointsMaterial({ color: new T.Color(2, 2, 2), size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
        this.scene.add(this.stars);
        // awan
        this.clouds = new T.Group();
        this.cloudMat = new T.MeshToonMaterial({ color: '#ffffff', gradientMap: this.g.gradient, transparent: true, opacity: 0.95 });
        const cg = new T.IcosahedronGeometry(1, 1);
        for (let i = 0; i < 60; i++) {
            const cl = new T.Group();
            const n = 4 + (i % 4);
            for (let k = 0; k < n; k++) { const p = new T.Mesh(cg, this.cloudMat); p.position.set(k * 4.5 - n * 2, rnd(-1, 3), rnd(-3, 3)); p.scale.set(rnd(4, 7), rnd(3, 5), rnd(4, 6)); cl.add(p); }
            const a = rnd(0, TAU), r = rnd(80, 520);
            cl.position.set(Math.cos(a) * r, rnd(85, 140), Math.sin(a) * r);
            cl.rotation.y = rnd(0, 6);
            this.clouds.add(cl);
        }
        for (let i = 0; i < 10; i++) {
            const cl = new T.Group();
            for (let k = 0; k < 5; k++) { const p = new T.Mesh(cg, this.cloudMat); p.position.set(k * 3.5 - 7, 0, rnd(-1.5, 1.5)); p.scale.setScalar(rnd(3, 5)); cl.add(p); }
            cl.userData.olympus = (i / 10) * TAU; cl.userData.r = 38 + (i % 3) * 8; cl.userData.y = 60 + (i % 4) * 6;
            this.clouds.add(cl);
        }
        this.scene.add(this.clouds);
        this.timeOfDay = 0.12;
    };

    /* ---------- tanah: jalan batu, tepi sungai, agora ---------- */
    OW._terrain = function () {
        const SIZE = 700, SEG = 150;
        let g = new T.PlaneGeometry(SIZE, SIZE, SEG, SEG);
        g.rotateX(-Math.PI / 2);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) p.setY(i, Terrain.height(p.getX(i), p.getZ(i)));
        g = g.toNonIndexed();
        const pos = g.attributes.position, cols = new Float32Array(pos.count * 3), c = new T.Color();
        const hash = (x, z) => Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
        for (let i = 0; i < pos.count; i += 3) {
            const x = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3, z = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3, y = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
            const r = hash(x, z), dRoad = Terrain.roadDist(x, z), dRiv = Terrain.riverDist(x, z), dP = Math.hypot(x - PLAZA.x, z - PLAZA.z), dT = Math.hypot(x - TROY.x, z - TROY.z);
            let col;
            if (y < 0.2) col = '#3fb6e8';
            else if (y < 1.3) col = r < 0.5 ? '#ffe7b0' : '#fff0c8';
            else if (dP < 21) col = (Math.floor(dP / 3) % 2) ? '#f5e9d4' : '#e9d8b8';
            else if (dRoad < 2.8) col = r < 0.5 ? '#efe2c8' : '#e2d1b0';
            else if (dRiv < 7) col = r < 0.6 ? '#9fe0a0' : '#b8ecc0';
            else if (y > 60) col = r < 0.5 ? '#e9ecfb' : '#dfe3f6';
            else if (y > 24) col = r < 0.5 ? '#c7b3ff' : '#b29ef2';
            else if (dT < 33) col = r < 0.3 ? '#f0d6a0' : '#e8c48a';
            else if (x < -150 && z > 20) col = y < 2.2 ? '#ffe7b0' : (r < 0.5 ? '#8fe08f' : '#7ad48a');
            else if (x < -60 && z > 120) col = r < 0.4 ? '#4fb37a' : '#5fc28a';
            else if (x < -110 && z < -40) col = r < 0.14 ? '#ffc2e2' : r < 0.22 ? '#fff3a8' : '#b6f08a';
            else if (y > 14) col = r < 0.5 ? '#a8e6a0' : '#94dc96';
            else col = r < 0.03 ? '#ffc2e2' : r < 0.5 ? '#8ee88f' : '#7bdc8c';
            c.set(col);
            for (let k = 0; k < 3; k++) cols.set([c.r, c.g, c.b], (i + k) * 3);
        }
        g.setAttribute('color', new T.BufferAttribute(cols, 3));
        g.computeVertexNormals();
        this.ground = new T.Mesh(g, this.toon('#ffffff', { vertexColors: true }));
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
        // laut jauh (datar) + laut dekat (bergelombang, mengikuti pemain)
        const far = new T.Mesh(new T.CircleGeometry(1150, 48), this.toon('#3fbdf5'));
        far.rotation.x = -Math.PI / 2; far.position.y = 0.22; this.scene.add(far);
        const wg = new T.PlaneGeometry(420, 420, 84, 84); wg.rotateX(-Math.PI / 2);
        this.wave = new T.Mesh(wg, new T.MeshStandardMaterial({ color: '#45d0ff', roughness: 0.18, metalness: 0.25, transparent: true, opacity: 0.86, flatShading: true }));
        this.wave.position.y = 0.36;
        this.scene.add(this.wave);
        this.sea = far;
    };

    /* ---------- bangunan megah ---------- */
    OW._landmarks = function () {
        const s = this.scene, M = this._mats();
        this.flags = []; this._fires = []; this.dyn = [];
        const obs = this.obstacles = [];
        const ob = (x, z, r) => obs.push({ x, z, r });
        const flag = (x, y, z, color, size = 1) => {
            const fg = new T.PlaneGeometry(2.4 * size, 1.4 * size, 8, 1); fg.translate(1.2 * size, 0, 0);
            const f = new T.Mesh(fg, new T.MeshToonMaterial({ color, gradientMap: this.g.gradient, side: T.DoubleSide }));
            f.position.set(x, y, z); f.userData.base = fg.attributes.position.array.slice(); f.userData.ph = rnd(0, 6);
            s.add(f); this.flags.push(f); return f;
        };
        const fire = (x, z, big = 1) => {
            const y = Terrain.height(x, z);
            this._add(G(...[0, 1, 2, 3, 4].map((k) => { const l = box(0.3, 0.3, 2.2 * big, '#6b4428', 0, 0.2, 0); l.rotation.y = k * 0.63; return l; })).translateX(x).translateY(y).translateZ(z));
            const f = new T.Mesh(new T.ConeGeometry(0.8 * big, 2 * big, 5), M.glow.clone()); f.material.vertexColors = false; f.material.color = new T.Color(3, 1.6, 0.5);
            f.position.set(x, y + big, z); s.add(f); this._fires.push(f);
            return f;
        };

        /* ===== AGORA (Persimpangan) ===== */
        const ag = new T.Group();
        for (let i = 0; i < 20; i++) {
            const a = (i / 20) * TAU; if (Math.abs(Math.sin(a)) < 0.12 && Math.cos(a) > 0) continue;
            const x = Math.cos(a) * 21, z = Math.sin(a) * 21;
            if (Math.abs(Math.atan2(z, x) - Math.PI / 2) < 0.12) continue; // celah ke selatan (tempat mulai)
            ag.add(cyl(0.55, 0.65, 6.5, '#fff6e6', x, 3.25, z, 10));
            ag.add(box(1.4, 0.4, 1.4, '#f3e6cf', x, 6.7, z));
            const nx = Math.cos(a + TAU / 40) * 21, nz = Math.sin(a + TAU / 40) * 21;
            const beam = box(6.8, 0.6, 1.1, i % 2 ? '#fff6e6' : '#5cb8ff', nx, 7.1, nz); beam.rotation.y = -a - TAU / 40 + Math.PI / 2; ag.add(beam);
        }
        ag.add(cyl(7, 7.4, 1.1, '#fff6e6', 0, 0.55, 0, 24));
        ag.add(cyl(6.3, 6.3, 0.2, '#45d0ff', 0, 1.05, 0, 24));
        for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; ag.add(torch(3.4).translateX(Math.cos(a) * 15).translateZ(Math.sin(a) * 15)); }
        this._add(this._place(ag, PLAZA.x, PLAZA.z));
        this.athena = this._statue('athena', 4.2, M.gold, PLAZA.x, PLAZA.z, Math.PI, true);
        ob(PLAZA.x, PLAZA.z, 7.8);
        for (let i = 0; i < 20; i++) { const a = (i / 20) * TAU; ob(PLAZA.x + Math.cos(a) * 21, PLAZA.z + Math.sin(a) * 21, 0.9); }
        this.athena.root.position.y += 0.6;
        Object.entries(REGIONS).forEach(([k, r]) => { const a = Math.atan2(r.x - PLAZA.x, r.z - PLAZA.z); flag(PLAZA.x + Math.sin(a) * 23.5, Terrain.height(PLAZA.x, PLAZA.z) + 9.2, PLAZA.z + Math.cos(a) * 23.5, KUBU_COLOR[k], 1.6); const pole = box(0.25, 9, 0.25, '#7a4a2a', PLAZA.x + Math.sin(a) * 23.5, Terrain.height(PLAZA.x, PLAZA.z) + 4.5, PLAZA.z + Math.cos(a) * 23.5); this._add(G(pole)); });
        // papan penunjuk (canvas)
        Object.entries(REGIONS).forEach(([k, r]) => {
            const dx = r.x - PLAZA.x, dz = r.z - PLAZA.z, a = Math.atan2(dx, dz);
            const c = document.createElement('canvas'); c.width = 512; c.height = 160; const g2 = c.getContext('2d');
            g2.fillStyle = '#7a4a2a'; g2.fillRect(0, 0, 512, 160); g2.fillStyle = KUBU_COLOR[k]; g2.fillRect(10, 10, 492, 140);
            g2.fillStyle = '#1d1530'; g2.font = 'bold 50px Arial'; g2.textAlign = 'center'; g2.fillText(`${r.name} ➜`, 256, 80); g2.font = '28px Arial'; g2.fillText(`${Math.round(Math.hypot(dx, dz))} langkah`, 256, 126);
            const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
            const b = new T.Mesh(new T.PlaneGeometry(4, 1.25), new T.MeshBasicMaterial({ map: tex, side: T.DoubleSide }));
            const px = PLAZA.x + Math.sin(a) * 27, pz = PLAZA.z + Math.cos(a) * 27, y = Terrain.height(px, pz);
            b.position.set(px, y + 3, pz); b.rotation.y = a + Math.PI / 2; s.add(b);
            this._add(G(box(0.3, 3.2, 0.3, '#7a4a2a', px, y + 1.6, pz)));
        });

        /* ===== OLYMPUS ===== */
        const top = temple(16, 10, { roof: '#ffcf4a', frieze: '#ffffff', cella: '#fff3c4', gold: '#ffe680', h: 8, door: true });
        top.scale.setScalar(1.25);
        this._add(this._place(top, OLY.x, OLY.z + 8, 0, -1));
        this.zeus = this._statue('zeus', 7, M.gold, OLY.x, OLY.z - 10, 0, true);
        ob(OLY.x, OLY.z + 8, 14); ob(OLY.x, OLY.z - 10, 7);
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * TAU, x = OLY.x + Math.cos(a) * 30, z = OLY.z + Math.sin(a) * 30;
            const t = temple(5, 4, { roof: ['#ffcf4a', '#ff8fa3', '#5cb8ff', '#b892ff'][i % 4], frieze: '#ffffff', h: 4 }); t.scale.setScalar(0.85);
            this._add(this._place(t, x, z, -a + Math.PI / 2, -0.6)); ob(x, z, 4.5);
            this._add(this._place(torch(4), OLY.x + Math.cos(a + 0.2) * 24, OLY.z + Math.sin(a + 0.2) * 24));
        }
        // pulau-pulau melayang
        this.islands = [];
        for (let i = 0; i < 6; i++) {
            const g = new T.Group();
            const rock = mk(CONE(7, 11, 7), '#b29ef2'); rock.rotation.x = Math.PI; rock.position.y = -5.5; g.add(rock);
            g.add(cyl(7, 7, 1, '#8ee88f', 0, 0.5, 0, 7));
            const t = temple(4, 3, { roof: ['#ffcf4a', '#ff8fa3', '#5cb8ff'][i % 3], h: 3.2 }); t.scale.setScalar(0.7); t.position.y = 1; g.add(t);
            for (let k = 0; k < 3; k++) { const tr = G(cyl(0.2, 0.3, 1.6, '#a86b4a', 0, 0.8, 0), mk(geo('ico', () => new T.IcosahedronGeometry(1.2, 0)), ['#5fcf7a', '#ff9cc8', '#7be08a'][k])); tr.children[1].position.y = 2.2; tr.position.set(Math.cos(k * 2) * 4.5, 1, Math.sin(k * 2) * 4.5); g.add(tr); }
            const baked = bake(g, M, true);
            baked.userData = { a: (i / 6) * TAU, r: 62 + (i % 2) * 18, y: 92 + (i % 3) * 14, ph: i };
            s.add(baked); this.islands.push(baked);
        }
        // pilar cahaya ke langit
        this.beam = new T.Mesh(new T.CylinderGeometry(2.2, 4, 420, 16, 1, true), new T.MeshBasicMaterial({ color: new T.Color(1.2, 1, 0.45), transparent: true, opacity: 0.16, blending: T.AdditiveBlending, depthWrite: false, fog: false, side: T.DoubleSide }));
        this.beam.position.set(OLY.x, Terrain.height(OLY.x, OLY.z) + 210, OLY.z + 8);
        s.add(this.beam);
        // pelangi Iris di kaki gunung
        const rainbow = new T.Group();
        ['#ff4d6d', '#ff9f1c', '#ffd23f', '#2ee59d', '#4cc9f0', '#3d7bff', '#b14dff'].forEach((c, k) => {
            const m = new T.Mesh(new T.TorusGeometry(46 - k * 1.6, 0.8, 4, 48, Math.PI), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55, depthWrite: false, side: T.DoubleSide }));
            rainbow.add(m);
        });
        rainbow.position.set(0, Terrain.height(0, -110) - 6, -110);
        s.add(rainbow);

        /* ===== TROYA ===== */
        const wallM = '#f2dcae', towerC = '#e8c48a';
        const troy = new T.Group(), N = 48;
        const ty = (x, z) => Terrain.height(TROY.x + x, TROY.z + z);
        this.troyGate = Math.PI;
        const merlon = BOX(1, 1.2, 2.4);
        for (let i = 0; i < N; i++) {
            const a = (i / N) * TAU;
            if (Math.abs(angDiff(a, this.troyGate)) < 0.14) continue;
            const x = Math.cos(a) * TROY.wallR, z = Math.sin(a) * TROY.wallR, y0 = ty(x, z);
            const seg = box(4.6, 13, 2.4, wallM, x, y0 + 5.5, z); seg.rotation.y = -a + Math.PI / 2; troy.add(seg);
            [-1.4, 1.4].forEach((o) => { const m = mk(merlon, wallM); m.position.set(x - Math.sin(a) * o, y0 + 12.6, z + Math.cos(a) * o); m.rotation.y = -a + Math.PI / 2; troy.add(m); });
            if (i % 6 === 0) {
                const tx = Math.cos(a) * (TROY.wallR + 0.5), tz = Math.sin(a) * (TROY.wallR + 0.5);
                troy.add(box(6, 19, 6, towerC, tx, y0 + 8.5, tz));
                troy.add(box(7, 1, 7, '#ffe0b3', tx, y0 + 18.5, tz));
                const roof = mk(CONE(5, 5, 4), '#ff6b4a'); roof.position.set(tx, y0 + 21.5, tz); roof.rotation.y = Math.PI / 4; troy.add(roof);
                troy.add(box(1.2, 1.6, 0.2, '#ffd27a', tx + Math.cos(a) * 3.05, y0 + 12, tz + Math.sin(a) * 3.05, true));
            }
        }
        const gx = -TROY.wallR, gy = ty(gx, 0);
        [-1, 1].forEach((k) => { troy.add(box(6, 21, 6, towerC, gx, gy + 9.5, k * 6.5)); troy.add(box(7, 1, 7, '#ffe0b3', gx, gy + 20.5, k * 6.5)); const r = mk(CONE(5, 5, 4), '#ff6b4a'); r.position.set(gx, gy + 23.5, k * 6.5); r.rotation.y = Math.PI / 4; troy.add(r); });
        troy.add(box(5, 3, 14, '#d9a24e', gx, gy + 15.5, 0));
        troy.add(box(0.4, 9, 3.2, '#6b4428', gx - 1.5, gy + 4.5, -3.4)); troy.add(box(0.4, 9, 3.2, '#6b4428', gx - 1.5, gy + 4.5, 3.4));
        troy.add(box(0.5, 1.4, 6, '#ffcf4a', gx - 2.6, gy + 13, 0));
        for (let i = 0; i < 34; i++) {
            const a = rnd(0, TAU), r = rnd(18, 29);
            if (Math.abs(angDiff(a, this.troyGate)) < 0.35) continue;
            const hz = house(['#fff1d6', '#ffe9f0', '#f0f7ff', '#fff6c8'][i % 4], ['#ff8f5a', '#ff6b6b', '#ffb347', '#e85d75'][i % 4]);
            hz.position.set(Math.cos(a) * r, ty(Math.cos(a) * r, Math.sin(a) * r), Math.sin(a) * r); hz.rotation.y = -a; troy.add(hz); ob(TROY.x + Math.cos(a) * r, TROY.z + Math.sin(a) * r, 3.2);
        }
        troy.position.set(TROY.x, 0, TROY.z);
        this._add(troy);
        // citadel di atas bukit: istana Priam & kuil Apollo, Athena
        const pal = temple(18, 12, { roof: '#ff6b4a', frieze: '#ffcf4a', cella: '#ffe9c6', h: 8, door: true });
        this._add(this._place(pal, TROY.x + 3, TROY.z, Math.PI / 2, -0.4)); ob(TROY.x + 3, TROY.z + 4, 9); ob(TROY.x + 3, TROY.z - 4, 9);
        const apo = temple(9, 6, { roof: '#ffcf4a', frieze: '#ff8f5a', h: 6 }); this._add(this._place(apo, TROY.x + 12, TROY.z - 13, 0.4, -0.3)); ob(TROY.x + 12, TROY.z - 13, 6.5);
        const ath = temple(8, 6, { roof: '#5cb8ff', frieze: '#ffffff', h: 6 }); this._add(this._place(ath, TROY.x + 12, TROY.z + 13, -0.4, -0.3)); ob(TROY.x + 12, TROY.z + 13, 6);
        for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; flag(TROY.x + Math.cos(a) * (TROY.wallR + 0.5), Terrain.height(TROY.x, TROY.z) + 4 + 21.5, TROY.z + Math.sin(a) * (TROY.wallR + 0.5), ['#ff4d6d', '#ffd23f'][i % 2], 1.3); }
        [-1, 1].forEach((k) => flag(TROY.x + gx, Terrain.height(TROY.x + gx, TROY.z) + 26, TROY.z + k * 6.5, '#ff4d6d', 1.6));
        for (let k = -2; k <= 2; k++) this._add(this._place(torch(3.6), TROY.x + gx - 5, TROY.z + k * 4));

        /* ===== KEMAH YUNANI ===== */
        for (let i = 0; i < 18; i++) {
            const row = i % 2, z = 6 + Math.floor(i / 2) * 15 + row * 7, x = -258 + row * 12 + Math.sin(i) * 2;
            const sh = ship(['#ffffff', '#ffe3a3', '#ffd6e8', '#cfe6ff'][i % 4], ['#ff4d6d', '#2f6fd8', '#ffd23f', '#2fb67a'][i % 4]);
            sh.position.set(x, Math.max(0.3, Terrain.height(x, z)) - 0.3, z); sh.rotation.y = Math.PI / 2 + 0.15 * Math.sin(i * 3);
            this._add(sh); ob(x, z - 4, 3.6); ob(x, z, 3.6); ob(x, z + 4, 3.6);
            flag(x, sh.position.y + 11.4, z, ['#ff4d6d', '#2f6fd8', '#ffd23f'][i % 3], 0.8);
        }
        const camp = new T.Group();
        for (let i = 0; i < 26; i++) { const t = tent(['#ffffff', '#f3e6c8', '#cfe6ff', '#ffd6e8', '#e9f7d8'][i % 5]); t.position.set(-200 + rnd(-28, 28), 0, 70 + rnd(-48, 48)); t.rotation.y = rnd(0, 6); camp.add(t); }
        camp.children.forEach((t) => { t.position.y = Terrain.height(t.position.x, t.position.z); ob(t.position.x, t.position.z, 3); });
        ob(-205, 55, 5.5); ob(-190, 110, 5.5);
        const agTent = tent('#7b3fc4', true); agTent.position.set(-205, Terrain.height(-205, 55), 55); camp.add(agTent);
        const acTent = tent('#2f6fd8', true); acTent.position.set(-190, Terrain.height(-190, 110), 110); acTent.rotation.y = 0.6; camp.add(acTent);
        this._add(camp);
        flag(-205, Terrain.height(-205, 55) + 9, 55, '#7b3fc4', 1.4); this._add(G(box(0.3, 9, 0.3, '#5a3a24', -205, Terrain.height(-205, 55) + 4.5, 55)));
        flag(-190, Terrain.height(-190, 110) + 9, 110, '#2f6fd8', 1.4); this._add(G(box(0.3, 9, 0.3, '#5a3a24', -190, Terrain.height(-190, 110) + 4.5, 110)));
        // tembok kayu Achaea + parit (Iliad 7 & 12)
        const pal2 = new T.Group();
        for (let z = -10; z <= 150; z += 1.6) { if (Math.abs(z - 76) < 6) continue; const x = -150 + Math.sin(z * 0.05) * 3; const st = box(0.6, rnd(3.4, 4.4), 0.6, '#a8744c', x, 1.9, z); st.position.y = Terrain.height(x, z) + 1.9; st.rotation.z = 0.15; pal2.add(st); }
        this._add(pal2);
        [[-200, 80], [-185, 40], [-215, 105], [-195, 130], [-222, 60]].forEach(([x, z], i) => fire(x, z, i === 0 ? 1.6 : 1));
        // Kuda Troya
        const horse = new T.Group(), hw = '#b07a48';
        [[3.4, 3.4, 8, 0, 6, 0], [1.8, 5, 2.2, 0, 10, 3.4], [2, 2, 3.6, 0, 12.4, 4.8], [0.4, 1.2, 1.4, 0, 13.6, 4], [3.8, 0.7, 9, 0, 0.35, 0]].forEach(([w, h, d, x, y, z]) => horse.add(box(w, h, d, hw, x, y, z)));
        [-1, 1].forEach((sx) => [2.8, -2.8].forEach((z) => horse.add(box(1, 4.6, 1, hw, sx * 1.1, 2.6, z))));
        [-1, 1].forEach((sx) => horse.add(box(0.2, 0.4, 0.4, '#1d1530', sx * 1.01, 12.8, 5.6)));
        for (let k = 0; k < 4; k++) horse.add(box(0.3, 14, 0.3, '#8b5a3c', (k % 2 ? 3 : -3), 7, k < 2 ? -4.5 : 6));
        horse.add(box(6.4, 0.3, 0.3, '#8b5a3c', 0, 8, -4.5)); horse.add(box(6.4, 0.3, 0.3, '#8b5a3c', 0, 8, 6));
        this._add(this._place(horse, -160, 32, Math.PI / 2.4)); ob(-160, 32, 6);

        /* ===== PADANG LEGENDA ===== */
        const leg = new T.Group();
        for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU, h = i % 3 === 0 ? 7 : rnd(1.5, 6); leg.add(cyl(0.65, 0.75, h, '#fff6e6', Math.cos(a) * 20, h / 2, Math.sin(a) * 20, 10)); if (h > 6) leg.add(box(1.6, 0.5, 1.6, '#f3e6cf', Math.cos(a) * 20, h + 0.25, Math.sin(a) * 20)); }
        this._add(this._place(leg, -175, -100));
        const argo = G(box(4.4, 2.2, 17, '#c98a3c', 0, 1.1, 0), box(3.6, 0.5, 15, '#e0a860', 0, 2.3, 0), box(0.45, 12, 0.45, '#6b4428', 0, 7.5, 0), box(0.2, 6.5, 8, '#ffd23f', 0, 8.5, 0), box(0.22, 1.4, 8, '#ff4d6d', 0, 9, 0));
        { const pw = box(0.7, 3.4, 0.7, '#6b4428', 0, 3, 8.4); pw.rotation.x = -0.4; argo.add(pw); }
        this._add(this._place(argo, -210, -138, 0.7)); ob(-210, -138, 5); ob(-210 + Math.sin(0.7) * 6, -138 + Math.cos(0.7) * 6, 4); ob(-210 - Math.sin(0.7) * 6, -138 - Math.cos(0.7) * 6, 4);
        this.heracles = this._statue('heracles', 5, M.gold, -175, -100, 0.6, true); ob(-175, -100, 5);
        /* ===== PESISIR ODYSSEY ===== */
        this._add(this._place(temple(12, 8, { roof: '#4ee6d6', frieze: '#ffffff', h: 6, door: true }), 100, 178, 0.3)); ob(100, 178, 9);
        const lhX = 132, lhZ = 236, lhY = Math.max(1.2, Terrain.height(lhX, lhZ));
        const lh = new T.Group();
        for (let k = 0; k < 6; k++) lh.add(cyl(2.6 - k * 0.2, 2.8 - k * 0.2, 3, k % 2 ? '#ff4d6d' : '#ffffff', 0, 1.5 + k * 3, 0, 10));
        lh.add(cyl(2.4, 2.4, 0.5, '#5a4a6a', 0, 18.3, 0, 10)); lh.add(cyl(1.6, 1.6, 2.4, '#ffe08a', 0, 19.7, 0, 10, true)); lh.add(mk(CONE(2.2, 2.4, 10), '#ff4d6d').translateY(22.1));
        lh.position.set(lhX, lhY - 0.5, lhZ); this._add(lh); ob(lhX, lhZ, 3.6);
        this.lhBeam = new T.Mesh(new T.ConeGeometry(6, 60, 12, 1, true), new T.MeshBasicMaterial({ color: new T.Color(2, 1.8, 1), transparent: true, opacity: 0.12, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
        this.lhBeam.geometry.translate(0, -30, 0); this.lhBeam.rotation.z = Math.PI / 2;
        const lhPivot = new T.Group(); lhPivot.position.set(lhX, lhY + 19.2, lhZ); lhPivot.add(this.lhBeam); s.add(lhPivot); this.lhPivot = lhPivot;
        const circe = G(box(6, 4, 6, '#d8b6ff', 0, 2, 0), box(1.4, 2.2, 0.2, '#6b3fa0', 0, 1.1, 3.05), box(0.9, 0.9, 0.15, '#ffd27a', 2, 2.5, 3.05, true));
        { const cr = mk(CONE(4.8, 3.6, 4), '#7b3fc4'); cr.position.set(0, 5.8, 0); cr.rotation.y = Math.PI / 4; circe.add(cr); }
        for (let k = 0; k < 14; k++) circe.add(box(0.35, 0.35, 0.35, ['#d8a6ff', '#ff9cf0', '#ffffff'][k % 3], Math.cos(k) * rnd(4, 7), 0.4, Math.sin(k) * rnd(4, 7), true));
        this._add(this._place(circe, 128, 205, 0.7)); ob(128, 205, 4.6);
        // dermaga & perahu
        const dock = G(box(3, 0.4, 18, '#8b5a3c', 0, 0, 0)); for (let k = 0; k < 6; k++) dock.add(box(0.4, 2.4, 0.4, '#6b4428', 1.3 * (k % 2 ? 1 : -1), -1, -8 + k * 3.2));
        dock.position.set(98, 1.0, 240); this._add(dock);
        // pulau Calypso di lepas pantai
        const cal = new T.Group();
        cal.add(cyl(14, 18, 4, '#ffe7b0', 0, -1, 0, 12)); cal.add(cyl(10, 13, 2, '#8ee88f', 0, 1.5, 0, 12));
        for (let k = 0; k < 5; k++) { const a = k * 1.3, r = rnd(3, 8); cal.add(cyl(0.3, 0.45, 6, '#a86b4a', Math.cos(a) * r, 5.4, Math.sin(a) * r, 6)); for (let f = 0; f < 4; f++) { const lf = box(4, 0.15, 1, '#3fbf6a', Math.cos(a) * r + Math.cos(f * 1.57) * 1.8, 8.3, Math.sin(a) * r + Math.sin(f * 1.57) * 1.8); lf.rotation.y = -f * 1.57; lf.rotation.z = -0.3; cal.add(lf); } }
        cal.add(box(5, 3, 4, '#ffffff', -2, 4, -4)); { const pr = mk(PRISM(), '#4ee6d6'); pr.position.set(-2, 5.5, -4); pr.scale.set(5.6, 1.4, 2.6); cal.add(pr); }
        cal.position.set(205, 0.4, 268); this._add(cal);
        // pusaran Charybdis & batu Scylla
        this.whirl = new T.Group();
        for (let k = 0; k < 5; k++) { const ring = new T.Mesh(new T.TorusGeometry(3 + k * 2.2, 0.35, 4, 28), new T.MeshBasicMaterial({ color: k % 2 ? '#bff4ff' : '#ffffff', transparent: true, opacity: 0.7 })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.5 - k * 0.05; this.whirl.add(ring); }
        this.whirl.position.set(40, 0.2, 300); s.add(this.whirl);
        const scy = G(mk(CONE(7, 22, 6), '#7a6f8f')); scy.position.set(62, 9, 312); this._add(scy);

        /* ===== ALAM LIAR MITOS ===== */
        const lab = new T.Group();
        for (let i = 0; i < 7; i++) { const r = 4 + i * 3.4, n = 6 + i * 3; for (let k = 0; k < n; k++) { if ((k + i) % 4 === 0) continue; const a = (k / n) * TAU; const w = box(2.4, 4.2, 0.9, i % 2 ? '#c9b6a0' : '#d9c8b2', Math.cos(a) * r, 2.1, Math.sin(a) * r); w.rotation.y = -a + Math.PI / 2; lab.add(w); ob(-120 + Math.cos(a) * r, 205 + Math.sin(a) * r, 1.3); } }
        lab.add(box(3, 0.6, 3, '#ff6b4a', 0, 0.3, 0));
        this._add(this._place(lab, -120, 205));
        const cave = G(mk(geo('cave', () => new T.SphereGeometry(13, 10, 7, 0, TAU, 0, Math.PI / 2)), '#8f84a8'), box(7, 6, 1, '#1d1530', 0, 3, 12.6));
        this._add(this._place(cave, -58, 212, 0, -1.2)); ob(-58, 212, 12.5);
        for (let k = 0; k < 10; k++) { const sx = -58 + rnd(-18, 18), sz = 194 + rnd(-10, 6); this._add(this._place(G(box(1.4, 1, 2, '#ffffff', 0, 0.9, 0), box(0.7, 0.7, 0.7, '#3a3048', 0, 1.3, 1.2), ...[[-0.4, -0.6], [0.4, -0.6], [-0.4, 0.6], [0.4, 0.6]].map(([lx, lz]) => box(0.25, 0.6, 0.25, '#3a3048', lx, 0.3, lz))), sx, sz, rnd(0, 6))); }
        // tulang raksasa
        const bones = new T.Group(); for (let k = 0; k < 7; k++) { const rib = mk(geo('rib', () => new T.TorusGeometry(5, 0.45, 4, 12, Math.PI)), '#f3ead7'); rib.position.set(0, 0, k * 2.4); bones.add(rib); }
        bones.add(box(0.8, 0.8, 18, '#f3ead7', 0, 5, 7)); bones.add(box(4, 3, 4, '#f3ead7', 0, 2, -3));
        this._add(this._place(bones, -150, 160, 0.8, -0.5)); ob(-150, 160, 4); ob(-150 + Math.sin(0.8) * 9, 160 + Math.cos(0.8) * 9, 5);
        // taman patung batu Medusa
        ['teucer', 'meges', 'diores', 'peneleos', 'leonteus', 'thoas'].forEach((id, k) => { const a = (k / 6) * TAU; this._statue(id, 1.1, M.stone, -85 + Math.cos(a) * 9, 160 + Math.sin(a) * 9, -a + Math.PI, false); ob(-85 + Math.cos(a) * 9, 160 + Math.sin(a) * 9, 0.9); });
        // jamur bercahaya
        for (let k = 0; k < 24; k++) { const x = -110 + rnd(-35, 35), z = 180 + rnd(-30, 30); if (!Terrain.land(x, z)) continue; this._add(this._place(G(cyl(0.12, 0.16, 0.6, '#fff6e6', 0, 0.3, 0, 6), cyl(0.05, 0.5, 0.35, ['#7dff9e', '#b892ff', '#4ee6d6'][k % 3], 0, 0.7, 0, 8, true)), x, z)); }

        /* ===== Jembatan Scamander di jalan ke Troya ===== */
        const bx = 124, bz = 43, by = Terrain.height(bx, bz);
        const bridge = G(box(16, 0.7, 5, '#e9d8b8', 0, 0, 0), box(16, 1.2, 0.5, '#fff6e6', 0, 0.9, 2.4), box(16, 1.2, 0.5, '#fff6e6', 0, 0.9, -2.4));
        for (let k = -2; k <= 2; k++) { bridge.add(box(0.8, 2, 0.8, '#f3e6cf', k * 3.6, 1.2, 2.4)); bridge.add(box(0.8, 2, 0.8, '#f3e6cf', k * 3.6, 1.2, -2.4)); }
        bridge.position.set(bx, by + 0.1, bz); bridge.rotation.y = -0.07; this._add(bridge);
        // obor sepanjang jalan
        ROADS.forEach((road) => { for (let i = 1; i < road.length; i++) { const [x0, z0] = road[i - 1], [x1, z1] = road[i]; const L = Math.hypot(x1 - x0, z1 - z0); for (let t = 18; t < L; t += 36) { const k = t / L, x = lp(x0, x1, k), z = lp(z0, z1, k), nx = -(z1 - z0) / L * 3.8, nz = (x1 - x0) / L * 3.8; if (Math.hypot(x - PLAZA.x, z - PLAZA.z) < 30 || !Terrain.land(x + nx, z + nz)) continue; this._add(this._place(torch(2.8), x + nx, z + nz)); } } });
    };

    /* ---------- alam: hutan lebih rimbun, rumput, bunga ---------- */
    OW._nature = function () {
        const dummy = new T.Object3D(), col = new T.Color();
        const okSpot = (x, z) => {
            const h = Terrain.height(x, z);
            if (h < 1.6 || h > 26) return false;
            if (Math.hypot(x - TROY.x, z - TROY.z) < 42) return false;
            if (Math.hypot(x - PLAZA.x, z - PLAZA.z) < 38) return false;
            if (x < -145 && z > -5 && z < 150) return false;
            if (Math.hypot(x + 120, z - 205) < 30 || Math.hypot(x + 175, z + 100) < 24) return false;
            if (Terrain.roadDist(x, z) < 5 || Terrain.riverDist(x, z) < 8) return false;
            if (Terrain.reserved && Terrain.reserved(x, z)) return false;
            return true;
        };
        const spots = (n, tries, filter) => { const out = []; for (let t = 0; t < tries && out.length < n; t++) { const a = rnd(0, TAU), r = Math.sqrt(Math.random()) * ISLAND_R, x = Math.cos(a) * r, z = Math.sin(a) * r; if (okSpot(x, z) && (!filter || filter(x, z))) out.push([x, z]); } return out; };
        const olive = spots(1100, 14000);
        const fol = new T.InstancedMesh(new T.IcosahedronGeometry(1.7, 0), this.toon('#ffffff'), olive.length);
        const fol2 = new T.InstancedMesh(new T.IcosahedronGeometry(1.2, 0), this.toon('#ffffff'), olive.length);
        const trunk = new T.InstancedMesh(new T.CylinderGeometry(0.22, 0.34, 2.4, 5), this.toon('#a86b4a'), olive.length);
        const leaf = ['#5fcf7a', '#7be08a', '#3fbf8f', '#9be36b', '#ff9cc8', '#6fd68a', '#ffb3d1', '#4fb37a'];
        olive.forEach(([x, z], i) => {
            const sc = rnd(0.8, 1.6), y = Terrain.height(x, z), wild = x < -60 && z > 120;
            dummy.position.set(x, y + 1.2 * sc, z); dummy.rotation.set(0, rnd(0, 6), 0); dummy.scale.setScalar(sc); dummy.updateMatrix(); trunk.setMatrixAt(i, dummy.matrix);
            dummy.position.y = y + 3.1 * sc; dummy.scale.set(sc, sc * rnd(0.9, 1.4), sc); dummy.updateMatrix(); fol.setMatrixAt(i, dummy.matrix);
            dummy.position.y = y + 4.3 * sc; dummy.position.x += 0.6 * sc; dummy.scale.setScalar(sc * 0.9); dummy.updateMatrix(); fol2.setMatrixAt(i, dummy.matrix);
            const c = wild ? (i % 2 ? '#3f9f6a' : '#4fb37a') : leaf[i % leaf.length];
            fol.setColorAt(i, col.set(c)); fol2.setColorAt(i, col.set(c).offsetHSL(0, 0, 0.06));
        });
        const cyp = spots(420, 7000);
        this.treeSpots = olive.concat(cyp); // dipakai kamera pintar (v5)
        const cone = new T.InstancedMesh(new T.ConeGeometry(1, 5, 6), this.toon('#3f9f6a'), cyp.length);
        cyp.forEach(([x, z], i) => { const sc = rnd(0.8, 1.6); dummy.position.set(x, Terrain.height(x, z) + 2.4 * sc, z); dummy.rotation.set(0, 0, 0); dummy.scale.set(sc, sc * rnd(1.1, 1.7), sc); dummy.updateMatrix(); cone.setMatrixAt(i, dummy.matrix); });
        const rk = spots(320, 5000);
        const rocks = new T.InstancedMesh(new T.DodecahedronGeometry(1, 0), this.toon('#d6c8ff'), rk.length);
        rk.forEach(([x, z], i) => { dummy.position.set(x, Terrain.height(x, z) + 0.2, z); dummy.rotation.set(rnd(0, 3), rnd(0, 3), 0); dummy.scale.setScalar(rnd(0.5, 2.2)); dummy.updateMatrix(); rocks.setMatrixAt(i, dummy.matrix); });
        const fl = spots(1800, 9000);
        const flowers = new T.InstancedMesh(new T.BoxGeometry(0.35, 0.35, 0.35), this.toon('#ffffff'), fl.length);
        const fc = ['#ff5fa2', '#ffd23f', '#ffffff', '#b892ff', '#ff8f5a', '#4ee6d6'];
        fl.forEach(([x, z], i) => { dummy.position.set(x, Terrain.height(x, z) + 0.25, z); dummy.rotation.set(0, rnd(0, 3), 0); dummy.scale.setScalar(rnd(0.7, 1.2)); dummy.updateMatrix(); flowers.setMatrixAt(i, dummy.matrix); flowers.setColorAt(i, col.set(fc[i % fc.length])); });
        const gr = spots(3200, 12000, (x, z) => Terrain.height(x, z) < 18);
        const grass = new T.InstancedMesh(new T.ConeGeometry(0.18, 0.9, 3), this.toon('#5fcf7a'), gr.length);
        gr.forEach(([x, z], i) => { dummy.position.set(x, Terrain.height(x, z) + 0.4, z); dummy.rotation.set(rnd(-0.2, 0.2), rnd(0, 3), rnd(-0.2, 0.2)); dummy.scale.setScalar(rnd(0.7, 1.4)); dummy.updateMatrix(); grass.setMatrixAt(i, dummy.matrix); grass.setColorAt(i, col.set(i % 3 ? '#5fcf7a' : '#8be36b')); });
        this.scene.add(fol, fol2, trunk, cone, rocks, flowers, grass);
    };

    /* ---------- kehidupan: burung, kupu-kupu, kunang-kunang, asap ---------- */
    OW._life = function () {
        const s = this.scene;
        // burung (instanced: badan + 2 sayap)
        const NB = 36;
        this.birds = { n: NB, data: [] };
        const bodyG = new T.BoxGeometry(0.3, 0.3, 1), wingG = new T.BoxGeometry(1.3, 0.06, 0.5); wingG.translate(0.65, 0, 0);
        const bm = this.toon('#ffffff');
        this.birds.body = new T.InstancedMesh(bodyG, bm, NB); this.birds.wl = new T.InstancedMesh(wingG, bm, NB); this.birds.wr = new T.InstancedMesh(wingG, bm, NB);
        const centers = [[0, -120, 70], [170, 40, 45], [-200, 70, 35], [100, 220, 30], [-175, -100, 40], [0, 50, 32]];
        for (let i = 0; i < NB; i++) { const c = centers[i % centers.length]; this.birds.data.push({ cx: c[0], cz: c[1], y: c[2] + rnd(-4, 6), r: rnd(18, 34), sp: rnd(0.25, 0.5) * (i % 2 ? 1 : -1), ph: rnd(0, 6) }); }
        [this.birds.body, this.birds.wl, this.birds.wr].forEach((m) => { m.frustumCulled = false; s.add(m); });
        // kupu-kupu di sekitar pemain
        const NF = 50;
        this.flies = { n: NF, data: [] };
        const fg = new T.PlaneGeometry(0.32, 0.26); fg.translate(0.16, 0, 0);
        const fm = new T.MeshBasicMaterial({ side: T.DoubleSide });
        this.flies.l = new T.InstancedMesh(fg, fm, NF); this.flies.r = new T.InstancedMesh(fg, fm, NF);
        const fcs = ['#ff9cc8', '#ffd23f', '#9fe8ff', '#ff8f5a', '#c6a8ff'], c = new T.Color();
        for (let i = 0; i < NF; i++) { this.flies.data.push({ x: rnd(-30, 30), z: rnd(-30, 30), y: rnd(0.8, 2.5), vx: rnd(-1, 1), vz: rnd(-1, 1), ph: rnd(0, 6) }); this.flies.l.setColorAt(i, c.set(fcs[i % fcs.length])); this.flies.r.setColorAt(i, c); }
        [this.flies.l, this.flies.r].forEach((m) => { m.frustumCulled = false; s.add(m); });
        // kunang-kunang (malam)
        const NK = 260, kp = new Float32Array(NK * 3);
        for (let i = 0; i < NK; i++) kp.set([rnd(-45, 45), rnd(0.5, 4), rnd(-45, 45)], i * 3);
        const kg = new T.BufferGeometry(); kg.setAttribute('position', new T.BufferAttribute(kp, 3));
        this.fireflies = new T.Points(kg, new T.PointsMaterial({ color: new T.Color(2.4, 2.6, 0.9), size: 0.28, transparent: true, opacity: 0, depthWrite: false }));
        s.add(this.fireflies);
        // asap api unggun
        const NS = 90, spp = new Float32Array(NS * 3);
        this.smoke = { n: NS, src: this._fires.map((f) => f.position.clone()), life: new Float32Array(NS) };
        for (let i = 0; i < NS; i++) this.smoke.life[i] = Math.random();
        const sgm = new T.BufferGeometry(); sgm.setAttribute('position', new T.BufferAttribute(spp, 3));
        this.smoke.pts = new T.Points(sgm, new T.PointsMaterial({ color: '#e8e0f0', size: 1.4, transparent: true, opacity: 0.45, depthWrite: false }));
        s.add(this.smoke.pts);
    };

    /* ---------- siklus hari ---------- */
    const KEYS = [ // t, top, mid, bot, sun color, sun I, hemi I, fog
        [0.00, '#6f7dff', '#ffb3a0', '#ffd6ec', '#ffcfa0', 1.5, 1.0, '#ffd2e0'],
        [0.12, '#6f8bff', '#c8b6ff', '#ffe0f0', '#fff0dc', 2.2, 1.45, '#ead8ff'],
        [0.30, '#4f8dff', '#a6d4ff', '#e8f6ff', '#fff6e6', 2.6, 1.65, '#d6ecff'],
        [0.50, '#5c6fe8', '#ffb38a', '#ffd38a', '#ffb070', 2.0, 1.2, '#ffc8a0'],
        [0.58, '#3a2d8a', '#ff7f7f', '#ffad6b', '#ff8f5a', 1.2, 0.85, '#d98aa8'],
        [0.68, '#0d0f33', '#1f1d5c', '#3d2c72', '#9fb4ff', 0.55, 0.42, '#24224f'],
        [0.88, '#0b0c2a', '#1b1a50', '#352a6a', '#9fb4ff', 0.5, 0.38, '#201e48'],
        [1.00, '#6f7dff', '#ffb3a0', '#ffd6ec', '#ffcfa0', 1.5, 1.0, '#ffd2e0']
    ].map((k) => ({ t: k[0], top: new T.Color(k[1]), mid: new T.Color(k[2]), bot: new T.Color(k[3]), sun: new T.Color(k[4]), sI: k[5], hI: k[6], fog: new T.Color(k[7]) }));
    function sample(t) {
        let i = 0; while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
        const a = KEYS[i], b = KEYS[i + 1], k = sm(0, 1, (t - a.t) / (b.t - a.t));
        return { top: a.top.clone().lerp(b.top, k), mid: a.mid.clone().lerp(b.mid, k), bot: a.bot.clone().lerp(b.bot, k), sun: a.sun.clone().lerp(b.sun, k), sI: lp(a.sI, b.sI, k) * 0.74, hI: lp(a.hI, b.hI, k) * 0.8, fog: a.fog.clone().lerp(b.fog, k) };
    }
    const FIXED = { day: 0.3, dusk: 0.54, night: 0.8 };
    OW.applySky = function () {
        const set = this.g.data.state.settings || {};
        const t = FIXED[set.time] ?? this.timeOfDay;
        const S = sample(t);
        const g = this.skyDome.geometry, P = g.attributes.position, C = g.attributes.color, c = new T.Color();
        for (let i = 0; i < P.count; i++) {
            const y = P.getY(i) / 1200;
            if (y > 0.02) c.copy(S.mid).lerp(S.top, sm(0.02, 0.6, y)); else c.copy(S.bot).lerp(S.mid, sm(-0.25, 0.02, y));
            C.setXYZ(i, c.r, c.g, c.b);
        }
        C.needsUpdate = true;
        this.scene.fog.color.copy(S.fog);
        const night = sm(0.6, 0.7, t) * (1 - sm(0.92, 1.0, t));
        this.night = night;
        this.scene.fog.far = lp(560, 330, night); this.scene.fog.near = lp(150, 80, night);
        this.sun.color.copy(S.sun); this.sun.intensity = S.sI;
        this.hemi = this.hemi || this.scene.children.find((o) => o.isHemisphereLight);
        this.hemi.intensity = S.hI;
        this.hemi.color.copy(S.mid).lerp(new T.Color('#ffffff'), 0.6);
        // posisi matahari: terbit di timur (t=0), tenggelam di barat (~0.62)
        const ang = (t / 0.62) * Math.PI;
        this.sunDir = new T.Vector3(Math.cos(ang), Math.sin(ang) * 0.85 + 0.05, -0.35).normalize();
        this.moonDir = new T.Vector3(-Math.cos(ang * 0.8), 0.55, 0.3).normalize();
        this.stars.material.opacity = night * 0.95;
        this.fireflies.material.opacity = night;
        this.mats.glow.color.setScalar(lp(1.35, 2.8, night));
        this.cloudMat.color.copy(S.mid).lerp(new T.Color('#ffffff'), lp(0.75, 0.15, night));
        this.sunDisc.visible = this.sunHalo.visible = this.sunDir.y > -0.05 && night < 0.9;
        this.moonDisc.visible = night > 0.3;
        if (this.g.bloom) this.g.bloom.strength = lp(0.22, 0.55, night);
    };

    /* ---------- loop tambahan ---------- */
    const baseBlocked = OW.blocked;
    OW.blocked = function (x0, z0, x, z) {
        if (baseBlocked.call(this, x0, z0, x, z)) return true;
        if (solidNear(x, z) && !solidNear(x0, z0)) return true;
        const L = this.obstacles; if (!L) return false;
        for (let i = 0; i < L.length; i++) {
            const o = L[i], dx = x - o.x, dz = z - o.z;
            if (dx > o.r || dx < -o.r || dz > o.r || dz < -o.r) continue;
            const d1 = Math.hypot(dx, dz);
            if (d1 < o.r && d1 <= Math.hypot(x0 - o.x, z0 - o.z) + 1e-6) return true;
        }
        return false;
    };
    const baseBuild = OW.build, baseUpdate = OW.update, baseResize = OW.resize;
    OW.build = function () {
        baseBuild.call(this);
        this._life();
        this.applySky();
        this.scene.traverse((o) => { if (o.isMesh && o !== this.ground && !this.playerBH.root.getObjectById(o.id)) o.castShadow = false; });
    };
    OW.update = function (dt, time) {
        baseUpdate.call(this, dt, time);
        const set = this.g.data.state.settings || {};
        if (!set.time || set.time === 'auto') this.timeOfDay = (this.timeOfDay + dt / DAY_LENGTH) % 1;
        this._skyT = (this._skyT || 0) - dt;
        if (this._skyT <= 0) { this._skyT = 0.25; this.applySky(); }
        const cam = this.camera.position, P = this.player.pos;
        this.sunDisc.position.copy(cam).addScaledVector(this.sunDir, 1000); this.sunDisc.lookAt(cam);
        this.sunHalo.position.copy(cam).addScaledVector(this.sunDir, 1010); this.sunHalo.lookAt(cam);
        this.moonDisc.position.copy(cam).addScaledVector(this.moonDir, 1000); this.moonDisc.lookAt(cam);
        this.stars.position.copy(cam);
        this.sun.position.copy(P).addScaledVector(this.sunDir.y > 0.05 ? this.sunDir : this.moonDir, 160);
        // awan Olympus berputar
        this.clouds.children.forEach((cl, i) => {
            if (cl.userData.olympus !== undefined) { const a = cl.userData.olympus + time * 0.05; cl.position.set(OLY.x + Math.cos(a) * cl.userData.r, cl.userData.y, OLY.z + Math.sin(a) * cl.userData.r); }
            else { cl.position.x += dt * (1.5 + (i % 3)); if (cl.position.x > 560) cl.position.x = -560; }
        });
        // laut bergelombang mengikuti pemain
        this._wT = (this._wT || 0) + 1;
        if (this._wT % 2 === 0) {
            const W = this.wave, gx = Math.round(P.x / 5) * 5, gz = Math.round(P.z / 5) * 5;
            W.position.x = gx; W.position.z = gz;
            const a = W.geometry.attributes.position;
            for (let i = 0; i < a.count; i++) { const x = a.getX(i) + gx, z = a.getZ(i) + gz; a.setY(i, Math.sin(x * 0.07 + time * 1.3) * 0.22 + Math.cos(z * 0.06 + time) * 0.18 + Math.sin((x + z) * 0.15 + time * 2) * 0.06); }
            a.needsUpdate = true; W.geometry.computeVertexNormals();
        }
        // bendera
        for (const f of this.flags) {
            const b = f.userData.base, a = f.geometry.attributes.position;
            for (let i = 0; i < a.count; i++) { const x = b[i * 3]; a.setZ(i, Math.sin(x * 2.2 - time * 5 + f.userData.ph) * 0.25 * (x / 2.4)); }
            a.needsUpdate = true;
            f.rotation.y = Math.sin(time * 0.3 + f.userData.ph) * 0.4;
        }
        (this._fires || []).forEach((f, i) => { f.scale.set(1 + Math.sin(time * 11 + i) * 0.12, 1 + Math.sin(time * 9 + i) * 0.28, 1 + Math.cos(time * 10 + i) * 0.12); });
        // pulau melayang, pilar cahaya, mercusuar, pusaran
        this.islands.forEach((isl) => { const u = isl.userData, a = u.a + time * 0.03; isl.position.set(OLY.x + Math.cos(a) * u.r, u.y + Math.sin(time * 0.6 + u.ph) * 2, OLY.z + Math.sin(a) * u.r); isl.rotation.y = -a; });
        this.beam.material.opacity = 0.06 + Math.sin(time * 0.8) * 0.03 + this.night * 0.1;
        this.lhPivot.rotation.y = time * 0.8; this.lhBeam.material.opacity = 0.04 + this.night * 0.2;
        this.whirl.rotation.y = -time * 1.6;
        // burung
        const B = this.birds, d3 = new T.Object3D();
        B.data.forEach((b, i) => {
            const a = b.ph + time * b.sp, x = b.cx + Math.cos(a) * b.r, z = b.cz + Math.sin(a) * b.r, y = b.y + Math.sin(time + i) * 1.5;
            d3.position.set(x, y, z); d3.rotation.set(0, -a + (b.sp > 0 ? 0 : Math.PI), 0); d3.scale.setScalar(1); d3.updateMatrix(); B.body.setMatrixAt(i, d3.matrix);
            const fl = Math.sin(time * 9 + i) * 0.7;
            d3.rotateZ(fl); d3.updateMatrix(); B.wl.setMatrixAt(i, d3.matrix);
            d3.rotateZ(-fl); d3.rotateY(Math.PI); d3.rotateZ(fl); d3.updateMatrix(); B.wr.setMatrixAt(i, d3.matrix);
        });
        B.body.instanceMatrix.needsUpdate = B.wl.instanceMatrix.needsUpdate = B.wr.instanceMatrix.needsUpdate = true;
        // kupu-kupu (siang) di sekitar pemain
        const F = this.flies, day = 1 - this.night;
        F.l.visible = F.r.visible = day > 0.3;
        if (F.l.visible) F.data.forEach((f, i) => {
            f.vx += rnd(-1, 1) * dt * 2; f.vz += rnd(-1, 1) * dt * 2; f.vx *= 0.98; f.vz *= 0.98;
            f.x += f.vx * dt * 2; f.z += f.vz * dt * 2;
            if (Math.abs(f.x) > 32) f.vx -= Math.sign(f.x) * dt * 6; if (Math.abs(f.z) > 32) f.vz -= Math.sign(f.z) * dt * 6;
            const x = P.x + f.x, z = P.z + f.z, y = Terrain.height(x, z) + f.y + Math.sin(time * 2 + f.ph) * 0.3;
            const flap = Math.sin(time * 18 + f.ph) * 1.1;
            d3.position.set(x, y, z); d3.rotation.set(0, Math.atan2(f.vx, f.vz), 0); d3.scale.setScalar(Terrain.land(x, z) && d3.position.distanceTo(this.camera.position) > 4.5 ? 1 : 0.001);
            d3.rotateZ(flap); d3.updateMatrix(); F.l.setMatrixAt(i, d3.matrix);
            d3.rotateZ(-flap); d3.rotateY(Math.PI); d3.rotateZ(flap); d3.updateMatrix(); F.r.setMatrixAt(i, d3.matrix);
        });
        F.l.instanceMatrix.needsUpdate = F.r.instanceMatrix.needsUpdate = true;
        // kunang-kunang & asap
        if (this.night > 0.05) { this.fireflies.position.set(P.x, Terrain.height(P.x, P.z), P.z); this.fireflies.rotation.y = time * 0.05; this.fireflies.position.y += Math.sin(time) * 0.3; }
        const S = this.smoke, sp = S.pts.geometry.attributes.position;
        for (let i = 0; i < S.n; i++) {
            S.life[i] += dt * 0.25; if (S.life[i] > 1) S.life[i] = 0;
            const src = S.src[i % S.src.length], l = S.life[i];
            sp.setXYZ(i, src.x + Math.sin(i + l * 3) * l * 1.5, src.y + 1 + l * 9, src.z + Math.cos(i * 1.7) * l * 1.2);
        }
        sp.needsUpdate = true;
    };
    OW.resize = function () { baseResize.call(this); if (this.g.composer) { this.g.composer.setSize(innerWidth, innerHeight); } };
    OW.render = function () {
        const G = this.g, set = G.data.state.settings || {};
        if (set.gfx !== 'low') {
            if (!G.composer) {
                G.composer = new T.EffectComposer(G.renderer);
                G.composer.addPass(new T.RenderPass(this.scene, this.camera));
                G.bloom = new T.UnrealBloomPass(new T.Vector2(innerWidth, innerHeight), 0.22, 0.45, 1.25);
                G.composer.addPass(G.bloom);
                G.composer.addPass(new T.OutputPass());
                G.composer.setSize(innerWidth, innerHeight);
            }
            G.composer.render();
        } else G.renderer.render(this.scene, this.camera);
    };

    /* =====================================================================
       Musik lira prosedural (Web Audio) — modus Dorian, lembut
       ===================================================================== */
    class LyreMusic {
        constructor(audio) { this.a = audio; this.on = false; }
        start() {
            const A = this.a; if (!A.ctx || this.on) return;
            this.on = true;
            const c = A.ctx;
            this.out = c.createGain(); this.out.gain.value = 0.0001; this.out.connect(A.master);
            this.out.gain.exponentialRampToValueAtTime(0.5, c.currentTime + 3);
            const rev = c.createDelay(); rev.delayTime.value = 0.32; const fb = c.createGain(); fb.gain.value = 0.32; const lpF = c.createBiquadFilter(); lpF.type = 'lowpass'; lpF.frequency.value = 2200;
            rev.connect(fb).connect(lpF).connect(rev); rev.connect(this.out); this.rev = rev;
            // dengung (drone) D & A
            this.drone = [146.83, 220].map((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.value = 0.035 - i * 0.01; o.connect(g).connect(this.out); o.start(); return o; });
            this.next = c.currentTime + 0.5; this.step = 0;
            this.timer = setInterval(() => this.schedule(), 150);
        }
        stop() { if (!this.on) return; this.on = false; clearInterval(this.timer); const c = this.a.ctx; this.out.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 1.2); const d = this.drone; setTimeout(() => d.forEach((o) => o.stop()), 1500); }
        pluck(f, t, v) {
            const c = this.a.ctx, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), f1 = c.createBiquadFilter();
            o.type = 'triangle'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2;
            f1.type = 'lowpass'; f1.frequency.setValueAtTime(3200, t); f1.frequency.exponentialRampToValueAtTime(600, t + 1.2);
            g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
            o.connect(f1); o2.connect(f1); f1.connect(g); g.connect(this.out); g.connect(this.rev);
            o.start(t); o2.start(t); o.stop(t + 2); o2.stop(t + 2);
        }
        schedule() {
            const c = this.a.ctx; if (!this.on) return;
            const night = window.game?.world?.night || 0, beat = night > 0.5 ? 0.62 : 0.42;
            const scale = [293.66, 329.63, 349.23, 392, 440, 493.88, 523.25, 587.33, 659.25];
            const prog = [[0, 2, 4], [3, 5, 7], [4, 6, 8], [0, 2, 4], [1, 3, 5], [2, 4, 6]];
            while (this.next < c.currentTime + 0.6) {
                const bar = Math.floor(this.step / 8) % prog.length, chord = prog[bar], k = this.step % 8;
                if (k === 0) this.pluck(scale[chord[0]] / 2, this.next, 0.09);
                if (Math.random() < (k % 2 ? 0.45 : 0.85)) { const n = chord[Math.floor(Math.random() * 3)] + (Math.random() < 0.3 ? 1 : 0); this.pluck(scale[Math.min(8, n)], this.next + (Math.random() * 0.03), 0.05 + Math.random() * 0.04); }
                this.next += beat; this.step++;
            }
        }
    }

    /* =====================================================================
       Pengaturan di menu: waktu, grafis, musik
       ===================================================================== */
    const TIME_LABEL = { auto: '🌗 Waktu: berganti otomatis', day: '☀️ Waktu: siang', dusk: '🌇 Waktu: senja', night: '🌙 Waktu: malam' };
    const TIME_NEXT = { auto: 'day', day: 'dusk', dusk: 'night', night: 'auto' };
    function settings() { const g = window.game; g.data.state.settings = Object.assign({ time: 'auto', gfx: 'high', music: true }, g.data.state.settings || {}); return g.data.state.settings; }
    function refreshMenu() {
        const s = settings();
        $('menu-time').textContent = TIME_LABEL[s.time];
        $('menu-gfx').textContent = s.gfx === 'low' ? '🖥️ Grafis: ringan (laptop lama)' : '✨ Grafis: megah (cahaya berpendar)';
        $('menu-music').textContent = s.music ? '🎵 Musik lira: nyala' : '🎵 Musik lira: mati';
    }
    function applyGfx() {
        const g = window.game, s = settings();
        g.renderer.setPixelRatio(s.gfx === 'low' ? 1 : Math.min(devicePixelRatio, 1.75));
        g.renderer.shadowMap.enabled = s.gfx !== 'low';
        g.renderer.setSize(innerWidth, innerHeight);
        if (g.composer) g.composer.setSize(innerWidth, innerHeight);
    }
    window.addEventListener('DOMContentLoaded', () => {
        const wait = setInterval(() => {
            const g = window.game; if (!g || !g.world || g.mode === 'loading') return;
            clearInterval(wait);
            g.music = new LyreMusic(g.audio);
            $('menu-time').onclick = () => { const s = settings(); s.time = TIME_NEXT[s.time]; g.data.save(); refreshMenu(); g.world.applySky(); g.audio.beep(); };
            $('menu-gfx').onclick = () => { const s = settings(); s.gfx = s.gfx === 'low' ? 'high' : 'low'; g.data.save(); refreshMenu(); applyGfx(); g.audio.beep(); };
            $('menu-music').onclick = () => { const s = settings(); s.music = !s.music; g.data.save(); refreshMenu(); s.music ? g.music.start() : g.music.stop(); g.audio.beep(); };
            const menuBtn = $('menu-btn'), prev = menuBtn.onclick;
            menuBtn.onclick = (e) => { refreshMenu(); prev && prev.call(menuBtn, e); };
            const baseEnter = g.enterWorld.bind(g);
            g.enterWorld = (mode) => { baseEnter(mode); settings(); applyGfx(); g.world.applySky(); if (settings().music) g.music.start(); };
            const baseLogout = g.logout.bind(g);
            g.logout = () => { g.music.stop(); baseLogout(); };
        }, 50);
    });
    /* alat bangun dibagikan untuk patch berikutnya (dunia5.js) */
    window.MEGAH = { GRID, gIdx, solidAt, solidNear, topAt, T, TAU, PLAZA, OLY, ROADS, RIVER, geo, BOX, CYL, CONE, PRISM, mk, box, cyl, G, bake, temple, house, torch, ship, tent, sm, lp, rnd, sample, settings };
})();
