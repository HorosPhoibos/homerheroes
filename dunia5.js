/* =====================================================================
   DUNIA5.JS — Patch v5 "Dunia Hidup"
   ---------------------------------------------------------------------
   • Jalan berlapis batu (ribuan lempeng, 1 draw call)
   • Kamera pintar: tidak lagi terhalang bangunan / tembok / bukit
   • Pasar Agora (lapak bertenda belang), Desa Petani + ladang gandum,
     Ladang Barat, Teater Dionysus, Tholos Delphi di atas bukit suci
   • Pohon palem di pantai, buih ombak di garis pantai,
     kapal layar yang berlayar mengelilingi pulau,
     siluet pulau-pulau jauh di cakrawala, kelopak bunga berguguran
   • Tempat Menarik: temukan lokasi baru → tercatat & tampil di peta kecil
   • Panel "Catatan Update" (riwayat patch v1–v5) + muncul sekali per akun
   Dimuat SETELAH megah.js. Memakai alat bangun dari window.MEGAH.
   ===================================================================== */
(function () {
    'use strict';
    const M5 = window.MEGAH; if (!M5) return;
    const { T, TAU, PLAZA, ROADS, box, cyl, G, mk, PRISM, CYL, BOX, temple, house, torch, ship, bake, sm, lp, rnd } = M5;
    const OW = OpenWorld.prototype;
    const VERSION = '5.1';

    /* ---------------- tempat baru (POI) ---------------- */
    const POI = [
        { id: 'pasar', name: 'Pasar Agora', icon: '🧺', x: 0, z: 50, r: 14, desc: 'Lapak-lapak pedagang: zaitun, anggur, amfora, dan kain berwarna.' },
        { id: 'desa', name: 'Desa Petani Boeotia', icon: '🌾', x: 72, z: 104, r: 26, desc: 'Rumah petani, sumur, lumbung, dan ladang gandum keemasan.' },
        { id: 'ladang', name: 'Ladang Barat', icon: '🐂', x: -96, z: 26, r: 22, desc: 'Ladang gandum & jerami tempat para petani Akhaia menanam bekal perang.' },
        { id: 'teater', name: 'Teater Dionysus', icon: '🎭', x: 92, z: -48, r: 22, desc: 'Teater batu setengah lingkaran — di sinilah kisah-kisah Homer dipentaskan.' },
        { id: 'delphi', name: 'Tholos Delphi', icon: '🔮', x: 76, z: -116, r: 22, desc: 'Kuil bundar sang Orakel. Pythia membaca takdir dari asap suci.' }
    ];
    // tanah diratakan / ditinggikan untuk tempat baru
    const PADS = [
        { x: 72, z: 104, r: 22, up: 0.3 },
        { x: 92, z: 104, r: 18, up: 0 },
        { x: -96, z: 26, r: 20, up: 0 },
        { x: 92, z: -48, r: 17, up: 0.8 },
        { x: 76, z: -116, r: 13, up: 7.5 }
    ];
    const baseH = Terrain.height.bind(Terrain);
    PADS.forEach((p) => { p.h = baseH(p.x, p.z) + p.up; });
    Terrain.height = function (x, z) {
        let h = baseH(x, z);
        for (const p of PADS) {
            const d = Math.hypot(x - p.x, z - p.z);
            if (d < p.r + 12) h = lp(h, p.h, 1 - sm(p.r, p.r + 12, d));
        }
        return h;
    };
    Terrain.land = function (x, z) { return this.height(x, z) > 0.9; };
    const FIELDS = [
        { x: 93, z: 93, w: 16, d: 12 }, { x: 93, z: 116, w: 16, d: 12 },
        { x: -104, z: 15, w: 18, d: 12 }, { x: -104, z: 37, w: 18, d: 11 }, { x: -82, z: 26, w: 9, d: 20 }
    ];
    Terrain.reserved = (x, z) => PADS.some((p) => Math.hypot(x - p.x, z - p.z) < p.r + 9) || Math.hypot(x - PLAZA.x, z - PLAZA.z) < 30;

    /* ---------------- bangunan baru ---------------- */
    function stall(awn, awn2, goods) {
        const g = new T.Group();
        [[-1.6, -1.1], [1.6, -1.1], [-1.6, 1.1], [1.6, 1.1]].forEach(([x, z]) => g.add(box(0.2, 2.6, 0.2, '#8b5a3c', x, 1.3, z)));
        g.add(box(3.4, 0.9, 1.2, '#c98a5a', 0, 0.45, 1.0));
        g.add(box(3.6, 0.15, 1.4, '#e9c79a', 0, 0.95, 1.0));
        for (let i = 0; i < 6; i++) { const s = box(0.62, 0.14, 2.8, i % 2 ? awn : awn2, -1.55 + i * 0.62, 2.75, 0.1); s.rotation.x = 0.22; g.add(s); }
        goods.forEach((c, i) => {
            const x = -1.2 + i * 0.6;
            if (i % 2) g.add(cyl(0.18, 0.13, 0.5, c, x, 1.27, 1.0, 7)); else g.add(box(0.42, 0.25, 0.42, c, x, 1.15, 1.0));
        });
        g.add(cyl(0.3, 0.22, 0.9, '#c96b3c', -2.1, 0.45, 1.6, 8)); g.add(cyl(0.12, 0.2, 0.3, '#c96b3c', -2.1, 1.05, 1.6, 8));
        g.add(box(0.7, 0.6, 0.7, '#a8744c', 2.1, 0.3, 1.7));
        return g;
    }
    function haystack(s = 1) { return G(cyl(1.2 * s, 1.4 * s, 1.4 * s, '#f2c94c', 0, 0.7 * s, 0, 8), mk(new T.ConeGeometry(1.25 * s, 1.2 * s, 8), '#e8b83a').translateY(2 * s)); }
    function well() { return G(cyl(1.2, 1.3, 1, '#d6c8b4', 0, 0.5, 0, 10), cyl(1, 1, 0.1, '#45a8e0', 0, 0.95, 0, 10), box(0.2, 2.2, 0.2, '#8b5a3c', -1.05, 1.6, 0), box(0.2, 2.2, 0.2, '#8b5a3c', 1.05, 1.6, 0), box(2.6, 0.2, 0.25, '#6b4428', 0, 2.7, 0), roofed({ c: '#ff8f6b', w: 2.9, h: 0.5, d: 1.0, y: 2.78 }), box(0.3, 0.4, 0.3, '#8b5a3c', 0, 2.2, 0)); }
    function roofed(o) { const r = mk(PRISM(), o.c); r.scale.set(o.w, o.h, o.d); r.position.set(o.x || 0, o.y, o.z || 0); return r; }
    function barn() {
        const g = new T.Group();
        g.add(box(7, 4, 5, '#c0573c', 0, 2, 0)); g.add(roofed({ c: '#7a3a2a', w: 7.6, h: 2.2 / 1.5, d: 5.6 / 1.732, y: 4 }));
        g.add(box(2.2, 3, 0.15, '#6b4428', 0, 1.5, 2.53)); g.add(box(0.2, 3.2, 0.18, '#fff6e6', 0, 1.6, 2.6));
        return g;
    }
    function scarecrow() { return G(box(0.18, 2.6, 0.18, '#8b5a3c', 0, 1.3, 0), box(2, 0.16, 0.16, '#8b5a3c', 0, 2, 0), box(0.8, 1, 0.5, '#5cb8ff', 0, 1.9, 0), box(0.5, 0.5, 0.5, '#f2c94c', 0, 2.7, 0), cyl(0.05, 0.55, 0.3, '#c98a3c', 0, 3.05, 0, 8)); }
    function cart() {
        const g = new T.Group();
        g.add(box(2.4, 0.6, 1.5, '#a8744c', 0, 1, 0)); g.add(box(2.4, 0.5, 0.1, '#8b5a3c', 0, 1.5, 0.72)); g.add(box(2.4, 0.5, 0.1, '#8b5a3c', 0, 1.5, -0.72));
        [-1, 1].forEach((s) => { const w = mk(new T.CylinderGeometry(0.55, 0.55, 0.15, 10), '#6b4428'); w.rotation.x = Math.PI / 2; w.position.set(0.3, 0.55, s * 0.85); g.add(w); });
        g.add(box(1.8, 0.1, 0.1, '#6b4428', 2, 0.9, 0.3)); g.add(box(1.8, 0.1, 0.1, '#6b4428', 2, 0.9, -0.3));
        g.add(haystack(0.45).translateY(1.1));
        return g;
    }
    function palm(h) {
        const g = new T.Group(); let x = 0, y = 0;
        const lean = rnd(-0.35, 0.35), seg = Math.round(h / 0.8);
        for (let i = 0; i < seg; i++) { const s = box(0.42 - i * 0.012, 0.85, 0.42 - i * 0.012, i % 2 ? '#a8744c' : '#8b5a3c', x, y + 0.42, 0); s.rotation.z = -lean * 0.5; g.add(s); x += Math.sin(lean) * 0.32 * (i / seg + 0.4); y += 0.8; }
        for (let k = 0; k < 7; k++) {
            const a = (k / 7) * TAU, lf = box(0.55, 0.1, 3.2, k % 2 ? '#3fbf8f' : '#5fcf7a', x + Math.sin(a) * 1.3, y + 0.15, Math.cos(a) * 1.3);
            lf.rotation.y = a; lf.rotation.x = 0.35; g.add(lf);
        }
        g.add(box(0.35, 0.35, 0.35, '#7a4a2a', x + 0.2, y - 0.2, 0.2)); g.add(box(0.35, 0.35, 0.35, '#7a4a2a', x - 0.2, y - 0.25, -0.1));
        return g;
    }

    /* ---------------- pembangunan dunia v5 ---------------- */
    OW._v5 = function () {
        const s = this.scene, M = this._mats(), obs = this.obstacles || (this.obstacles = []);
        const ob = (x, z, r, h = 9) => obs.push({ x, z, r, h });
        const dummy = new T.Object3D(), col = new T.Color();

        /* ===== jalan berlapis batu ===== */
        const slabs = [];
        ROADS.forEach((road) => {
            for (let i = 1; i < road.length; i++) {
                const [x0, z0] = road[i - 1], [x1, z1] = road[i], L = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / L, uz = (z1 - z0) / L;
                for (let t = 0; t < L; t += 1.75) {
                    for (let w = -1.5; w <= 1.5; w += 1) {
                        const x = x0 + ux * t - uz * w * 1.6 + rnd(-0.12, 0.12), z = z0 + uz * t + ux * w * 1.6 + rnd(-0.12, 0.12);
                        if (Math.hypot(x - PLAZA.x, z - PLAZA.z) < 23 || Terrain.riverDist(x, z) < 8.5 || !Terrain.land(x, z)) continue;
                        if (Math.abs(w) > 1 && Math.random() < 0.35) continue; // tepi jalan tak rata, terlihat alami
                        slabs.push([x, z, Math.atan2(ux, uz) + rnd(-0.08, 0.08)]);
                    }
                }
            }
        });
        const slab = new T.InstancedMesh(new T.BoxGeometry(1.5, 0.16, 1.6), this.toon('#ffffff'), slabs.length);
        const sc = ['#efe2c8', '#e3d3b4', '#f6ecd8', '#d9c9ab', '#eadcc0'];
        slabs.forEach(([x, z, yaw], i) => {
            const y = Math.max(Terrain.height(x, z), Terrain.height(x + 0.6, z), Terrain.height(x - 0.6, z), Terrain.height(x, z + 0.6), Terrain.height(x, z - 0.6));
            dummy.position.set(x, y + 0.02, z); dummy.rotation.set(0, yaw, 0); dummy.scale.set(rnd(0.85, 1), 1, rnd(0.85, 1)); dummy.updateMatrix();
            slab.setMatrixAt(i, dummy.matrix); slab.setColorAt(i, col.set(sc[i % sc.length]));
        });
        slab.receiveShadow = true; s.add(slab);

        /* ===== Pasar Agora ===== */
        const awn = [['#ff5f7e', '#fff6e6'], ['#5cb8ff', '#fff6e6'], ['#ffcf4a', '#ff8f5a'], ['#4ee6d6', '#ffffff'], ['#b892ff', '#fff6e6'], ['#7be08a', '#ffffff']];
        const goods = [['#7a4a8c', '#3f9f6a', '#ff8f5a', '#ffd23f', '#9b3a4a'], ['#c96b3c', '#ffffff', '#c96b3c', '#5cb8ff', '#c96b3c'], ['#ff5f7e', '#ffd23f', '#7be08a', '#b892ff', '#ff8f5a']];
        [22.5, 157.5, 202.5, 247.5, 292.5, 337.5].forEach((deg, k) => {
            const a = deg * Math.PI / 180, x = PLAZA.x + Math.cos(a) * 11.6, z = PLAZA.z + Math.sin(a) * 11.6;
            this._add(this._place(stall(awn[k][0], awn[k][1], goods[k % 3]), x, z, Math.atan2(PLAZA.x - x, PLAZA.z - z)));
            ob(x, z, 2.1, 3);
        });

        /* ===== Desa Petani ===== */
        const hc = [['#fff1dc', '#ff8f6b'], ['#ffe9c7', '#c0573c'], ['#fff6e6', '#5cb8ff'], ['#f6e3c5', '#ff8f6b'], ['#fff1dc', '#e8b83a'], ['#ffe9c7', '#7be08a']];
        [[62, 96, 0.3], [70, 92, -0.2], [79, 98, -0.6], [60, 108, 1.4], [66, 117, 2.6], [76, 114, 3.3]].forEach(([x, z, yaw], k) => { this._add(this._place(house(hc[k][0], hc[k][1]), x, z, yaw)); ob(x, z, 3.1, 5); });
        this._add(this._place(well(), 70, 104)); ob(70, 104, 1.6, 3);
        this._add(this._place(barn(), 82, 106, -Math.PI / 2)); ob(82, 104, 3.4, 6); ob(82, 108, 3.4, 6);
        this._add(this._place(cart(), 66, 100.5, 0.8)); ob(66, 100.5, 1.5, 2.5);
        [[86, 85], [99, 86], [86, 125], [101, 124]].forEach(([x, z]) => { this._add(this._place(haystack(rnd(0.8, 1.15)), x, z)); ob(x, z, 1.6, 3); });
        this._add(this._place(scarecrow(), 93, 93)); this._add(this._place(scarecrow(), 93, 116, 1)); this._add(this._place(scarecrow(), -104, 15, 0.4));
        for (let k = 0; k < 4; k++) this._add(this._place(torch(2.6), 64 + k * 5, 102.5 + (k % 2) * 3));
        /* ===== Ladang Barat ===== */
        this._add(this._place(barn(), -86, 47, Math.PI)); ob(-88, 47, 3.4, 6); ob(-84, 47, 3.4, 6);
        [[-90, 6], [-112, 27], [-78, 40]].forEach(([x, z]) => { this._add(this._place(haystack(rnd(0.9, 1.2)), x, z)); ob(x, z, 1.7, 3); });
        this._add(this._place(cart(), -92, 28, -0.6)); ob(-92, 28, 1.5, 2.5);
        this._add(this._place(house('#fff1dc', '#c0573c'), -76, 8, 0.6)); ob(-76, 8, 3.1, 5);

        // ladang gandum (instanced) + pagar kayu
        const wheat = [];
        FIELDS.forEach((f) => { for (let x = -f.w / 2; x <= f.w / 2; x += 0.55) for (let z = -f.d / 2; z <= f.d / 2; z += 0.75) wheat.push([f.x + x + rnd(-0.18, 0.18), f.z + z + rnd(-0.18, 0.18)]); });
        const wg = new T.BoxGeometry(0.16, 1.15, 0.16); wg.translate(0, 0.57, 0);
        this.wheat = new T.InstancedMesh(wg, this.toon('#ffffff'), wheat.length);
        const wc = ['#f2c94c', '#ffd86b', '#e8b83a', '#f7d774', '#d9a83a'];
        this.wheatData = wheat.map(([x, z], i) => {
            const y = Terrain.height(x, z), h = rnd(0.8, 1.25);
            dummy.position.set(x, y, z); dummy.rotation.set(0, rnd(0, 3), 0); dummy.scale.set(1, h, 1); dummy.updateMatrix();
            this.wheat.setMatrixAt(i, dummy.matrix); this.wheat.setColorAt(i, col.set(wc[i % wc.length]));
            return { x, y, z, h, ph: x * 0.35 + z * 0.2 };
        });
        s.add(this.wheat);
        FIELDS.forEach((f) => {
            const fence = new T.Group(), hw = f.w / 2 + 0.8, hd = f.d / 2 + 0.8;
            const post = (x, z) => fence.add(box(0.22, 1.1, 0.22, '#8b5a3c', x, 0.55, z));
            for (let x = -hw; x <= hw + 0.01; x += hw / 4) { post(x, -hd); post(x, hd); }
            for (let z = -hd + hd / 3; z < hd; z += hd / 3) { post(-hw, z); if (Math.abs(z) > 1.6) post(hw, z); }
            [0.45, 0.85].forEach((y) => { fence.add(box(hw * 2, 0.1, 0.1, '#a8744c', 0, y, -hd)); fence.add(box(hw * 2, 0.1, 0.1, '#a8744c', 0, y, hd)); fence.add(box(0.1, 0.1, hd * 2, '#a8744c', -hw, y, 0)); fence.add(box(0.1, 0.1, hd - 1.6, '#a8744c', hw, y, (hd + 1.6) / 2)); fence.add(box(0.1, 0.1, hd - 1.6, '#a8744c', hw, y, -(hd + 1.6) / 2)); });
            this._add(this._place(fence, f.x, f.z));
        });

        /* ===== Teater Dionysus ===== */
        const th = new T.Group(), TX = 92, TZ = -48, face = Math.atan2(PLAZA.x - TX, PLAZA.z - TZ);
        th.add(cyl(6, 6, 0.3, '#f3e6cf', 0, 0.15, 0, 24));
        th.add(cyl(1, 1, 0.9, '#fff6e6', 0, 0.45, 0, 10)); th.add(cyl(0.6, 0.6, 0.3, '#ffb347', 0, 1.05, 0, 10, true)); // altar Dionysus
        for (let i = 0; i < 7; i++) {
            const R = 7.2 + i * 1.55, n = Math.round(R * 1.9);
            for (let k = 0; k <= n; k++) {
                const a = Math.PI * 0.15 + (k / n) * Math.PI * 0.7 + Math.PI; // setengah lingkaran di belakang
                if (Math.abs(k - n / 2) < 0.6 && i < 6) continue; // tangga di tengah
                const seat = box(R * Math.PI * 0.7 / n + 0.12, 0.55 * (i + 1), 1.5, i % 2 ? '#efe2c8' : '#fff6e6', Math.cos(a) * R, 0.275 * (i + 1), Math.sin(a) * R);
                seat.rotation.y = -a + Math.PI / 2; th.add(seat);
            }
        }
        th.add(box(15, 2.2, 1.2, '#fff1dc', 0, 1.1, 9.6)); th.add(box(15.6, 0.5, 2.6, '#ff8f6b', 0, 3.85, 9.0));
        for (let k = -3; k <= 3; k++) th.add(cyl(0.3, 0.36, 3.6, '#fff6e6', k * 2.3, 1.8, 8.2, 8));
        th.add(box(15, 0.4, 3.4, '#e9d8b8', 0, 0.2, 7.6)); // panggung
        // topeng komedi (putih) & tragedi (emas) menghadap penonton
        [[-3.4, '#ffffff', 2.9], [3.4, '#ffcf4a', 2.1]].forEach(([mx, mc, my]) => { th.add(box(1.3, 1.6, 0.2, mc, mx, 2.6, 8.92)); th.add(box(0.25, 0.25, 0.1, '#1d1530', mx - 0.3, 2.9, 8.8)); th.add(box(0.25, 0.25, 0.1, '#1d1530', mx + 0.3, 2.9, 8.8)); th.add(box(0.7, 0.18, 0.1, '#1d1530', mx, my, 8.8)); });
        const loc = (lx, lz) => [TX + lx * Math.cos(face) + lz * Math.sin(face), TZ - lx * Math.sin(face) + lz * Math.cos(face)];
        this._add(this._place(th, TX, TZ, face));
        for (let k = -3; k <= 3; k++) { const [x, z] = loc(k * 2.3, 9.2); ob(x, z, 1.3, 4); }
        for (let k = 0; k <= 12; k++) { const a = Math.PI * 1.15 + (k / 12) * Math.PI * 0.7; for (const R of [10.5, 15.5]) { const [x, z] = loc(Math.cos(a) * R, Math.sin(a) * R); ob(x, z, 2.6, 2 + R * 0.25); } }
        [[-8, 3], [8, 3]].forEach(([lx, lz]) => { const [x, z] = loc(lx, lz); this._add(this._place(torch(3), x, z)); });

        /* ===== Tholos Delphi ===== */
        const DX = 76, DZ = -116, dh = new T.Group();
        for (let t = 0; t < 3; t++) dh.add(cyl(7.6 - t * 0.7, 7.6 - t * 0.7, 0.5, t % 2 ? '#f3e6cf' : '#fff8ec', 0, 0.25 + t * 0.5, 0, 28));
        dh.add(cyl(3.4, 3.4, 5.2, '#e8d6b8', 0, 1.5 + 2.6, 0, 20));
        for (let k = 0; k < 20; k++) { const a = (k / 20) * TAU; dh.add(cyl(0.3, 0.36, 5.6, '#fff6e6', Math.cos(a) * 5.6, 1.5 + 2.8, Math.sin(a) * 5.6, 8)); dh.add(box(0.8, 0.3, 0.8, '#f3e6cf', Math.cos(a) * 5.6, 7.45, Math.sin(a) * 5.6)); }
        dh.add(cyl(6.3, 6.3, 0.7, '#fff6e6', 0, 7.9, 0, 28)); dh.add(cyl(6.4, 6.4, 0.35, '#5cb8ff', 0, 8.4, 0, 28));
        dh.add(mk(new T.ConeGeometry(6.2, 2.4, 20), '#ff8f6b').translateY(9.75));
        dh.add(box(0.7, 1.1, 0.7, '#ffcf4a', 0, 11.4, 0));
        dh.add(box(2, 3.4, 0.25, '#6b4428', 0, 3.2, 3.42));
        // omphalos & tripod Pythia di depan
        dh.add(mk(new T.SphereGeometry(0.9, 10, 6, 0, TAU, 0, Math.PI / 2), '#e8dcc8').translateZ(8.8).translateY(0.3));
        [0, 1, 2].forEach((k) => { const a = (k / 3) * TAU, l = box(0.12, 2, 0.12, '#ffcf4a', Math.cos(a) * 0.5 + 3.2, 1, Math.sin(a) * 0.5 + 8.6); l.rotation.z = Math.cos(a) * 0.2; l.rotation.x = -Math.sin(a) * 0.2; dh.add(l); });
        dh.add(cyl(0.7, 0.4, 0.4, '#ffcf4a', 3.2, 2.1, 8.6, 10)); dh.add(cyl(0.5, 0.5, 0.12, '#ffb347', 3.2, 2.32, 8.6, 10, true));
        // tangga menuruni bukit suci
        for (let k = 0; k < 9; k++) { const top = -k * 0.75, hh = 3 + k * 0.4; dh.add(box(4.2, hh, 1.5, k % 2 ? '#efe2c8' : '#f3e6cf', 0, top - hh / 2, 10.5 + k * 1.45)); }
        // pohon salam (laurel) suci
        [[-8, 4], [8, 4], [-7, -6], [7, -6]].forEach(([x, z]) => { dh.add(box(0.4, 2.2, 0.4, '#8b5a3c', x, 1.1, z)); dh.add(mk(new T.IcosahedronGeometry(1.6, 0), '#3fbf8f').translateX(x).translateY(3.2).translateZ(z)); });
        const dyaw = Math.atan2(PLAZA.x - DX, PLAZA.z - DZ);
        this._add(this._place(dh, DX, DZ, dyaw)); ob(DX, DZ, 7.2, 12);
        this._delphiSmoke = new T.Vector3(DX + Math.sin(dyaw) * 8.6 + Math.cos(dyaw) * 3.2, Terrain.height(DX, DZ) + 3.4, DZ + Math.cos(dyaw) * 8.6 - Math.sin(dyaw) * 3.2);
        if (this.smoke) this.smoke.src.push(this._delphiSmoke.clone().setY(this._delphiSmoke.y - 1));

        /* ===== Pohon palem di pantai ===== */
        const palms = []; let tries = 0;
        while (palms.length < 70 && tries++ < 9000) {
            const a = rnd(0, TAU), r = rnd(200, 300), x = Math.cos(a) * r, z = Math.sin(a) * r, h = Terrain.height(x, z);
            if (h < 1.1 || h > 3.2 || Terrain.roadDist(x, z) < 5 || Terrain.reserved(x, z) || Terrain.riverDist(x, z) < 8) continue;
            if (Math.hypot(x + 185, z - 75) < 62 || Math.hypot(x - 100, z - 195) < 40 || Math.hypot(x - TROY.x, z - TROY.z) < 45) continue;
            if (palms.some((p) => Math.hypot(p[0] - x, p[1] - z) < 7)) continue;
            palms.push([x, z]);
        }
        for (let i = 0; i < palms.length; i += 10) { const grp = new T.Group(); palms.slice(i, i + 10).forEach(([x, z]) => { const p = palm(rnd(4.5, 7.5)); p.position.set(x, Terrain.height(x, z) - 0.1, z); p.rotation.y = rnd(0, TAU); grp.add(p); }); this._add(grp); }

        /* ===== Buih ombak di garis pantai ===== */
        const foam = [];
        for (let k = 0; k < 520; k++) {
            const a = (k / 520) * TAU; let r0 = null;
            for (let r = 180; r < 340; r += 1.5) { if (Terrain.height(Math.cos(a) * r, Math.sin(a) * r) < 0.6) { r0 = r; break; } }
            if (r0) foam.push([a, r0]);
        }
        const fg = new T.PlaneGeometry(3.4, 1.1); fg.rotateX(-Math.PI / 2);
        this.foam = new T.InstancedMesh(fg, new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false }), foam.length);
        this.foamData = foam;
        s.add(this.foam);

        /* ===== Pulau-pulau jauh di cakrawala ===== */
        this.farMat = [new T.MeshBasicMaterial({ color: '#8f86c4', fog: false }), new T.MeshBasicMaterial({ color: '#b3a8d8', fog: false })];
        const far = new T.Group();
        for (let k = 0; k < 14; k++) {
            const a = (k / 14) * TAU + rnd(-0.12, 0.12), ring = k % 2, R = ring ? rnd(980, 1080) : rnd(720, 820), mat = this.farMat[ring];
            const isl = new T.Group(); const n = 2 + (k % 3);
            for (let j = 0; j < n; j++) {
                const hh = rnd(30, 95) * (ring ? 1.3 : 1), rr = rnd(45, 110);
                const c = new T.Mesh(new T.ConeGeometry(rr, hh, 7), mat); c.position.set(rnd(-90, 90), hh / 2 - 6, rnd(-30, 30)); isl.add(c);
            }
            isl.position.set(Math.cos(a) * R, 0, Math.sin(a) * R); isl.rotation.y = -a; far.add(isl);
        }
        s.add(far); this.farIslands = far;

        /* ===== Kapal layar yang berlayar ===== */
        this.sailing = [['#ffffff', '#ff5f7e', 345, 0], ['#fff1dc', '#5cb8ff', 365, 2.1], ['#ffe9c7', '#7a4a8c', 355, 4.2]].map(([sail, stripe, R, a0], k) => {
            const b = bake(ship(sail, stripe), M, true); s.add(b); return { obj: b, R, a: a0, sp: (k % 2 ? -1 : 1) * rnd(0.006, 0.009) };
        });

        /* ===== Kelopak bunga berguguran ===== */
        const NP = 60, pg = new T.PlaneGeometry(0.13, 0.09);
        this.petals = new T.InstancedMesh(pg, new T.MeshBasicMaterial({ side: T.DoubleSide }), NP);
        const pc = ['#ffb3d1', '#ff9cc8', '#ffffff', '#ffd6ec', '#fff1a8'];
        this.petalData = [];
        for (let i = 0; i < NP; i++) { this.petalData.push({ x: rnd(-26, 26), y: rnd(0, 14), z: rnd(-26, 26), sp: rnd(0.6, 1.3), ph: rnd(0, 6) }); this.petals.setColorAt(i, col.set(pc[i % pc.length])); }
        this.petals.frustumCulled = false; s.add(this.petals);

        // obstacle cache (puncak untuk kamera)
        obs.forEach((o) => { o.top = Terrain.height(o.x, o.z) + (o.h || 12); });
        this.found = this.g.data.state.found || {};
    };

    /* ---------------- kamera pintar (tidak tertutup bangunan) ---------------- */
    OW._camCast = function (pitch) {
        const t = this.camTarget(), c = this.cam;
        const dir = new T.Vector3(Math.sin(c.yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(c.yaw) * Math.cos(pitch));
        let dist = c.dist;
        const L = this.obstacles || [], near = [];
        for (const o of L) { if (Math.abs(o.x - t.x) < dist + o.r && Math.abs(o.z - t.z) < dist + o.r && Math.hypot(t.x - o.x, t.z - o.z) > o.r) near.push(o); }
        const TS = this.treeSpots || [], R2 = dist + 2;
        for (const [x, z] of TS) { if (Math.abs(x - t.x) < R2 && Math.abs(z - t.z) < R2 && Math.hypot(t.x - x, t.z - z) > 2.2) near.push({ x, z, r: 2.4, top: Terrain.height(x, z) + 7 }); }
        const inTroy = (x, z) => Math.hypot(x - TROY.x, z - TROY.z) < TROY.wallR;
        const tIn = inTroy(t.x, t.z), wallTop = Terrain.height(TROY.x - TROY.wallR, TROY.z) + 13.5;
        const useGrid = M5.topAt(t.x, t.z) < t.y; // jangan pakai grid bila pemain sedang di bawah atap/gerbang
        const N = 26; let hit = N;
        for (let i = 1; i <= N; i++) {
            const k = (i / N) * dist, x = t.x + dir.x * k, y = t.y + dir.y * k, z = t.z + dir.z * k;
            if (y < Terrain.height(x, z) + 0.5) { hit = i; break; }
            let blocked = false;
            for (const o of near) { if (y < (o.top || 99) && Math.hypot(x - o.x, z - o.z) < o.r * 0.95) { blocked = true; break; } }
            if (!blocked && useGrid && y < M5.topAt(x, z) + 0.25 && M5.topAt(x, z) > Terrain.height(x, z) + 0.6) blocked = true;
            if (!blocked && inTroy(x, z) !== tIn && y < wallTop) {
                const a = Math.atan2(z - TROY.z, x - TROY.x); blocked = Math.abs(angDiff(a, this.troyGate)) > 0.13;
            }
            if (blocked) { hit = i; break; }
        }
        if (hit < N) dist = Math.max(1.4, ((hit - 1) / N) * dist);
        return { t, dir, dist };
    };
    OW.camDesired = function () {
        const c = this.cam, want = Math.min(c.dist, 6);
        // bila tertutup, coba naikkan sudut kamera (melihat dari atas) sebelum mendekat
        let best = this._camCast(c.pitch);
        if (best.dist < want) for (const dp of [0.25, 0.5]) {
            const pitch = Math.min(1.0, c.pitch + dp), r = this._camCast(pitch);
            if (r.dist > best.dist + 0.5) best = r;
            if (r.dist >= want) break;
        }
        const { t, dir, dist } = best;
        const p = t.clone().addScaledVector(dir, dist);
        const gh = Terrain.height(p.x, p.z) + 1.2;
        if (p.y < gh) p.y = gh;
        return p;
    };
    // kamera mendekat cepat bila tertutup, menjauh perlahan
    const baseUpdate = OW.update;
    OW.update = function (dt, time) {
        baseUpdate.call(this, dt, time);
        if (!this.wheat) return;
        const P = this.player.pos, d3 = new T.Object3D();
        // pemain tidak menembus tubuh tokoh
        if (!this.flying) for (const n of this.npcs) {
            const dx = P.x - n.pos.x, dz = P.z - n.pos.z, d = Math.hypot(dx, dz), R = 0.9 * Math.max(1, n.bh.baseScale);
            if (d < R && Math.abs(P.y - n.pos.y) < 2) { const k = (R - d) / (d || 1), nx = P.x + (d ? dx : 1) * k, nz = P.z + (d ? dz : 0) * k; if (!this.blocked(P.x, P.z, nx, nz)) { P.x = nx; P.z = nz; } }
        }
        // gandum bergoyang ditiup angin (hanya bila dekat)
        this._wh = (this._wh || 0) + 1;
        if (this._wh % 3 === 0) {
            let any = false;
            for (const f of FIELDS) if (Math.hypot(P.x - f.x, P.z - f.z) < 90) any = true;
            if (any) {
                this.wheatData.forEach((w, i) => {
                    d3.position.set(w.x, w.y, w.z);
                    const sway = Math.sin(time * 1.8 + w.ph) * 0.16, near = Math.hypot(P.x - w.x, P.z - w.z), push = near < 1.6 ? (1.6 - near) * 0.5 : 0;
                    d3.rotation.set(sway + push, w.ph, sway * 0.5); d3.scale.set(1, w.h, 1); d3.updateMatrix(); this.wheat.setMatrixAt(i, d3.matrix);
                });
                this.wheat.instanceMatrix.needsUpdate = true;
            }
        }
        // buih ombak
        const Fm = this.foam, fd = this.foamData;
        if (this._wh % 2 === 0) {
            fd.forEach(([a, r0], i) => {
                const pulse = Math.sin(time * 0.9 + i * 0.7), r = r0 + 0.6 + pulse * 1.3;
                d3.position.set(Math.cos(a) * r, 0.32, Math.sin(a) * r); d3.rotation.set(0, -a + Math.PI / 2, 0); d3.scale.set(1, 1, 0.6 + (pulse + 1) * 0.45); d3.updateMatrix(); Fm.setMatrixAt(i, d3.matrix);
            });
            Fm.instanceMatrix.needsUpdate = true;
            Fm.material.opacity = 0.42 + Math.sin(time * 0.9) * 0.12;
        }
        // kapal berlayar
        this.sailing.forEach((sh) => {
            sh.a += sh.sp * dt; const x = Math.cos(sh.a) * sh.R, z = Math.sin(sh.a) * sh.R;
            sh.obj.position.set(x, -0.6 + Math.sin(time * 1.2 + sh.R) * 0.25, z);
            sh.obj.rotation.set(Math.sin(time * 0.9 + sh.R) * 0.04, Math.atan2(-Math.sin(sh.a) * Math.sign(sh.sp), Math.cos(sh.a) * Math.sign(sh.sp)), Math.cos(time * 0.8 + sh.R) * 0.05);
        });
        // kelopak bunga (siang, di daratan rendah)
        const Pt = this.petals, show = this.night < 0.4 && P.y < 30;
        Pt.visible = show;
        if (show) {
            this.petalData.forEach((p, i) => {
                p.y -= p.sp * dt; p.x += Math.sin(time * 0.7 + p.ph) * dt * 1.2 + dt * 0.8; p.z += Math.cos(time * 0.5 + p.ph) * dt * 0.8;
                if (p.y < -1 || Math.abs(p.x) > 28 || Math.abs(p.z) > 28) { p.y = rnd(8, 14); p.x = rnd(-26, 26); p.z = rnd(-26, 26); }
                const x = P.x + p.x, z = P.z + p.z, gy = Terrain.height(x, z), y = Math.max(gy + 0.05, P.y + p.y - 2);
                d3.position.set(x, y, z);
                const cp = this.camera.position, nearCam = Math.hypot(x - cp.x, y - cp.y, z - cp.z) < 5;
                d3.rotation.set(time * 2 + p.ph, time * 1.3 + p.ph, 0); d3.scale.setScalar(Terrain.land(x, z) && !nearCam ? 1 : 0.001); d3.updateMatrix(); Pt.setMatrixAt(i, d3.matrix);
            });
            Pt.instanceMatrix.needsUpdate = true;
        }
        // pulau jauh mengikuti warna kabut
        this.farIslands.position.set(P.x * 0.6, 0, P.z * 0.6);
        // tempat menarik
        this._poiT = (this._poiT || 0) - dt;
        if (this._poiT <= 0 && !this.paused) {
            this._poiT = 0.6;
            for (const p of POI) {
                if (this.found[p.id] || Math.hypot(P.x - p.x, P.z - p.z) > p.r) continue;
                this.found[p.id] = Date.now(); this.g.data.state.found = this.found; this.g.data.save();
                const n = Object.keys(this.found).length;
                this.g.ui.toast(`${p.icon} <b>Tempat ditemukan: ${p.name}</b><br><small>${p.desc}</small><br><small>📍 ${n}/${POI.length} tempat menarik</small>`, 5200);
                this.g.audio.chime();
            }
        }
    };
    // warna pulau jauh mengikuti langit
    const baseSky = OW.applySky;
    OW.applySky = function () {
        baseSky.call(this);
        if (!this.farMat) return;
        const f = this.scene.fog.color;
        this.farMat[0].color.copy(f).lerp(new T.Color('#5a4f8f'), 0.32 - this.night * 0.12);
        this.farMat[1].color.copy(f).lerp(new T.Color('#5a4f8f'), 0.16 - this.night * 0.08);
    };
    const baseBuild = OW.build;
    /* ---------- v5.1: tokoh tidak boleh di dalam bangunan / tembok ---------- */
    const inTroyW = (x, z) => Math.hypot(x - TROY.x, z - TROY.z) < TROY.wallR;
    OW.spotBad = function (x, z, r = 0.9) {
        if (!Terrain.land(x, z) || M5.solidNear(x, z, r) || M5.solidNear(x, z, r * 0.5)) return true;
        const d = Math.hypot(x - TROY.x, z - TROY.z);
        if (Math.abs(d - TROY.wallR) < 3) return true;
        for (const o of this.obstacles || []) if (Math.hypot(x - o.x, z - o.z) < o.r + 0.6) return true;
        return false;
    };
    OW.nearestFree = function (x, z, r = 0.9) {
        if (!this.spotBad(x, z, r)) return { x, z };
        const side = inTroyW(x, z);
        for (let R = 1; R <= 45; R += 0.75) {
            const n = Math.max(8, Math.round(R * 5)), a0 = Math.random() * TAU;
            for (let k = 0; k < n; k++) {
                const a = a0 + (k / n) * TAU, px = x + Math.cos(a) * R, pz = z + Math.sin(a) * R;
                if (inTroyW(px, pz) === side && !this.spotBad(px, pz, r)) return { x: px, z: pz };
            }
        }
        return { x, z };
    };
    // keluarga kerajaan & warga kota tinggal DI DALAM tembok Troya
    const CITY = new Set(['priam', 'hecuba', 'hector', 'andromache', 'astyanax', 'paris', 'helen', 'cassandra', 'deiphobus', 'helenus', 'laodice', 'polydorus', 'lycaon', 'antenor', 'polydamas', 'agenor', 'dolon', 'aeneas']);
    OW.relocateNpcs = function () {
        let moved = 0;
        this.npcs.forEach((n) => {
            if (!CITY.has(n.hero.id) || inTroyW(n.pos.x, n.pos.z)) return;
            for (let t = 0; t < 200; t++) {
                const a = Math.random() * TAU, r = Math.sqrt(Math.random()) * (TROY.wallR - 5), x = TROY.x + Math.cos(a) * r, z = TROY.z + Math.sin(a) * r;
                if (this.spotBad(x, z) || this.npcs.some((m) => m !== n && Math.hypot(m.pos.x - x, m.pos.z - z) < 2.5)) continue;
                n.pos.set(x, Terrain.height(x, z), z); n.home.set(x, 0, z); n.bh.root.position.copy(n.pos); n.wanderR = 9; moved++; break;
            }
        });
        const crowd = (x, z, self) => this.npcs.some((m) => m !== self && m._placed && Math.hypot(m.pos.x - x, m.pos.z - z) < 2.2);
        this.npcs.forEach((n) => {
            if (!this.spotBad(n.pos.x, n.pos.z) && !crowd(n.pos.x, n.pos.z, n)) { n._placed = true; return; }
            const keep = this.spotBad; this.spotBad = (x, z, r) => keep.call(this, x, z, r) || crowd(x, z, n);
            const p = this.nearestFree(n.pos.x, n.pos.z); this.spotBad = keep; n._placed = true;
            n.pos.set(p.x, Terrain.height(p.x, p.z), p.z); n.home.set(p.x, 0, p.z); n.target = null; n.state = 'idle';
            n.bh.root.position.copy(n.pos); moved++;
        });
        this._relocated = moved;
    };
    // NPC berjalan: tujuan jalan-jalan juga harus di tempat terbuka
    const baseUpdNpcs = OW.updateNpcs;
    OW.updateNpcs = function (dt, time) {
        baseUpdNpcs.call(this, dt, time);
        // tokoh saling menjaga jarak (tidak menumpuk)
        const A = this.npcs;
        for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) {
            const a = A[i], b = A[j], dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z;
            if (dx > 1.3 || dx < -1.3 || dz > 1.3 || dz < -1.3) continue;
            const d = Math.hypot(dx, dz) || 0.01; if (d >= 1.3) continue;
            const push = (1.3 - d) * 0.5, ux = dx / d * push, uz = dz / d * push;
            if (!this.blocked(a.pos.x, a.pos.z, a.pos.x - ux, a.pos.z - uz)) { a.pos.x -= ux; a.pos.z -= uz; a.pos.y = Terrain.height(a.pos.x, a.pos.z); a.bh.root.position.copy(a.pos); }
            if (!this.blocked(b.pos.x, b.pos.z, b.pos.x + ux, b.pos.z + uz)) { b.pos.x += ux; b.pos.z += uz; b.pos.y = Terrain.height(b.pos.x, b.pos.z); b.bh.root.position.copy(b.pos); }
        }
        for (const n of this.npcs) {
            if (n.target && n.state === 'walk' && !n._tChecked) { n._tChecked = true; if (this.spotBad(n.target.x, n.target.z, 0.6)) { n.target = null; n.state = 'idle'; n.timer = 1; } }
            if (n.state !== 'walk') n._tChecked = false;
        }
    };
    OW.los = function (x0, z0, x1, z1) { const L = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / 0.4); for (let k = 1; k < L; k++) if (M5.solidAt(x0 + (x1 - x0) * k / L, z0 + (z1 - z0) * k / L)) return false; return true; };
    OW.roomy = function (x, z, r) { for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; if (M5.solidAt(x + Math.cos(a) * r, z + Math.sin(a) * r) || M5.solidAt(x + Math.cos(a) * r * 0.5, z + Math.sin(a) * r * 0.5)) return false; } return true; };
    // titik teleport: jangan menumpuk dengan tokoh lain
    OW.freeSpot = function (x, z, rMin = 3, rMax = 9) {
        for (let i = 0; i < 80; i++) {
            const a = Math.random() * TAU, r = rMin + Math.random() * (rMax - rMin + i * 0.12), px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
            if (this.spotBad(px, pz, 0.6)) continue;
            if (this.npcs.some((n) => Math.hypot(n.pos.x - px, n.pos.z - pz) < 2.2)) continue;
            if (i < 70 && !this.los(px, pz, x, z)) continue; // harus bisa melihat tujuannya
            if (i < 45 && !this.roomy(px, pz, 3)) continue; // utamakan tempat lapang, bukan gang sempit
            return { x: px, z: pz };
        }
        return this.nearestFree(x + rMin, z, 0.6);
    };
    const basePlace = OW.placePlayer;
    OW.placePlayer = function (p) {
        const q = (this.spotBad && this.obstacles) ? this.nearestFree(p.x, p.z, 0.6) : p;
        basePlace.call(this, q);
    };
    // label nama disembunyikan bila tertutup bangunan
    OW.occluded = function (n) {
        const c = this.camera.position, hx = n.pos.x, hy = n.pos.y + 2.2 * n.bh.baseScale, hz = n.pos.z;
        const dx = hx - c.x, dy = hy - c.y, dz = hz - c.z, L = Math.hypot(dx, dz);
        const steps = Math.ceil(L / 0.6);
        for (let i = 1; i < steps; i++) {
            const k = i / steps; if (L * (1 - k) < 1.2) break;
            const x = c.x + dx * k, z = c.z + dz * k, y = c.y + dy * k, top = M5.topAt(x, z);
            if (top > y + 0.1 && M5.solidAt(x, z)) return true;
        }
        return false;
    };
    OW.build = function () { baseBuild.call(this); this._v5(); this.relocateNpcs(); this.applySky(); this._minimapBg(); };
    // peta kecil: jalan digambar
    const baseMini = OW._minimapBg;
    OW._minimapBg = function () {
        baseMini.call(this);
        const c = this.minimapBg; if (!c) return;
        const g = c.getContext('2d'), S = c.width, map = (x, z) => [(x / (2 * (ISLAND_R + 20)) + 0.5) * S, (z / (2 * (ISLAND_R + 20)) + 0.5) * S];
        g.strokeStyle = 'rgba(255,246,230,0.95)'; g.lineWidth = 1.6; g.lineJoin = 'round';
        ROADS.forEach((r) => { g.beginPath(); r.forEach(([x, z], i) => { const [u, v] = map(x, z); i ? g.lineTo(u, v) : g.moveTo(u, v); }); g.stroke(); });
        g.fillStyle = 'rgba(242,201,76,0.9)'; FIELDS.forEach((f) => { const [u, v] = map(f.x - f.w / 2, f.z - f.d / 2); g.fillRect(u, v, f.w / (2 * (ISLAND_R + 20)) * S, f.d / (2 * (ISLAND_R + 20)) * S); });
    };
    // tanda tempat menarik pada peta kecil
    const UIP = UI.prototype, baseDraw = UIP.drawMinimap;
    UIP.drawMinimap = function () {
        baseDraw.call(this);
        const W = this.g.world, cv = $('minimap'), g = cv.getContext('2d'), S = cv.width; if (!W || !W.found) return;
        const map = (x, z) => [(x / (2 * (ISLAND_R + 20)) + 0.5) * S, (z / (2 * (ISLAND_R + 20)) + 0.5) * S];
        g.save(); g.beginPath(); g.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); g.clip();
        g.font = '11px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        POI.forEach((p) => { if (p.id === 'pasar') return; const [x, y] = map(p.x, p.z); if (W.found[p.id]) g.fillText(p.icon, x, y); else { g.fillStyle = 'rgba(29,21,48,0.75)'; g.font = 'bold 10px sans-serif'; g.fillText('?', x, y); g.font = '11px sans-serif'; } });
        g.restore();
    };

    /* =====================================================================
       Catatan Update (patch notes) — riwayat versi di dalam game
       ===================================================================== */
    const PATCHES = [
        { v: '5.1', name: 'Rapi & Teliti', date: 'Oktober 2026', items: [
            '🧱 <b>Tabrakan presisi</b>: setiap balok bangunan (rumah, istana, kuil, tembok, kolom, lapak) sekarang padat — pemain & tokoh tidak bisa lagi menembus atau berdiri di dalamnya.',
            '🧍 <b>Tidak ada tokoh di dalam bangunan</b>: semua 119 tokoh diperiksa & dipindah ke tempat terbuka; tujuan jalan-jalan mereka juga dicek.',
            '👑 Keluarga kerajaan Troya (Priam, Hecuba, Hector, Andromache, Paris, Helen, Cassandra, dll.) kini tinggal <b>di dalam tembok kota</b>.',
            '👥 Tokoh tidak lagi saling menumpuk & kamu tidak menembus tubuh mereka.',
            '🏷️ Label nama disembunyikan bila tokohnya tertutup bangunan.',
            '📍 Teleport dari Buku Sejarah selalu mendarat di tempat terbuka yang <b>bisa melihat tokohnya</b>.',
            '🎥 Kamera: bila tertutup bangunan, kamera naik melihat dari atas dulu sebelum mendekat; tokoh yang menempel di lensa disembunyikan.',
            '🌸 Kelopak bunga & kupu-kupu lebih kecil dan tidak menutupi layar.'
        ] },
        { v: '5.0', name: 'Dunia Hidup', items: [
            '🧱 Jalan berlapis batu ke setiap wilayah, juga spiral ke puncak Olympus.',
            '🎥 <b>Kamera pintar</b> — tidak tertutup rumah, tembok Troya, atau bukit lagi; kamera otomatis mendekat.',
            '🧺 <b>Pasar Agora</b>: 6 lapak bertenda belang penuh amfora, buah, dan kain.',
            '🌾 <b>Desa Petani Boeotia</b> & <b>Ladang Barat</b>: rumah, lumbung, sumur, gerobak, orang-orangan sawah, dan gandum yang bergoyang (tersibak saat kamu lewat!).',
            '🎭 <b>Teater Dionysus</b> — tribun batu setengah lingkaran dengan topeng komedi & tragedi.',
            '🔮 <b>Tholos Delphi</b> di atas bukit suci, lengkap dengan tripod Pythia dan asap ramalan.',
            '🌴 Pohon palem di pantai, buih ombak di garis pantai, 3 kapal layar berlayar mengelilingi pulau.',
            '🏝️ Siluet pulau-pulau jauh di cakrawala & kelopak bunga berguguran di siang hari.',
            '📍 <b>Tempat Menarik</b>: temukan 5 lokasi baru — tanda “?” di peta kecil berubah jadi ikon.',
            '💾 <b>Simpan progres ke file</b> (Menu) & <b>Muat progres dari file</b> (layar masuk) — bawa progresmu lewat flashdisk ke komputer lain.',
            '📰 Panel Catatan Update ini (Menu → Catatan Update).'
        ] },
        { v: '4.0', name: 'Sayap Hermes', items: [
            '🕊️ Terbang di Mode Jelajah (F) — Spasi naik, C turun, Shift melesat.',
            '📖 Buku Sejarah menampilkan model balok 3D + tombol Teleport.',
            '🖼️ Foto tokoh saat disapa lebih besar & bisa diklik; kisah tokoh jauh lebih panjang (9 bagian).',
            '☀️ Cahaya tidak menyilaukan lagi; tidak ada tokoh yang terjebak di dalam rumah.'
        ] },
        { v: '3.0', name: 'Dunia Megah', items: [
            '🌅 Siklus siang–senja–malam, bintang, bulan, kunang-kunang, dan musik lira.',
            '🏰 Troya bertembok & bermenara, Olympus dengan pulau melayang, kemah Yunani dengan 18 kapal & Kuda Troya.',
            '🌊 Laut bergelombang, Sungai Scamander & jembatan, mercusuar, pusaran Charybdis.'
        ] },
        { v: '2.0', name: 'Dunia Terbuka', items: [
            '🚶 Third-person ala Palworld: tokoh berjalan-jalan, yang agresif mengejarmu.',
            '🔐 Daftar & masuk dengan username unik — progres tersimpan per akun.',
            '🧑 Buat karaktermu sendiri; Mode Bertarung atau Mode Jelajah.',
            '💊 Setelah Kharisma (heal), kamu diam satu giliran — seperti potion di Pokémon.'
        ] },
        { v: '1.0', name: 'Awal Legenda', items: [
            '⚔️ 120 tokoh mitologi Yunani dalam bentuk balok, duel 3D dengan 4 jurus + Ultimate.',
            '📜 Data tokoh direvisi sesuai mitos: patron dewa, elemen, kuat/lemah, rival & sekutu.'
        ] }
    ];
    function patchHTML() {
        return PATCHES.map((p, i) => `<article class="patch-item${i ? '' : ' latest'}"><header><span class="pv">v${p.v}</span><b>${p.name}</b>${p.date ? `<small>${p.date}</small>` : ''}${i ? '' : '<span class="pnew">BARU</span>'}</header><ul>${p.items.map((x) => `<li>${x}</li>`).join('')}</ul></article>`).join('');
    }
    function injectUI() {
        const sec = document.createElement('section');
        sec.id = 'patch'; sec.className = 'screen dim hidden';
        sec.innerHTML = `<div class="patch glass"><div class="patch-head"><span class="cut-tag">📰 CATATAN UPDATE</span><h2>Versi ${VERSION} · ${PATCHES[0].name}</h2><p>Apa saja yang baru di Homeric 3D: Legends of Troy.</p></div><div class="patch-list">${patchHTML()}</div><button id="patch-close" class="btn btn-primary" type="button">Ayo jelajahi! 🧭</button></div>`;
        document.body.appendChild(sec);
        const help = $('menu-help'), b = document.createElement('button');
        b.type = 'button'; b.className = 'btn glass wide'; b.id = 'menu-patch'; b.innerHTML = `📰 Catatan Update <span class="pnew sm">v${VERSION}</span>`;
        help.after(b);
        const card = document.querySelector('.menu-card'), ver = document.createElement('div');
        ver.className = 'ver-tag'; ver.textContent = `Homeric 3D · versi ${VERSION} “${PATCHES[0].name}”`; card.appendChild(ver);
        const auth = document.querySelector('#auth .panel, #auth .auth-card, #auth > div');
        if (auth) { const v2 = ver.cloneNode(true); auth.appendChild(v2); }
    }
    /* ---------- simpan / muat progres sebagai file (untuk flashdisk / komputer lain) ---------- */
    function exportSave(g) {
        g.data.save();
        const acc = Accounts.get(g.data.user); if (!acc) return;
        const blob = new Blob([JSON.stringify({ app: 'homeric3d', format: 1, saved: new Date().toISOString(), account: acc }, null, 1)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `homeric3d-${acc.username}.json`;
        document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
        g.ui.toast(`💾 Progres <b>${acc.username}</b> disimpan sebagai file <b>homeric3d-${acc.username}.json</b>.<br><small>Salin file itu ke flashdisk, lalu di komputer lain pilih “📂 Muat progres dari file”.</small>`, 6500);
    }
    function importSave(file) {
        const msg = $('auth-msg'), rd = new FileReader();
        rd.onload = () => {
            let d; try { d = JSON.parse(rd.result); } catch (e) { d = null; }
            const acc = d && d.app === 'homeric3d' && d.account;
            if (!acc || !acc.username || !acc.pass) { msg.textContent = '❌ File ini bukan file progres Homeric 3D.'; return; }
            const all = Accounts.all(), k = Accounts.key(acc.username), old = all[k];
            if (old && old.pass !== acc.pass) { msg.textContent = `❌ Username "${acc.username}" sudah dipakai akun lain di komputer ini.`; return; }
            if (old && old.save && !confirm(`Akun "${acc.username}" sudah ada di komputer ini. Ganti progresnya dengan isi file (disimpan ${String(d.saved || '').slice(0, 10)})?`)) return;
            all[k] = acc; Accounts.persist();
            $('auth-user').value = acc.username; $('auth-pass').value = ''; $('auth-pass').focus();
            msg.textContent = `✅ Progres "${acc.username}" dimuat! Masukkan kata sandimu lalu tekan Masuk.`;
        };
        rd.readAsText(file);
    }
    window.addEventListener('DOMContentLoaded', () => {
        injectUI();
        const fi = document.createElement('input'); fi.type = 'file'; fi.accept = '.json,application/json'; fi.hidden = true; fi.id = 'save-file';
        const lb = document.createElement('button'); lb.type = 'button'; lb.className = 'btn glass wide'; lb.id = 'auth-load'; lb.textContent = '📂 Muat progres dari file (flashdisk)';
        lb.onclick = () => fi.click(); fi.onchange = () => { if (fi.files[0]) importSave(fi.files[0]); fi.value = ''; };
        const rec = $('auth-recent'); rec.after(lb); rec.after(fi);
        const eb = document.createElement('button'); eb.type = 'button'; eb.className = 'btn glass wide'; eb.id = 'menu-export'; eb.textContent = '💾 Simpan progres ke file (flashdisk)';
        $('menu-spawn').before(eb);
        const wait = setInterval(() => {
            const g = window.game; if (!g || !g.world || g.mode === 'loading') return;
            clearInterval(wait);
            const open = () => { $('toast').classList.add('hidden'); g.world.pause(true); $('menu').classList.add('hidden'); $('patch').classList.remove('hidden'); g.audio.beep(); };
            $('menu-patch').onclick = open;
            $('menu-export').onclick = () => exportSave(g);
            $('patch-close').onclick = () => { g.audio.boop(); $('patch').classList.add('hidden'); g.data.state.patchSeen = VERSION; g.data.save(); if (g.mode === 'world' && $('help').classList.contains('hidden')) g.resumeWorld(); };
            addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('patch').classList.contains('hidden')) { e.stopImmediatePropagation(); $('patch-close').click(); } }, true);
            // kamera: menjauh perlahan setelah tertutup
            const baseEnter = g.enterWorld.bind(g);
            g.enterWorld = (mode) => {
                const st = g.data.state, fresh = !st.helpSeen;
                g.world.found = st.found || (st.found = {});
                g.world._poiT = 5;
                baseEnter(mode);
                if (fresh) st.patchSeen = VERSION;
                else if (st.patchSeen !== VERSION) setTimeout(() => { if (g.mode === 'world') open(); }, 700);
            };
        }, 50);
    });
})();
