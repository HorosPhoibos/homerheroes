/* =====================================================================
   BLOCK HERO — karakter kotak-kotak gaya JoshuaLife
   ---------------------------------------------------------------------
   Setiap tokoh dibangun dari balok (BoxGeometry) + ciri khas mitosnya,
   lalu digabung per bagian tubuh (badan, kepala, lengan, kaki, jubah)
   supaya 120 tokoh tetap ringan. Animasi dibuat lewat kode (tanpa file).
   ===================================================================== */
(function () {
    'use strict';
    const T = window.THREE;
    const TAU = Math.PI * 2;
    const INK = 0x1d1530, BRONZE = 0xd9a24e, BRONZE_D = 0x9b6a2c, LEATHER = 0x7a4a2a, WOOD = 0x8b5a3c, GOLD = 0xffd23f, STEEL = 0xe8eef5;
    const SKINS = [0xf2c094, 0xe8b07e, 0xd9a06a, 0xf5cfa8, 0xc98d5c];
    const HAIRS = [0x2a1a10, 0x3b2414, 0x1a1210, 0x5a3416, 0x4a2c18];

    const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
    const hex = (c) => (typeof c === 'string' ? parseInt(c.replace('#', ''), 16) : c);

    /* ---------------- bahan dasar ---------------- */
    const GEO = new Map();
    const boxGeo = (w, h, d) => { const k = `b${w}|${h}|${d}`; if (!GEO.has(k)) GEO.set(k, new T.BoxGeometry(w, h, d)); return GEO.get(k); };
    const cylGeo = (a, b, h, s) => { const k = `c${a}|${b}|${h}|${s}`; if (!GEO.has(k)) GEO.set(k, new T.CylinderGeometry(a, b, h, s)); return GEO.get(k); };
    const torGeo = (r, t, rs, ts, arc) => { const k = `t${r}|${t}|${rs}|${ts}|${arc}`; if (!GEO.has(k)) GEO.set(k, new T.TorusGeometry(r, t, rs, ts, arc)); return GEO.get(k); };
    // Mesh sementara: warna & "glow" disimpan di userData, nanti digabung
    const part = (geo, c, glow) => { const m = new T.Mesh(geo); m.userData.c = hex(c); if (glow) m.userData.glow = true; return m; };
    const box = (w, h, d, c, glow) => part(boxGeo(w, h, d), c, glow);
    const cyl = (a, b, h, c, s = 8, glow) => part(cylGeo(a, b, h, s), c, glow);
    const tor = (r, t, c, arc = TAU, glow) => part(torGeo(r, t, 4, 12, arc), c, glow);
    const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
    const rot = (o, x, y, z) => { o.rotation.set(x, y, z); return o; };
    const grp = (...k) => { const g = new T.Group(); k.forEach((x) => x && g.add(x)); return g; };

    /* ---------------- perlengkapan ---------------- */
    const ITEMS = {
        spear: () => grp(at(cyl(0.035, 0.035, 2.5, WOOD, 5), 0, 0.4, 0), at(cyl(0, 0.08, 0.3, BRONZE, 4), 0, 1.8, 0)),
        sword: () => grp(at(box(0.07, 0.72, 0.13, STEEL), 0, 0.42, 0), at(box(0.1, 0.06, 0.3, BRONZE), 0, 0.05, 0), at(box(0.07, 0.16, 0.07, LEATHER), 0, -0.05, 0)),
        harpe: () => grp(at(box(0.06, 0.6, 0.1, STEEL), 0, 0.36, 0), at(rot(box(0.06, 0.32, 0.08, STEEL), 0.9, 0, 0), 0, 0.68, 0.12), at(box(0.07, 0.18, 0.07, LEATHER), 0, -0.02, 0)),
        bow: () => grp(at(rot(tor(0.62, 0.04, WOOD, Math.PI), 0, Math.PI / 2, Math.PI / 2), 0, 0.1, 0), at(box(0.012, 1.22, 0.012, 0xffffff), 0, 0.1, 0)),
        trident: () => grp(at(cyl(0.035, 0.035, 2.6, 0xf2d27a, 5), 0, 0.4, 0), at(box(0.06, 0.06, 0.5, 0xf2d27a), 0, 1.7, 0), ...[-0.22, 0, 0.22].map((z) => at(cyl(0, 0.05, 0.4, 0xf2d27a, 4), 0, 1.92, z))),
        bident: () => grp(at(cyl(0.035, 0.035, 2.5, 0x3a3048, 5), 0, 0.4, 0), at(box(0.06, 0.06, 0.34, 0x5a4a70), 0, 1.66, 0), ...[-0.15, 0.15].map((z) => at(cyl(0, 0.05, 0.42, 0x8a7aa8, 4), 0, 1.9, z))),
        bolt: () => { const g = new T.Group(); [[0, 0.5, -0.4], [0.02, 0.15, 0.5], [-0.02, -0.18, -0.4], [0.02, -0.5, 0.5]].forEach(([x, y, r]) => g.add(rot(at(box(0.1, 0.42, 0.1, 0xfff07a, true), x, y, 0), r, 0, 0))); g.rotation.x = -0.5; g.position.y = 0.3; return g; },
        club: () => grp(at(cyl(0.16, 0.07, 1.3, WOOD, 6), 0, 0.5, 0), at(box(0.18, 0.14, 0.18, 0x6b4428), 0.08, 0.8, 0.05)),
        labrys: () => grp(at(cyl(0.04, 0.04, 1.8, WOOD, 5), 0, 0.5, 0), ...[-1, 1].map((s) => at(box(0.06, 0.5, 0.34, 0xc9d2dc), 0, 1.25, s * 0.21))),
        hammer: () => grp(at(cyl(0.04, 0.04, 0.9, WOOD, 5), 0, 0.3, 0), at(box(0.22, 0.2, 0.42, 0x6a6f7a), 0, 0.78, 0)),
        staff: () => grp(at(cyl(0.035, 0.04, 2.1, WOOD, 5), 0, 0.3, 0), at(box(0.1, 0.1, 0.1, GOLD), 0, 1.38, 0)),
        scepter: () => grp(at(cyl(0.035, 0.035, 1.9, GOLD, 5), 0, 0.3, 0), at(box(0.16, 0.16, 0.16, 0xff4d6d), 0, 1.28, 0), at(box(0.22, 0.05, 0.05, GOLD), 0, 1.15, 0)),
        caduceus: () => grp(at(cyl(0.03, 0.03, 1.4, GOLD, 5), 0, 0.3, 0), at(rot(tor(0.1, 0.025, 0x3fa34d), 0, Math.PI / 2, 0), 0, 0.75, 0), at(rot(tor(0.1, 0.025, 0x3fa34d), 0, Math.PI / 2, 0), 0, 0.55, 0), ...[-1, 1].map((s) => at(rot(box(0.03, 0.12, 0.26, 0xffffff), s * 0.5, 0, 0), 0, 1.05, s * 0.1))),
        crook: () => grp(at(cyl(0.035, 0.035, 1.9, WOOD, 5), 0, 0.3, 0), at(rot(tor(0.14, 0.035, WOOD, Math.PI), 0, Math.PI / 2, 0), 0, 1.25, 0.14)),
        lyre: () => grp(at(box(0.08, 0.14, 0.42, GOLD), 0, 0.15, 0), ...[-1, 1].map((s) => at(rot(box(0.06, 0.5, 0.08, GOLD), s * 0.25, 0, 0), 0, 0.42, s * 0.17)), at(box(0.05, 0.05, 0.46, GOLD), 0, 0.66, 0), ...[-0.08, 0, 0.08].map((z) => at(box(0.01, 0.48, 0.01, 0xffffff), 0, 0.4, z))),
        cup: () => grp(at(cyl(0.14, 0.06, 0.18, GOLD, 8), 0, 0.12, 0), at(cyl(0.05, 0.05, 0.1, GOLD, 6), 0, 0, 0)),
        lamp: () => grp(at(box(0.3, 0.1, 0.16, 0xc98d5c), 0, 0.05, 0), at(box(0.07, 0.12, 0.07, 0xffb347, true), 0.14, 0.16, 0)),
        bag: () => grp(at(box(0.36, 0.42, 0.36, 0xb08a5a), 0, -0.05, 0), at(box(0.12, 0.08, 0.12, 0xdcdcdc), 0, 0.2, 0)),
        spindle: () => grp(at(cyl(0.025, 0.025, 0.9, WOOD, 5), 0, 0.3, 0), at(box(0.22, 0.2, 0.22, 0xf3e6c8), 0, 0.62, 0)),
        whip: () => grp(at(cyl(0.03, 0.03, 0.5, LEATHER, 5), 0, 0.15, 0), at(rot(box(0.02, 0.9, 0.02, 0x5a3a20), 0.6, 0, 0), 0, 0.68, 0.24)),
        thread: () => grp(at(box(0.2, 0.2, 0.2, GOLD), 0, 0.05, 0), at(box(0.01, 0.6, 0.01, GOLD), 0, -0.3, 0)),
        scroll: () => grp(at(rot(cyl(0.07, 0.07, 0.36, 0xf3e6c8, 6), Math.PI / 2, 0, 0), 0, 0.1, 0), at(box(0.02, 0.24, 0.3, 0xf3e6c8), 0, -0.04, 0.02)),
        rose: () => grp(at(box(0.14, 0.14, 0.14, 0xff4d6d), 0, 0.42, 0), at(box(0.03, 0.4, 0.03, 0x2ecc71), 0, 0.18, 0)),
        net: () => grp(...[0, 1, 2].map((i) => at(box(0.02, 0.6, 0.5, 0x8a6a4a), 0, 0.3, -0.2 + i * 0.2))),
        wand: () => grp(at(cyl(0.025, 0.03, 0.9, 0x6b3fa0, 5), 0, 0.3, 0), at(box(0.1, 0.1, 0.1, 0xd8a6ff, true), 0, 0.78, 0)),
        dice: () => grp(at(box(0.16, 0.16, 0.16, 0xffffff), 0, 0.08, 0), at(box(0.04, 0.04, 0.01, INK), 0, 0.08, 0.085)),
        none: () => null
    };
    const EMBLEMS = {
        star: (c) => { const g = new T.Group(); for (let i = 0; i < 4; i++) g.add(rot(box(0.02, 0.56, 0.06, c), i * Math.PI / 4, 0, 0)); return g; },
        lion: (c) => grp(box(0.03, 0.3, 0.3, c), at(box(0.02, 0.12, 0.4, c), 0, 0.2, 0), at(box(0.02, 0.04, 0.1, INK), 0.02, 0.04, -0.08), at(box(0.02, 0.04, 0.1, INK), 0.02, 0.04, 0.08)),
        bolt: (c) => grp(rot(box(0.02, 0.3, 0.08, c), 0.5, 0, 0), at(rot(box(0.02, 0.3, 0.08, c), -0.5, 0, 0), 0, -0.2, 0.04)),
        wave: (c) => grp(...[-0.15, 0, 0.15].map((y) => at(box(0.02, 0.06, 0.5, c), 0, y, 0))),
        eye: (c) => grp(box(0.02, 0.18, 0.4, c), at(box(0.03, 0.12, 0.12, INK), 0.01, 0, 0)),
        gorgon: () => grp(box(0.03, 0.26, 0.26, 0x5fcf7a), at(box(0.02, 0.06, 0.06, 0xffe14a), 0.02, 0.04, -0.06), at(box(0.02, 0.06, 0.06, 0xffe14a), 0.02, 0.04, 0.06)),
        owl: () => grp(box(0.03, 0.26, 0.2, 0xa58360), at(box(0.02, 0.07, 0.07, GOLD), 0.02, 0.04, -0.05), at(box(0.02, 0.07, 0.07, GOLD), 0.02, 0.04, 0.05)),
        ring: (c) => rot(tor(0.18, 0.04, c), 0, Math.PI / 2, 0)
    };
    const shield = (face, rim, emblem, emblemColor) => {
        const g = new T.Group();
        g.add(rot(cyl(0.48, 0.48, 0.08, face, 10), 0, 0, Math.PI / 2));
        g.add(at(rot(tor(0.46, 0.05, rim), 0, Math.PI / 2, 0), 0.03, 0, 0));
        const e = emblem && EMBLEMS[emblem] ? EMBLEMS[emblem](emblemColor) : null;
        if (e) { e.position.x = -0.06; g.add(e); }
        g.rotation.y = Math.PI; // muka perisai menghadap ke luar (sisi kiri tubuh)
        return g;
    };
    const towerShield = (c) => grp(box(0.1, 1.5, 0.75, c), at(box(0.04, 1.3, 0.12, BRONZE_D), -0.07, 0, 0), ...[-0.5, 0, 0.5].map((y) => at(box(0.04, 0.05, 0.74, BRONZE), -0.06, y, 0)));

    /* ---------------- tutup kepala ---------------- */
    const HEADGEAR = {
        corinth: (L) => {
            const g = new T.Group(), c = L.metal;
            g.add(at(box(0.64, 0.24, 0.62, c), 0, 0.22, 0));
            if (!L.helmRaised) {
                [-1, 1].forEach((s) => g.add(at(box(0.16, 0.42, 0.1, c), s * 0.21, -0.04, 0.29)));
                g.add(at(box(0.08, 0.26, 0.08, c), 0, 0.04, 0.3));
                [-1, 1].forEach((s) => g.add(at(box(0.06, 0.5, 0.56, c), s * 0.31, 0.02, -0.02)));
            }
            g.add(at(box(0.62, 0.36, 0.08, c), 0, 0.08, -0.3));
            if (L.crest !== null) {
                const tall = L.crestTall ?? 0.42;
                g.add(at(box(0.1, 0.12, 0.5, BRONZE_D), 0, 0.4, 0));
                g.add(at(box(0.12, tall, 0.74, L.crest, L.crestGlow), 0, 0.42 + tall / 2, -0.06));
                if (L.crestFlow) g.add(at(box(0.12, 0.9, 0.16, L.crest), 0, 0.12, -0.5));
                if (L.crestSide) [-1, 1].forEach((s) => g.add(at(box(0.04, 0.4, 0.1, L.crest), s * 0.32, 0.5, 0)));
            }
            if (L.helmRaised) { g.position.y = 0.12; g.rotation.x = -0.25; }
            return g;
        },
        phrygian: (L) => grp( // helm Troya bergaya Frigia: puncak melengkung ke depan
            at(box(0.64, 0.26, 0.62, L.metal), 0, 0.24, 0),
            at(rot(box(0.36, 0.36, 0.4, L.metal), 0.5, 0, 0), 0, 0.46, 0.08),
            at(rot(box(0.2, 0.2, 0.22, L.metal), 0.9, 0, 0), 0, 0.62, 0.24),
            ...[-1, 1].map((s) => at(box(0.06, 0.42, 0.3, L.metal), s * 0.31, 0, 0.1)),
            at(box(0.62, 0.3, 0.08, L.metal), 0, 0.1, -0.3),
            L.crest !== null ? at(box(0.1, 0.12, 0.7, L.crest), 0, 0.58, -0.12) : null,
            L.crestFlow ? at(box(0.12, 0.8, 0.14, L.crest), 0, 0.2, -0.42) : null),
        capFrigia: (L) => grp(at(box(0.6, 0.22, 0.6, L.capColor ?? L.cape), 0, 0.3, 0), at(rot(box(0.34, 0.34, 0.36, L.capColor ?? L.cape), 0.5, 0, 0), 0, 0.5, 0.08), at(rot(box(0.18, 0.2, 0.2, L.capColor ?? L.cape), 0.9, 0, 0), 0, 0.64, 0.22), ...[-1, 1].map((s) => at(box(0.06, 0.4, 0.2, L.capColor ?? L.cape), s * 0.31, 0.02, 0.18))),
        pilos: (L) => grp(at(cyl(0.3, 0.34, 0.12, L.capColor ?? 0x8a5a3a, 8), 0, 0.3, 0), at(cyl(0.04, 0.3, 0.5, L.capColor ?? 0x8a5a3a, 8), 0, 0.6, 0), L.capStar ? at(box(0.12, 0.12, 0.04, GOLD, true), 0, 0.5, 0.19) : null),
        petasos: () => grp(at(cyl(0.48, 0.5, 0.06, 0x8a6a4a, 10), 0, 0.33, 0), at(cyl(0.26, 0.3, 0.2, 0x8a6a4a, 10), 0, 0.44, 0), ...[-1, 1].map((s) => at(rot(box(0.03, 0.14, 0.3, 0xffffff), s * 0.4, 0, 0), s * 0.3, 0.5, -0.05))),
        laurel: (L) => { const g = new T.Group(), c = L.wreath ?? GOLD; for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU; g.add(rot(at(box(0.12, 0.06, 0.16, c), Math.sin(a) * 0.32, 0.3, Math.cos(a) * 0.32), 0.4, a, 0)); } return g; },
        crown: (L) => { const g = new T.Group(), c = L.crownColor ?? GOLD; g.add(at(box(0.62, 0.1, 0.6, c), 0, 0.33, 0)); for (let i = 0; i < 5; i++) g.add(at(box(0.08, 0.2, 0.06, c), -0.24 + i * 0.12, 0.47, 0.3)); if (L.crownGem) g.add(at(box(0.1, 0.1, 0.04, L.crownGem, true), 0, 0.42, 0.32)); return g; },
        polos: (L) => grp(at(cyl(0.3, 0.26, 0.42, L.crownColor ?? GOLD, 8), 0, 0.5, 0), at(box(0.12, 0.12, 0.04, 0xff4d6d, true), 0, 0.5, 0.29)),
        veil: (L) => grp(at(box(0.64, 0.16, 0.62, L.veil), 0, 0.31, 0), at(box(0.64, 0.9, 0.1, L.veil), 0, -0.1, -0.3), ...[-1, 1].map((s) => at(box(0.06, 0.8, 0.5, L.veil), s * 0.32, -0.05, -0.04))),
        lionPelt: () => grp(at(box(0.66, 0.3, 0.66, 0xc98a3c), 0, 0.3, 0), at(box(0.5, 0.14, 0.2, 0xc98a3c), 0, 0.3, 0.36), ...[-1, 1].map((s) => at(box(0.1, 0.1, 0.06, 0xffffff), s * 0.18, 0.24, 0.45)), ...[-1, 1].map((s) => at(box(0.12, 0.12, 0.08, 0xa86a2a), s * 0.26, 0.5, 0.1)), at(box(0.7, 1.2, 0.12, 0xc98a3c), 0, -0.4, -0.33)),
        wolfHat: () => grp(at(box(0.62, 0.26, 0.62, 0x6b6f7a), 0, 0.3, 0), at(box(0.3, 0.16, 0.24, 0x6b6f7a), 0, 0.3, 0.36), ...[-1, 1].map((s) => at(box(0.1, 0.18, 0.08, 0x4a4e58), s * 0.2, 0.5, 0.06)), at(box(0.62, 1.1, 0.1, 0x6b6f7a), 0, -0.35, -0.32)),
        boarHelm: (L) => grp(at(box(0.64, 0.3, 0.62, 0xe9dfc9), 0, 0.24, 0), ...[0, 1, 2].map((r) => at(box(0.66, 0.05, 0.64, r % 2 ? 0xffffff : 0xd9ccb0), 0, 0.12 + r * 0.1, 0)), L.crest !== null ? at(box(0.1, 0.24, 0.5, L.crest), 0, 0.5, 0) : null),
        farmCap: () => grp(at(box(0.62, 0.22, 0.62, 0xa58360), 0, 0.3, 0), at(box(0.7, 0.04, 0.7, 0x8a6a4a), 0, 0.2, 0)),
        shellCrown: () => { const g = new T.Group(); for (let i = 0; i < 5; i++) g.add(at(rot(box(0.12, 0.2, 0.04, [0xffd6e8, 0xbfe9ff, 0xffffff][i % 3]), 0, 0, (i - 2) * 0.2), -0.24 + i * 0.12, 0.42, 0.29)); g.add(at(box(0.6, 0.06, 0.6, 0x7fe8ff), 0, 0.32, 0)); return g; },
        reeds: () => { const g = new T.Group(); for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU; g.add(rot(at(box(0.05, 0.4, 0.05, 0x5fcf7a), Math.sin(a) * 0.26, 0.48, Math.cos(a) * 0.26), Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3)); } return g; },
        moon: () => grp(at(rot(tor(0.14, 0.04, 0xf0f4ff, Math.PI, true), 0, 0, -Math.PI / 2), 0, 0.5, 0.2)),
        hood: (L) => grp(at(box(0.64, 0.2, 0.64, L.cape), 0, 0.3, 0), at(box(0.64, 0.6, 0.1, L.cape), 0, 0.02, -0.31), ...[-1, 1].map((s) => at(box(0.06, 0.5, 0.5, L.cape), s * 0.32, 0.05, 0))),
        none: () => null
    };

    /* ---------------- daftar tokoh khusus ---------------- */
    const FEMALE = new Set(['helen', 'hecuba', 'andromache', 'cassandra', 'penelope', 'circe', 'calypso', 'nausicaa', 'arete', 'clytemnestra', 'briseis', 'laodice', 'eurycleia', 'athena', 'hera', 'aphrodite', 'artemis', 'thetis', 'iris', 'eos', 'penthesilea', 'hippolyta', 'medusa', 'scylla', 'siren', 'harpy']);
    const ELDER = new Set(['nestor', 'priam', 'peleus', 'telamon', 'laertes', 'phoenix', 'mentor', 'tiresias', 'halitherses', 'antenor', 'calchas', 'aeolus', 'minos', 'alcinous', 'eetion', 'eumaeus', 'hecuba', 'eurycleia', 'zeus', 'poseidon', 'centaur', 'idomeneus']);
    const BEARDLESS = new Set(['achilles', 'patroclus', 'paris', 'telemachus', 'antilochus', 'neoptolemus', 'polydorus', 'lycaon', 'nireus', 'astyanax', 'apollo', 'hermes', 'eumelus', 'protesilaus', 'podarces', 'automedon', 'orestes', 'perseus', 'theseus', 'jason', 'meleager', 'dioscuri', 'amphimachus', 'askalaphus', 'thersander', 'aeneas', 'deiphobus', 'helenus', 'dolon', 'troilus', 'diores', 'glaucus', 'teucer', 'ajax_lesser']);

    /* Ciri khas per tokoh (menimpa aturan otomatis) */
    const LOOK = {
        achilles: { hair: 0xe8b84a, longHair: true, crest: 0x2a1a14, weapon: 'spear', emblem: 'star', metal: 0xe0b45a },
        patroclus: { hair: 0x7a4a24, crest: 0x2a1a14, weapon: 'spear', emblem: 'star', metal: 0xe0b45a },
        hector: { beardShort: true, helm: 'phrygian', crestFlow: true, crest: 0xd9342b, weapon: 'spear', emblem: 'lion' },
        paris: { helm: 'capFrigia', capColor: 0xc8342c, weapon: 'bow', shield: false, pelt: 0xe0b060, beard: false },
        aeneas: { helm: 'phrygian', crest: 0x5cb8ff, weapon: 'spear', emblem: 'ring' },
        odysseus: { helm: 'pilos', hair: 0x5a3416, beardColor: 0x5a3416, beardLen: 0.3, weapon: 'bow', shield: false, cape: 0x1c2d55 },
        menelaus: { hair: 0xc8642a, beardColor: 0xc8642a, beardLen: 0.22, weapon: 'spear', emblem: 'lion' },
        agamemnon: { crownOnHelm: true, weapon: 'scepter', emblem: 'lion', cape: 0x6a2a8a, beardLen: 0.3 },
        diomedes: { crest: 0xff7a1a, crestGlow: true, weapon: 'spear', emblem: 'bolt' },
        ajax_great: { scale: 1.35, weapon: 'spear', tower: true, crest: 0x2a1a14 },
        ajax_lesser: { armor: 0xf3ecdc, armorLine: 0xc9bfa8, weapon: 'spear', emblem: 'ring', helm: 'corinth' },
        teucer: { weapon: 'bow', shield: false, helm: 'corinth', crest: null },
        neoptolemus: { hair: 0xc83a1a, crest: 0xc83a1a, weapon: 'sword', emblem: 'star' },
        nestor: { robe: 0x3a5fb0, helm: 'none', weapon: 'cup', beardLen: 0.5 },
        priam: { robe: 0x6a2a8a, helm: 'crown', crownGem: 0xff4d6d, weapon: 'scepter', beardLen: 0.5 },
        helen: { hair: 0xf0c86a, longHair: true, robe: 0xffb3d9, helm: 'laurel', wreath: GOLD, weapon: 'none' },
        cassandra: { hair: 0x3b2414, longHair: true, robe: 0xf4f1ff, helm: 'laurel', wreath: 0x5fcf7a, weapon: 'staff', eye: 0x8fe8ff },
        hecuba: { robe: 0x6a2a8a, helm: 'crown', veil: 0xe8e0f0 },
        andromache: { robe: 0xffcf8a, veil: 0xfff3e0 },
        penelope: { robe: 0x2e5f9a, veil: 0xf3e6c8, weapon: 'spindle' },
        briseis: { robe: 0xff8fa3, veil: 0xffe0e8 },
        laodice: { robe: 0xffd6f5, helm: 'laurel', wreath: GOLD },
        clytemnestra: { robe: 0x8a1a2a, helm: 'crown', weapon: 'net' },
        eurycleia: { robe: 0x9a8a7a, veil: 0xdcd6cc, weapon: 'lamp' },
        nausicaa: { robe: 0xbfe9ff, helm: 'laurel', wreath: 0xff9cc8, hair: 0xe8b84a },
        arete: { robe: 0x2fb6c9, helm: 'crown' },
        alcinous: { robe: 0x2fb6c9, helm: 'crown', weapon: 'scepter', beardLen: 0.35 },
        circe: { robe: 0x7b3fc4, hair: 0x1a1210, eye: 0xd8a6ff, weapon: 'wand', left: 'cup' },
        calypso: { robe: 0x2fd2c0, hair: 0xe8b84a, weapon: 'spindle', helm: 'laurel', wreath: 0x5fcf7a },
        zeus: { scale: 1.18, robe: 0xf4f1ff, hair: 0xffffff, longHair: true, beardColor: 0xffffff, beardLen: 0.5, helm: 'laurel', cape: 0x5c7bff, weapon: 'bolt' },
        hera: { robe: 0x6a3fb5, helm: 'polos', weapon: 'scepter', cape: 0x2fb6c9 },
        athena: { robe: 0x6fa8ff, hair: 0x3b2414, longHair: true, helm: 'corinth', helmRaised: true, crest: 0x2f6fd8, crestTall: 0.5, weapon: 'spear', emblem: 'gorgon', aegis: true, owl: true },
        ares: { armor: 0x5a2a2a, armorLine: 0xff4d6d, crest: 0xff2a2a, crestTall: 0.55, weapon: 'spear', emblem: 'eye', beardColor: 0x1a1210, eye: 0xff4d6d },
        apollo: { robe: 0xffe9a8, hair: 0xf0c86a, longHair: true, helm: 'laurel', wreath: 0x5fcf7a, weapon: 'bow', left: 'lyre' },
        artemis: { tunicOnly: 0xb7e4c7, hair: 0x5a3416, longHair: true, helm: 'moon', weapon: 'bow', shield: false },
        aphrodite: { robe: 0xff9cc8, hair: 0xf0c86a, longHair: true, weapon: 'rose', helm: 'laurel', wreath: 0xff4d6d },
        poseidon: { scale: 1.12, robe: 0x2fb6c9, hair: 0x1f8c86, longHair: true, beardColor: 0x1f8c86, beardLen: 0.45, helm: 'crown', crownColor: 0xf2d27a, cape: 0x1d5fa8, weapon: 'trident' },
        hades: { robe: 0x2a2038, hair: 0x14101a, beardColor: 0x14101a, beardLen: 0.35, helm: 'crown', crownColor: 0x8a7aa8, cape: 0x14101a, weapon: 'bident', eye: 0xb68cff },
        hermes: { tunicOnly: 0xffd23f, helm: 'petasos', weapon: 'caduceus', ankleWings: true, shield: false },
        hephaestus: { tunicOnly: 0x8a5a3a, apron: true, beardColor: 0x2a1a10, beardLen: 0.3, weapon: 'hammer', helm: 'pilos', capColor: 0x5a3a24, limp: true },
        iris: { robe: 0xffffff, wings: 'rainbow', weapon: 'caduceus', hair: 0xe8b84a, longHair: true },
        eos: { robe: 0xffb3d9, wings: 0xffd6e8, hair: 0xff9f5a, longHair: true, helm: 'laurel', wreath: 0xff8f5a },
        thetis: { robe: 0x7fd8ff, hair: 0xd8f6ff, longHair: true, helm: 'shellCrown' },
        scamander: { robe: 0x2f9cd8, hair: 0x7fe8ff, longHair: true, beardColor: 0x7fe8ff, beardLen: 0.4, helm: 'reeds', skin: 0x9fd8e8 },
        heracles: { scale: 1.25, helm: 'lionPelt', weapon: 'club', shield: false, tunicOnly: 0xc98a3c, beardColor: 0x2a1a10, beardLen: 0.3 },
        perseus: { helm: 'petasos', ankleWings: true, weapon: 'harpe', emblem: 'gorgon', shieldFace: 0xe8eef5 },
        theseus: { weapon: 'sword', left: 'thread', shield: false, helm: 'none', hair: 0xe8b84a, cape: 0x2f6fd8 },
        jason: { oneSandal: true, pelt: 0xffd23f, weapon: 'spear', helm: 'none', hair: 0x5a3416, longHair: true },
        bellerophon: { weapon: 'spear', emblem: 'ring', crest: 0xffffff, wings: 0xffffff, wingsSmall: true },
        meleager: { weapon: 'spear', helm: 'none', pelt: 0x6b4428, hair: 0x5a3416 },
        tydeus: { scale: 0.85, weapon: 'spear', emblem: 'bolt' },
        peleus: { weapon: 'spear', beardLen: 0.35 },
        dioscuri: { helm: 'pilos', capColor: 0xf3e6c8, capStar: true, weapon: 'spear', shield: false, cape: 0x2f6fd8 },
        philoctetes: { weapon: 'bow', shield: false, bandage: true, helm: 'none', beardLen: 0.3 },
        machaon: { weapon: 'staff', left: 'bag', helm: 'none' },
        telemachus: { helm: 'none', weapon: 'spear', hair: 0x5a3416 },
        thersites: { helm: 'none', pointyHead: true, scale: 0.85, tunicOnly: 0x8a7a5a, weapon: 'none', hair: 0x6b5a4a },
        epeius: { helm: 'none', weapon: 'hammer', apron: true },
        eumaeus: { helm: 'farmCap', weapon: 'crook', tunicOnly: 0x8a6a4a },
        laertes: { helm: 'farmCap', weapon: 'spear', tunicOnly: 0x8a7a5a, gloves: true },
        mentor: { robe: 0x6a6f9a, weapon: 'staff' },
        tiresias: { robe: 0x3a3048, weapon: 'staff', blind: true, helm: 'hood', cape: 0x2a2038 },
        halitherses: { robe: 0x5a6f9a, weapon: 'staff' },
        calchas: { robe: 0xf4f1ff, helm: 'laurel', wreath: 0x5fcf7a, weapon: 'staff' },
        helenus: { robe: 0xf4f1ff, helm: 'laurel', wreath: 0x5fcf7a, weapon: 'bow' },
        palamedes: { robe: 0x5a8a6a, weapon: 'scroll', left: 'dice' },
        antenor: { robe: 0x8a5a3a, weapon: 'scroll' },
        phoenix: { robe: 0xb3342b, weapon: 'staff' },
        polydamas: { helm: 'phrygian', crest: 0x5cb8ff, weapon: 'spear', emblem: 'eye' },
        dolon: { helm: 'wolfHat', weapon: 'bow', shield: false },
        rhesus: { armor: 0xffe28a, cape: 0xffffff, crest: 0xffffff, helm: 'phrygian', weapon: 'spear', emblem: 'ring' },
        memnon: { skin: 0x6b4226, armor: 0xffcf4a, armorLine: 0xc98a2a, crest: 0xff9f5a, weapon: 'spear', emblem: 'star', emblemColor: 0xff9f5a },
        penthesilea: { hair: 0x2a1a10, longHair: true, helm: 'capFrigia', capColor: 0xb3342b, weapon: 'labrys', shieldShape: 'pelta' },
        hippolyta: { hair: 0x1a1210, longHair: true, helm: 'crown', weapon: 'spear', belt: GOLD, shieldShape: 'pelta' },
        sarpedon: { helm: 'phrygian', crest: GOLD, weapon: 'spear', emblem: 'bolt' },
        glaucus: { armor: 0xffcf4a, armorLine: 0xc98a2a, helm: 'phrygian', weapon: 'spear', emblem: 'ring' },
        asteropaios: { helm: 'phrygian', weapon: 'spear', left: 'spear', shield: false },
        pandarus: { helm: 'capFrigia', weapon: 'bow', shield: false },
        agenor: { helm: 'phrygian', weapon: 'spear', emblem: 'lion' },
        lycaon: { helm: 'none', weapon: 'sword', tunicOnly: 0xd9b07a },
        polydorus: { helm: 'none', weapon: 'spear', tunicOnly: 0xffd23f, belt: 0xe8eef5 },
        eetion: { helm: 'crown', weapon: 'spear', emblem: 'lion' },
        astyanax: { scale: 0.5, helm: 'none', hair: 0xe8b84a, weapon: 'none', tunicOnly: 0xffffff, baby: true },
        nireus: { hair: 0xf0c86a, helm: 'none', weapon: 'spear', shield: false },
        meriones: { helm: 'boarHelm', weapon: 'bow', shield: false },
        automedon: { helm: 'none', weapon: 'whip' },
        eumelus: { helm: 'none', weapon: 'whip' },
        antilochus: { weapon: 'spear', helm: 'corinth' },
        eurylochus: { helm: 'none', weapon: 'sword' },
        orestes: { helm: 'petasos', weapon: 'sword', shield: false },
        aeolus: { robe: 0xbfe9ff, weapon: 'bag', beardLen: 0.4, helm: 'crown' },
        minos: { robe: 0x2a3a8a, helm: 'crown', weapon: 'scepter', beardLen: 0.4 },
        cyclops: { special: 'cyclops', scale: 1.5, skin: 0xd8a06a, weapon: 'club', tunicOnly: 0xe9e0cf, helm: 'none', hair: 0x4a3020, shield: false },
        minotaur: { special: 'bull', armor: 0x6b3d24, armorLine: 0x4a2a18, tunic: 0xb3342b, weapon: 'labrys', helm: 'none', skin: 0x8a5a3c, shield: false },
        medusa: { special: 'snakes', skin: 0x8fd08a, eye: 0xffe14a, robe: 0x7b4fc4, helm: 'none', weapon: 'none', wings: 0x5fcf7a, wingsSmall: true },
        siren: { special: 'birdLegs', robe: 0xff9cc8, wings: 0xffd6e8, hair: 0x5a3416, longHair: true, weapon: 'lyre', helm: 'none' },
        harpy: { special: 'birdLegs', tunicOnly: 0x6b6f7a, wings: 0x5a5f78, hair: 0x3a3048, longHair: true, eye: 0xffd23f, weapon: 'none', helm: 'none' },
        scylla: { special: 'scylla', scale: 1.2, robe: 0x2f8ca8, skin: 0x9fd0e8, hair: 0x1f5c7a, longHair: true, helm: 'none', weapon: 'none' },
        centaur: { special: 'centaur', weapon: 'bow', helm: 'laurel', wreath: 0x5fcf7a, beardLen: 0.4, tunicOnly: 0x8a5a3a, shield: false },
        zhovaga: { tunic: 0x6e1a2c, hair: 0x141018, moustache: 0x141018, armor: 0x3a2e2a, armorLine: 0xc99a4a, chestEagle: 0xe0b25a, crest: 0x7a1530, crestTall: 0.5, metal: 0x5a4636, weapon: 'sword', emblem: 'lion', emblemColor: 0x7a5a2a, beard: false }
    };

    /** Menghasilkan "resep tampilan" dari data JSON + ciri khas di atas */
    function makeLook(h) {
        const id = h.id, x = hash(id), o = Object.assign({}, LOOK[id] || {}, h.lookOverride || {});
        const female = FEMALE.has(id), elder = ELDER.has(id);
        const civilian = h.kekuatan < 70 && !o.weapon;
        const kubu = h.kubu || '';
        const isGod = kubu === 'Dewa Olympus';
        const L = {
            id, female,
            skin: o.skin ?? SKINS[x % SKINS.length],
            hair: o.hair ?? (elder ? 0xdedede : HAIRS[(x >> 3) % HAIRS.length]),
            longHair: o.longHair ?? female,
            metal: o.metal ?? hex(h.warna_logam || '#d9a24e'),
            cape: o.cape ?? hex(h.warna_jubah || '#b3342b'),
            tunic: o.tunic ?? hex(h.warna_tema || '#ffd23f'),
            crest: o.crest !== undefined ? o.crest : hex(h.warna_jubah || '#b3342b'),
            eye: o.eye, scale: o.scale, bald: o.bald,
        };
        L.tunic2 = new T.Color(L.tunic).multiplyScalar(0.78).getHex();
        // jenggot
        if (o.beard === false || female || BEARDLESS.has(id)) L.beard = null;
        else if (o.beardColor || o.beardLen || elder) L.beard = { c: o.beardColor ?? (elder ? 0xeeeeee : L.hair), len: o.beardLen ?? (elder ? 0.4 : 0.22) };
        else if (o.beardShort || (x >> 7) % 3 === 0) L.beard = { c: L.hair, len: 0.12 };
        else L.beard = null;
        // pakaian
        if (o.robe !== undefined) L.robe = o.robe;
        else if (o.tunicOnly !== undefined) L.tunicOnly = o.tunicOnly;
        else if (isGod) L.robe = L.tunic;
        else if (civilian || female && !['penthesilea', 'hippolyta'].includes(id)) L.robe = L.tunic;
        L.armor = o.armor ?? (L.robe || L.tunicOnly ? null : L.metal);
        L.armorLine = o.armorLine ?? new T.Color(L.metal).multiplyScalar(0.62).getHex();
        // tutup kepala
        if (o.helm) L.helm = o.helm;
        else if (L.robe || L.tunicOnly) L.helm = isGod ? 'laurel' : (female ? (o.veil ? 'veil' : 'none') : 'none');
        else if (kubu === 'Troya & Sekutu') L.helm = 'phrygian';
        else L.helm = 'corinth';
        if (o.veil) { L.veil = o.veil; L.helmExtra = 'veil'; }
        // senjata & perisai
        let w = o.weapon;
        if (!w) {
            const s = (h.senjata || '').toLowerCase();
            w = /trisula/.test(s) ? 'trident' : /halilintar/.test(s) ? 'bolt' : /busur/.test(s) ? 'bow' : /kapak/.test(s) ? 'labrys' : /gada/.test(s) ? 'club' : /palu/.test(s) ? 'hammer'
                : /pedang/.test(s) ? 'sword' : /tombak/.test(s) ? 'spear' : /tongkat/.test(s) ? 'staff' : (L.robe || civilian ? 'none' : 'spear');
        }
        L.weapon = w;
        L.left = o.left;
        L.shield = o.shield ?? (!L.robe && !L.tunicOnly && ['spear', 'sword', 'labrys', 'harpe', 'scepter'].includes(w));
        L.emblem = o.emblem ?? ['star', 'lion', 'ring', 'eye', 'wave', 'bolt'][(x >> 5) % 6];
        L.emblemColor = o.emblemColor ?? L.cape;
        L.shieldFace = o.shieldFace ?? L.metal;
        Object.assign(L, {
            crestTall: o.crestTall, crestFlow: o.crestFlow, crestGlow: o.crestGlow, helmRaised: o.helmRaised, capColor: o.capColor, capStar: o.capStar,
            wreath: o.wreath, crownColor: o.crownColor, crownGem: o.crownGem, crownOnHelm: o.crownOnHelm, tower: o.tower, aegis: o.aegis, owl: o.owl,
            wings: o.wings, wingsSmall: o.wingsSmall, ankleWings: o.ankleWings, special: o.special, moustache: o.moustache, chestEagle: o.chestEagle,
            pelt: o.pelt, apron: o.apron, belt: o.belt, bandage: o.bandage, oneSandal: o.oneSandal, pointyHead: o.pointyHead, blind: o.blind,
            gloves: o.gloves, baby: o.baby, shieldShape: o.shieldShape, limp: o.limp
        });
        if (isGod && !L.cape) L.cape = hex(h.warna_jubah);
        L.hasCape = !(L.robe && !isGod && !['zeus', 'hera', 'poseidon', 'hades', 'tiresias', 'priam', 'agamemnon'].includes(id)) && !L.baby && !['scylla', 'siren', 'harpy', 'centaur'].includes(L.special) && !L.wings;
        if (o.cape) L.hasCape = true;
        return L;
    }

    /* =====================================================================
       Membangun tubuh dari "resep"
       ===================================================================== */
    function buildRig(L) {
        const P = { root: new T.Group(), body: new T.Group(), head: new T.Group(), armL: new T.Group(), armR: new T.Group(), legL: new T.Group(), legR: new T.Group(), cape: new T.Group(), extra: new T.Group() };
        P.root.add(P.body);
        const skin = L.skin;
        const robe = L.robe, tunicOnly = L.tunicOnly;

        // ---- kaki
        [[P.legL, -1], [P.legR, 1]].forEach(([g, s]) => {
            g.position.set(s * 0.15, 0.85, 0);
            if (L.special === 'birdLegs') {
                g.add(at(box(0.12, 0.7, 0.12, 0xe9b830), 0, -0.4, 0));
                g.add(at(box(0.26, 0.08, 0.34, 0xe9b830), 0, -0.82, 0.06));
            } else if (L.special === 'scylla') {
                for (let k = 0; k < 3; k++) g.add(rot(at(box(0.16, 0.8, 0.16, 0x2f8ca8), s * (0.05 + k * 0.08), -0.42, -0.15 + k * 0.15), 0, 0, s * (0.2 + k * 0.15)));
            } else {
                if (robe) g.add(at(box(0.24, 0.78, 0.26, robe), 0, -0.4, 0));
                else {
                    g.add(at(box(0.22, 0.78, 0.22, skin), 0, -0.4, 0));
                    if (!tunicOnly || L.id === 'heracles') g.add(at(box(0.25, 0.38, 0.25, L.metal), 0, -0.55, 0.01));
                }
                if (L.bandage && s < 0) g.add(at(box(0.26, 0.2, 0.26, 0xffffff), 0, -0.62, 0));
                const sandal = L.oneSandal && s > 0 ? skin : LEATHER;
                g.add(at(box(0.27, 0.12, 0.36, sandal), 0, -0.82, 0.05));
                if (L.ankleWings) [-1, 1].forEach((k) => g.add(at(rot(box(0.03, 0.12, 0.28, 0xffffff), k * 0.5, 0, 0), k * 0.15, -0.72, -0.1)));
            }
        });
        // ---- badan
        const B = P.body;
        if (L.special === 'centaur') {
            const horse = 0x8a5a3a;
            B.add(at(box(0.62, 0.6, 1.5, horse), 0, 1.0, -0.55));
            B.add(at(box(0.14, 0.5, 0.14, 0x5a3a24), 0, 1.15, -1.35));
            [[-0.2, -0.05], [0.2, -0.05], [-0.2, -1.1], [0.2, -1.1]].forEach(([px, pz]) => { B.add(at(box(0.16, 0.8, 0.16, horse), px, 0.4, pz)); B.add(at(box(0.18, 0.1, 0.2, 0x3a2a1a), px, 0.04, pz)); });
            P.legL.visible = P.legR.visible = false;
        }
        if (robe) {
            B.add(at(box(0.66, 1.15, 0.46, robe), 0, 1.15, 0));
            B.add(at(box(0.7, 0.1, 0.5, L.belt ?? GOLD), 0, 0.62, 0));
            B.add(at(box(0.68, 0.08, 0.48, L.belt ?? GOLD), 0, 1.5, 0));
        } else if (tunicOnly) {
            B.add(at(box(0.6, 0.72, 0.42, tunicOnly), 0, 1.35, 0));
            B.add(at(box(0.64, 0.34, 0.46, tunicOnly), 0, 0.84, 0));
            B.add(at(box(0.64, 0.08, 0.46, L.belt ?? LEATHER), 0, 1.02, 0));
        } else {
            B.add(at(box(0.62, 0.72, 0.42, L.armor), 0, 1.35, 0));
            B.add(at(box(0.5, 0.06, 0.02, L.armorLine), 0, 1.42, 0.22));
            B.add(at(box(0.06, 0.4, 0.02, L.armorLine), 0, 1.25, 0.22));
            for (let i = 0; i < 6; i++) B.add(at(box(0.11, 0.34, 0.46, i % 2 ? L.tunic : L.tunic2), -0.275 + i * 0.11, 0.84, 0));
            if (L.belt) B.add(at(box(0.64, 0.08, 0.46, L.belt), 0, 1.02, 0));
        }
        if (L.chestEagle) B.add(at(grp(box(0.1, 0.18, 0.02, L.chestEagle), at(rot(box(0.22, 0.07, 0.02, L.chestEagle), 0, 0, 0.3), -0.14, 0.05, 0), at(rot(box(0.22, 0.07, 0.02, L.chestEagle), 0, 0, -0.3), 0.14, 0.05, 0)), 0, 1.4, 0.225));
        if (L.apron) B.add(at(box(0.5, 0.8, 0.04, 0x5a3a24), 0, 1.05, 0.24));
        if (L.pelt) B.add(rot(at(box(0.66, 0.2, 0.46, L.pelt), 0, 1.5, 0), 0, 0, 0.5));
        if (L.aegis) { for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) B.add(at(box(0.16, 0.14, 0.05, (r + c) % 2 ? GOLD : 0xe9b830), -0.24 + c * 0.16, 1.56 - r * 0.13, 0.24)); B.add(at(box(0.16, 0.16, 0.03, 0x5fcf7a), 0, 1.36, 0.28)); }
        if (L.owl) { const ow = grp(box(0.26, 0.3, 0.24, 0xa58360), at(box(0.28, 0.2, 0.26, 0xa58360), 0, 0.24, 0), ...[-1, 1].map((s) => at(box(0.09, 0.09, 0.02, GOLD, true), s * 0.07, 0.26, 0.13)), at(box(0.05, 0.06, 0.04, 0xff9f1c), 0, 0.2, 0.14)); B.add(at(ow, -0.42, 1.95, 0)); }
        if (L.wings) {
            const wc = L.wings === 'rainbow' ? [0xff4d6d, 0xff9f1c, 0xffd23f, 0x2ee59d, 0x4cc9f0, 0xb14dff] : [L.wings];
            const ws = L.wingsSmall ? 0.6 : 1;
            [-1, 1].forEach((s) => { for (let k = 0; k < 4; k++) P.cape.add(rot(at(box(0.05, 0.22, 0.9 * ws - k * 0.14, wc[k % wc.length]), s * (0.25 + k * 0.05), -0.1 - k * 0.2, -0.05), 0, s * 0.9, s * 0.35)); });
        }
        // ---- lengan
        [[P.armL, -1], [P.armR, 1]].forEach(([g, s]) => {
            g.position.set(s * 0.42, 1.66, 0);
            const sleeve = robe && !['zeus', 'poseidon', 'apollo'].includes(L.id) ? robe : skin;
            g.add(at(box(0.2, 0.62, 0.22, sleeve), 0, -0.3, 0));
            g.add(at(box(0.22, 0.2, 0.24, robe ? (L.belt ?? GOLD) : (tunicOnly ? LEATHER : L.metal)), 0, -0.48, 0));
            g.add(at(box(0.18, 0.16, 0.18, L.gloves ? 0x6b4428 : skin), 0, -0.68, 0));
        });
        // ---- kepala
        const H = P.head;
        H.position.set(0, 2.05, 0);
        if (L.special === 'bull') {
            H.add(box(0.62, 0.62, 0.6, 0x6b3d24));
            H.add(at(box(0.42, 0.3, 0.26, 0x8a5a3c), 0, -0.14, 0.38));
            [-1, 1].forEach((s) => {
                H.add(at(box(0.06, 0.06, 0.03, INK), s * 0.1, -0.12, 0.52));
                H.add(at(box(0.09, 0.1, 0.04, 0xff3d2e, true), s * 0.17, 0.1, 0.31));
                H.add(rot(at(box(0.34, 0.1, 0.1, 0xf3ead7), s * 0.44, 0.3, 0), 0, 0, s * 0.5));
                H.add(rot(at(box(0.1, 0.24, 0.1, 0xf3ead7), s * 0.6, 0.48, 0), 0, 0, s * -0.2));
            });
            H.add(at(tor(0.08, 0.025, GOLD), 0, -0.24, 0.52));
        } else {
            const headW = L.baby ? 0.7 : 0.56;
            H.add(box(headW, L.pointyHead ? 0.5 : 0.56, 0.54, skin));
            if (L.pointyHead) H.add(at(box(0.3, 0.22, 0.3, skin), 0, 0.34, -0.02));
            if (L.special === 'cyclops') {
                H.add(at(box(0.26, 0.2, 0.04, 0xffffff), 0, 0.06, 0.28));
                H.add(at(box(0.12, 0.12, 0.05, INK), 0, 0.06, 0.29));
                H.add(at(box(0.36, 0.06, 0.04, INK), 0, 0.2, 0.28));
                H.add(at(box(0.3, 0.05, 0.04, 0xffffff), 0, -0.16, 0.28));
            } else {
                [-1, 1].forEach((s) => {
                    const ec = L.blind ? 0xe8eef5 : (L.eye ?? INK);
                    H.add(at(box(0.09, 0.11, 0.04, ec, !!L.eye), s * 0.12, 0.04, 0.28));
                    H.add(at(box(0.14, 0.04, 0.04, L.beard ? L.beard.c : (L.hair ?? 0x3a2516)), s * 0.12, 0.15, 0.28));
                    if (L.female || L.baby) H.add(at(box(0.08, 0.05, 0.02, 0xff8fab), s * 0.2, -0.08, 0.28));
                });
                H.add(at(box(0.14, 0.035, 0.04, 0x8a3a3a), 0, -0.13, 0.28));
            }
            const showHair = !['lionPelt', 'wolfHat', 'veil', 'hood'].includes(L.helm) && !(L.helm === 'corinth' && !L.helmRaised && !L.longHair) && !L.bald;
            if (L.hair && showHair && !L.pointyHead) {
                H.add(at(box(0.6, 0.14, 0.58, L.hair), 0, 0.31, 0));
                H.add(at(box(0.6, L.longHair ? 0.72 : 0.4, 0.14, L.hair), 0, L.longHair ? -0.08 : 0.1, -0.27));
                [-1, 1].forEach((s) => H.add(at(box(0.06, L.longHair ? 0.6 : 0.3, 0.42, L.hair), s * 0.3, L.longHair ? -0.02 : 0.12, -0.05)));
            } else if (L.pointyHead) H.add(at(box(0.2, 0.06, 0.2, L.hair), 0, 0.46, 0));
            if (L.beard) {
                const len = L.beard.len;
                H.add(at(box(0.58, len, 0.12, L.beard.c), 0, -0.2 - len / 2 + 0.06, 0.25));
                H.add(at(box(0.18, 0.05, 0.05, L.beard.c), 0, -0.07, 0.29));
                [-1, 1].forEach((s) => H.add(at(box(0.08, 0.36, 0.3, L.beard.c), s * 0.27, -0.12, 0.12)));
            }
            if (L.moustache) { H.add(at(box(0.24, 0.05, 0.04, L.moustache), 0, -0.09, 0.29)); H.add(at(box(0.08, 0.1, 0.04, L.moustache), 0, -0.22, 0.29)); }
            if (L.special === 'snakes') {
                for (let i = 0; i < 11; i++) {
                    const a = (i / 11) * Math.PI * 1.6 - Math.PI * 0.8 + Math.PI;
                    const sn = grp(at(box(0.08, 0.36, 0.08, 0x3fa34d), 0, 0.18, 0), at(box(0.11, 0.1, 0.14, 0x2e8a3c), 0, 0.38, 0.03));
                    sn.position.set(Math.sin(a) * 0.26, 0.28, Math.cos(a) * 0.26); sn.rotation.set(Math.cos(a) * 0.6, 0, -Math.sin(a) * 0.6);
                    H.add(sn);
                }
            }
        }
        const hg = HEADGEAR[L.helm] ? HEADGEAR[L.helm](L) : null;
        if (hg) H.add(hg);
        if (L.helmExtra && L.helmExtra !== L.helm) { const v = HEADGEAR[L.helmExtra](L); if (v) H.add(v); }
        if (L.crownOnHelm) H.add(at(HEADGEAR.crown(L), 0, 0.12, 0));
        if (L.special === 'scylla') { // kepala-kepala anjing laut di pinggang
            for (let k = 0; k < 3; k++) { const a = -0.8 + k * 0.8; B.add(rot(at(grp(box(0.2, 0.18, 0.28, 0x2f6f8a), at(box(0.05, 0.05, 0.02, 0xffe14a, true), 0.05, 0.04, 0.15)), Math.sin(a) * 0.5, 0.75, Math.cos(a) * 0.4), 0, a, 0)); }
        }
        // ---- jubah
        P.cape.position.set(0, 1.7, -0.24);
        if (L.hasCape) P.cape.add(at(box(0.7, 1.35, 0.05, L.cape), 0, -0.66, 0));
        if (L.special === 'centaur') { P.cape.clear(); }
        // ---- senjata
        const wR = ITEMS[L.weapon] ? ITEMS[L.weapon]() : null;
        if (wR) P.armR.add(at(wR, 0, -0.68, 0.06));
        if (L.tower) P.armL.add(at(towerShield(L.metal), -0.18, -0.35, 0.12));
        else if (L.shield) {
            const sh = L.shieldShape === 'pelta'
                ? grp(box(0.06, 0.6, 0.7, L.cape), at(box(0.06, 0.2, 0.3, L.metal), 0, 0.3, 0))
                : shield(L.shieldFace, new T.Color(L.metal).multiplyScalar(0.7).getHex(), L.emblem, L.emblemColor);
            P.armL.add(at(sh, -0.16, -0.42, 0.1));
        } else if (L.left && ITEMS[L.left]) P.armL.add(at(ITEMS[L.left](), 0, -0.68, 0.06));
        P.body.add(P.legL, P.legR, P.armL, P.armR, P.head, P.cape, P.extra);
        P.root.userData.scale = L.scale ?? 1;
        return P;
    }

    /* Gabungkan semua balok di bawah satu sendi menjadi 1-2 mesh (warna per-vertex) */
    const MAT = { solid: null, glow: null };
    function mats() {
        if (!MAT.solid) {
            MAT.solid = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0.05, flatShading: true });
            MAT.glow = new T.MeshBasicMaterial({ vertexColors: true });
        }
        return MAT;
    }
    function bake(pivot, stopAt) {
        const solid = [], glow = [];
        const inv = new T.Matrix4().copy(pivot.matrixWorld).invert();
        const rel = new T.Matrix4();
        const col = new T.Color();
        const visit = (o) => {
            for (const ch of [...o.children]) {
                if (stopAt.has(ch)) continue;
                if (ch.isMesh && ch.userData.c !== undefined) {
                    rel.multiplyMatrices(inv, ch.matrixWorld);
                    let g = ch.geometry.index ? ch.geometry.toNonIndexed() : ch.geometry.clone();
                    g.deleteAttribute('uv');
                    g.applyMatrix4(rel);
                    col.setHex(ch.userData.c);
                    const n = g.attributes.position.count, arr = new Float32Array(n * 3);
                    for (let i = 0; i < n; i++) { arr[i * 3] = col.r; arr[i * 3 + 1] = col.g; arr[i * 3 + 2] = col.b; }
                    g.setAttribute('color', new T.BufferAttribute(arr, 3));
                    (ch.userData.glow ? glow : solid).push(g);
                }
                visit(ch);
            }
        };
        visit(pivot);
        // hapus kerangka sementara (selain sendi lain)
        for (const ch of [...pivot.children]) if (!stopAt.has(ch)) pivot.remove(ch);
        const M = mats();
        const out = [];
        if (solid.length) { const m = new T.Mesh(T.BufferGeometryUtils.mergeGeometries(solid), M.solid); out.push(m); }
        if (glow.length) { const m = new T.Mesh(T.BufferGeometryUtils.mergeGeometries(glow), M.glow); out.push(m); }
        solid.concat(glow).forEach((g) => g.dispose && g.dispose());
        out.forEach((m) => { pivot.add(m); });
        return out;
    }

    /* =====================================================================
       BlockHero — rig + animasi prosedural
       Nama animasi: Idle, Idle2, Run, Attack, Attack2, Kick, Hit, Block, Death, PowerUp, Jump, Cast
       ===================================================================== */
    const DUR = { Walk: 0, Attack: 0.75, Attack2: 1.1, Kick: 0.5, Hit: 0.45, Block: 0.6, Death: 0.9, PowerUp: 1.1, Jump: 0.6, Cast: 1.0 };
    class BlockHero {
        constructor(hero, opts = {}) {
            this.hero = hero;
            this.look = makeLook(hero);
            const P = buildRig(this.look);
            P.root.updateMatrixWorld(true);
            const pivots = new Set([P.body, P.head, P.armL, P.armR, P.legL, P.legR, P.cape, P.extra]);
            this.meshes = [];
            for (const pv of [P.body, P.head, P.armL, P.armR, P.legL, P.legR, P.cape]) this.meshes.push(...bake(pv, pivots));
            this.meshes.forEach((m) => { m.castShadow = !!opts.shadows; m.receiveShadow = false; });
            this.P = P;
            this.root = new T.Group();
            this.inner = P.root;
            this.root.add(P.root);
            this.baseScale = (this.look.scale ?? 1) * 0.78;
            P.root.scale.setScalar(this.baseScale);
            this.anim = 'Idle'; this.t = Math.random() * 10; this.clock = 0; this.hold = false;
            this.phase = Math.random() * TAU;
            this.rest = { headY: P.head.position.y };
        }
        setHero() { /* kompatibel dengan API lama */ }
        play(name, { loop = true, timeScale = 1, clamp = false } = {}) {
            this.anim = name; this.t = 0; this.ts = timeScale; this.loop = loop; this.hold = clamp;
            return (DUR[name] || 0) / timeScale;
        }
        update(dt) {
            const P = this.P, a = this.anim;
            this.t += dt * (this.ts || 1); this.clock += dt;
            const t = this.t, k = DUR[a] ? Math.min(1, t / DUR[a]) : 0;
            const ph = this.clock * 2.2 + this.phase;
            // pose dasar
            let bodyY = 0, bodyRX = 0, bodyRZ = 0, rootRY = 0, lift = 0;
            let aL = Math.sin(ph) * 0.08, aR = -Math.sin(ph) * 0.08 - 0.18, aLz = 0, aRz = 0, lL = 0, lR = 0, headRX = 0, headRY = Math.sin(this.clock * 0.7 + this.phase) * 0.15;
            if (this.look.limp) bodyRZ = Math.sin(ph) * 0.03;
            if (a === 'Idle' || a === 'Idle2') bodyY = Math.abs(Math.sin(ph)) * 0.03;
            else if (a === 'Fly') {
                const f = Math.sin(this.clock * 3);
                bodyRX = 0.5; aL = -0.25; aR = -0.25; aLz = -1.25 + f * 0.18; aRz = 1.25 - f * 0.18; lL = 0.25; lR = 0.4; bodyY = f * 0.05;
            } else if (a === 'Walk') {
                const r = t * 7;
                lL = Math.sin(r) * 0.55; lR = -lL; aL = -lL * 0.6; aR = lL * 0.6 - 0.18; bodyY = Math.abs(Math.cos(r)) * 0.04;
            } else if (a === 'Run') {
                const r = t * 12;
                lL = Math.sin(r) * 0.9; lR = -lL; aL = -lL * 0.8; aR = lL * 0.8 - 0.2; bodyY = Math.abs(Math.cos(r)) * 0.08; bodyRX = 0.15;
            } else if (a === 'Attack' || a === 'Attack2') {
                // ayun ke belakang, lalu tebas ke depan
                const wind = Math.min(1, k / 0.45), strike = Math.max(0, (k - 0.45) / 0.25);
                aR = -0.2 - 2.6 * wind + 2.0 * Math.min(1, strike);
                bodyRX = -0.15 * wind + 0.35 * Math.min(1, strike);
                rootRY = a === 'Attack2' ? Math.min(1, strike) * TAU : 0;
                lL = 0.35 * Math.min(1, strike); lR = -0.25 * Math.min(1, strike);
                if (a === 'Attack2') lift = Math.sin(Math.min(1, k * 1.2) * Math.PI) * 0.5;
            } else if (a === 'Kick') {
                const s = Math.sin(Math.min(1, k) * Math.PI);
                lR = -1.5 * s; bodyRX = -0.25 * s; aL = 0.5 * s; aR = -0.6 * s;
            } else if (a === 'Hit') {
                const s = Math.sin(Math.min(1, k) * Math.PI);
                bodyRX = -0.45 * s; headRX = -0.3 * s; aL = 0.6 * s; aR = 0.6 * s;
            } else if (a === 'Block') {
                const s = this.hold ? Math.min(1, k * 2) : Math.sin(Math.min(1, k) * Math.PI);
                aL = -1.45 * s; aLz = -0.5 * s; bodyRX = 0.1 * s; lL = 0.2 * s;
            } else if (a === 'Death') {
                const e = 1 - Math.pow(1 - k, 3);
                bodyRX = -1.45 * e; lift = 0.1 * Math.sin(k * Math.PI); aL = -1.2 * e; aR = -1.4 * e; headRX = -0.3 * e;
            } else if (a === 'PowerUp' || a === 'Cast') {
                const up = Math.min(1, k * 2.2);
                aL = -2.8 * up; aR = -2.8 * up; aLz = -0.3 * up; aRz = 0.3 * up;
                lift = Math.sin(Math.min(1, k) * Math.PI) * (a === 'PowerUp' ? 0.4 : 0.15);
                rootRY = a === 'PowerUp' ? k * TAU : 0;
            } else if (a === 'Jump') {
                const s = Math.sin(Math.min(1, k) * Math.PI);
                lift = s * 0.8; lL = -0.5 * s; lR = 0.4 * s; aL = -1 * s; aR = -1 * s;
            }
            if (DUR[a] && k >= 1 && !this.hold && this.loop === false) { this.anim = 'Idle'; }
            P.body.position.y = bodyY + lift;
            P.body.rotation.set(bodyRX, rootRY, bodyRZ);
            P.armL.rotation.set(aL, 0, aLz); P.armR.rotation.set(aR, 0, aRz);
            P.legL.rotation.x = lL; P.legR.rotation.x = lR;
            P.head.rotation.set(headRX, headRY, 0);
            P.cape.rotation.x = 0.08 + Math.sin(this.clock * 1.8 + this.phase) * 0.06 + (a === 'Run' ? 0.5 : a === 'Fly' ? 1.1 + Math.sin(this.clock * 6) * 0.15 : 0);
        }
        dispose() { this.meshes.forEach((m) => m.geometry.dispose()); }
    }

    window.BlockHero = BlockHero;
    window.makeHeroLook = makeLook;
})();
