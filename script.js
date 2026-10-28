/* =====================================================================
   HOMERIC 3D: LEGENDS OF TROY — "Kapsul Waktu Digital"  (v2: dunia terbuka)
   ---------------------------------------------------------------------
   100% offline: buka langsung index.html (file:///). Tidak ada fetch().
   - Three.js + OrbitControls + BufferGeometryUtils   → vendor/three.bundle.js (window.THREE)
   - Karakter kotak-kotak + animasi prosedural        → blockhero.js (BlockHero)
   - Potret 114 tokoh (data URI)                      → portraits.js (HERO_PORTRAITS)
   - 120 data karakter                                → data.js (HEROES_DATA, DUELS_DATA, ELEMEN_DATA)
   Kelas: AudioSynth, Accounts, DataManager, Terrain, OpenWorld, BattleEngine, EndingEngine, UI, Game
   ===================================================================== */
'use strict';

const T = window.THREE;
const ASSET_DIR = '../assets/';
const ACC_KEY = 'homeric3d_accounts_v2';
const LAST_KEY = 'homeric3d_last_user';
const SECRET_ID = 'zhovaga';
const ISLAND_R = 300;
const SPAWN = { x: 0, z: 64 };
const STANCE_BEATS = { Aggressive: 'Technical', Technical: 'Evasive', Evasive: 'Aggressive' };
const STANCE_ICON = { Aggressive: '🗡️', Technical: '🛡️', Evasive: '💨' };
const STANCE_NAME = { Aggressive: 'Agresif', Technical: 'Teknis', Evasive: 'Lincah' };
const KUBU_ORDER = ['Dewa Olympus', 'Legenda Pra-Troya', 'Akhaia (Yunani)', 'Troya & Sekutu', 'Dunia Odyssey', 'Makhluk Mitos', 'Ordo Zhovaga'];
const KUBU_COLOR = {
    'Dewa Olympus': '#ffe066', 'Legenda Pra-Troya': '#b892ff', 'Akhaia (Yunani)': '#5cb8ff',
    'Troya & Sekutu': '#ff9f5a', 'Dunia Odyssey': '#4ee6d6', 'Makhluk Mitos': '#7dff9e', 'Ordo Zhovaga': '#ff5fd2'
};
// Wilayah pulau. x/z = pusat, r = radius tempat tokohnya berkeliaran
const REGIONS = {
    'Dewa Olympus':      { name: 'Gunung Olympus',     sub: 'Rumah para dewa',        x: 0,    z: -185, r: 55 },
    'Legenda Pra-Troya': { name: 'Padang Para Legenda', sub: 'Pahlawan generasi lama', x: -175, z: -100, r: 55 },
    'Akhaia (Yunani)':   { name: 'Kemah Yunani',       sub: 'Pantai seribu kapal',    x: -185, z: 75,   r: 60 },
    'Troya & Sekutu':    { name: 'Kota Troya',         sub: 'Ilium bertembok tinggi', x: 175,  z: 40,   r: 58 },
    'Dunia Odyssey':     { name: 'Pesisir Odyssey',    sub: 'Pulau-pulau pengembaraan', x: 100, z: 195, r: 45 },
    'Makhluk Mitos':     { name: 'Alam Liar Mitos',    sub: 'Hati-hati melangkah…',   x: -95,  z: 190,  r: 52 }
};
const TROY = { x: 175, z: 40, wallR: 34 };
const SKILL_COST = [35, 20, 10, 0];
const SKILL_ICON = ['⚔️', '⚡', '🛡️', '✨'];
const PATRONS = {
    Petir: { god: 'Zeus', icon: '⚡', label: 'Zeus · Petir' },
    Api:   { god: 'Ares', icon: '🔥', label: 'Ares · Api' },
    Air:   { god: 'Poseidon', icon: '🌊', label: 'Poseidon · Air' },
    Bumi:  { god: 'Hades', icon: '⛰️', label: 'Hades · Bumi' }
};
const LOOK_OPTS = {
    skin: ['#f5cfa8', '#f2c094', '#e8b07e', '#c98d5c', '#8a5a3c'],
    hair: ['#1a1210', '#3b2414', '#7a4a24', '#e8b84a', '#c8642a', '#dedede'],
    cape: ['#b3342b', '#2f6fd8', '#2fb67a', '#7b3fc4', '#ff8f3a', '#ffd23f', '#ff5fa2', '#1d1530'],
    hairstyle: [['short', 'Pendek'], ['long', 'Panjang'], ['beard', 'Berjenggot']],
    helm: [['corinth', 'Helm Korintus'], ['none', 'Tanpa helm'], ['pilos', 'Topi pilos'], ['laurel', 'Mahkota daun']]
};
const ARENA_THEMES = {
    arena:   { sky: 'radial-gradient(120% 100% at 50% 100%, #ffd59a 0%, #ff8fa3 40%, #7a4fc4 75%, #2a1660 100%)', light: '#fff1d6', rim: '#ff9f5a', particle: '#ffe9a8' },
    sunset:  { sky: 'radial-gradient(120% 100% at 50% 100%, #ffcf5a 0%, #ff7a3d 35%, #b23a6b 70%, #2b0f3f 100%)', light: '#ffb347', rim: '#ff3d2e', particle: '#ffcc33' },
    olympus: { sky: 'radial-gradient(120% 100% at 50% 100%, #ffffff 0%, #d7f0ff 35%, #7fb8ff 70%, #3a4fb0 100%)', light: '#ffffff', rim: '#ffd23f', particle: '#fff6b0' },
    blood:   { sky: 'radial-gradient(120% 100% at 50% 100%, #ff6b6b 0%, #b3002d 40%, #4a0020 75%, #12000a 100%)', light: '#ff8080', rim: '#3fa9ff', particle: '#ff2a55' },
    cave:    { sky: 'radial-gradient(120% 100% at 50% 100%, #8a5a3c 0%, #3d2a24 45%, #17110f 100%)', light: '#ffb070', rim: '#ff7b00', particle: '#ffae42' },
    dawn:    { sky: 'radial-gradient(120% 100% at 50% 100%, #ffd1e8 0%, #ff9ccf 35%, #ff6a3d 65%, #4a1d6b 100%)', light: '#ffd6f0', rim: '#ffcc00', particle: '#ffc6e6' },
    storm:   { sky: 'radial-gradient(120% 100% at 50% 100%, #9aa7c7 0%, #4b5578 40%, #1e2340 75%, #0b0c18 100%)', light: '#cfe0ff', rim: '#ff5fa2', particle: '#e0e8ff' },
    river:   { sky: 'radial-gradient(120% 100% at 50% 100%, #9ff3ff 0%, #2fb6ff 40%, #1d4fa8 75%, #0c1a45 100%)', light: '#c9f6ff', rim: '#ff6a00', particle: '#7fe8ff' },
    golden:  { sky: 'radial-gradient(120% 100% at 50% 100%, #fff4c2 0%, #ffd56b 40%, #c7892e 75%, #4a2c0b 100%)', light: '#fff0b3', rim: '#ffd23f', particle: '#fff1a0' },
    stone:   { sky: 'radial-gradient(120% 100% at 50% 100%, #b6ffd9 0%, #3fbf8f 40%, #1d4d48 75%, #0b1b1a 100%)', light: '#d9ffe9', rim: '#00ff9d', particle: '#a6ffd6' },
    sea:     { sky: 'radial-gradient(120% 100% at 50% 100%, #b9fbff 0%, #47d0ff 40%, #6a5cff 75%, #241a66 100%)', light: '#e0fbff', rim: '#ff5fd2', particle: '#ff9cf0' },
    garden:  { sky: 'radial-gradient(120% 100% at 50% 100%, #f1d9ff 0%, #c08bff 40%, #6a3fb5 75%, #22104a 100%)', light: '#f5e6ff', rim: '#ffffff', particle: '#e6c6ff' },
    night:   { sky: 'radial-gradient(120% 100% at 50% 100%, #3a3f7a 0%, #1a1d45 45%, #090a1f 100%)', light: '#ffcf8a', rim: '#7aa2ff', particle: '#ffe6a0' },
    galaxy:  { sky: 'radial-gradient(120% 100% at 50% 50%, #ff7ad9 0%, #7a4dff 30%, #1d0f55 65%, #050214 100%)', light: '#ffffff', rim: '#ff5fd2', particle: '#9ffcff' },
    rival:   { sky: 'radial-gradient(120% 100% at 50% 100%, #ffb38a 0%, #ff3d6e 40%, #5a1a8a 75%, #160a35 100%)', light: '#ffe0c0', rim: '#ff2a55', particle: '#ffb3c6' }
};

const $ = (id) => document.getElementById(id);
const at3 = (o, x, y, z) => { o.position.set(x, y, z); return o; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const rand = (a, b) => a + Math.random() * (b - a);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ELEMENT_ICON = (el) => ({ Petir: '⚡', Api: '🔥', Air: '🌊', Bumi: '⛰️' }[el] || '✦');
const angDiff = (a, b) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };

/* ---------------------------------------------------------------------
   Tween & waktu permainan
   --------------------------------------------------------------------- */
const Tweens = {
    list: [],
    add(dur, fn) { return new Promise((resolve) => this.list.push({ t: 0, dur: Math.max(dur, 0.0001), fn, resolve })); },
    wait(sec) { return this.add(sec, null); },
    update(dt) {
        for (let i = this.list.length - 1; i >= 0; i--) {
            const tw = this.list[i];
            tw.t += dt;
            const k = Math.min(1, tw.t / tw.dur);
            if (tw.fn) tw.fn(k);
            if (k >= 1) { this.list.splice(i, 1); tw.resolve(); }
        }
    }
};

/* =====================================================================
   AudioSynth — semua suara dari Web Audio API (tanpa mp3/wav)
   ===================================================================== */
class AudioSynth {
    constructor() { this.ctx = null; this.muted = false; this._last = {}; }
    init() {
        if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.55;
        this.master.connect(this.ctx.destination);
        const len = this.ctx.sampleRate * 1.2;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    setMuted(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 0.55; }
    _ok(key, gap = 0.05) {
        if (!this.ctx || this.muted) return false;
        const now = this.ctx.currentTime;
        if (key && this._last[key] && now - this._last[key] < gap) return false;
        if (key) this._last[key] = now;
        return true;
    }
    tone(freq, dur, { type = 'sine', vol = 0.2, to = null, delay = 0, attack = 0.005 } = {}) {
        const c = this.ctx, t = c.currentTime + delay;
        const o = c.createOscillator(), g = c.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, t);
        if (to) o.frequency.exponentialRampToValueAtTime(Math.max(to, 20), t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(this.master);
        o.start(t); o.stop(t + dur + 0.05);
    }
    noise(dur, { type = 'lowpass', freq = 1200, to = null, q = 1, vol = 0.3, delay = 0 } = {}) {
        const c = this.ctx, t = c.currentTime + delay;
        const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
        s.buffer = this.noiseBuf;
        f.type = type; f.Q.value = q;
        f.frequency.setValueAtTime(freq, t);
        if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(f).connect(g).connect(this.master);
        s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
    }
    beep() { if (!this._ok('beep', 0.04)) return; this.tone(880, 0.07, { type: 'square', vol: 0.07 }); this.tone(1320, 0.07, { type: 'square', vol: 0.05, delay: 0.06 }); }
    step() { if (!this._ok('step', 0.12)) return; this.noise(0.05, { type: 'lowpass', freq: 500, vol: 0.12 }); }
    swoosh() { if (!this._ok('swoosh', 0.2)) return; this.noise(0.32, { type: 'bandpass', freq: 500, to: 2600, q: 2.5, vol: 0.32 }); this.tone(320, 0.22, { to: 760, vol: 0.08 }); }
    boop() { if (!this._ok('boop', 0.15)) return; this.tone(520, 0.16, { type: 'sine', to: 260, vol: 0.14 }); }
    crunch() {
        if (!this._ok('crunch', 0.05)) return;
        this.noise(0.16, { type: 'lowpass', freq: 1800, to: 300, vol: 0.55 });
        this.noise(0.05, { type: 'highpass', freq: 3000, vol: 0.25 });
        this.tone(140, 0.22, { type: 'triangle', to: 45, vol: 0.45 });
        this.noise(0.09, { type: 'bandpass', freq: 900, q: 6, vol: 0.3, delay: 0.035 });
    }
    clang() { if (!this._ok('clang', 0.05)) return; this.tone(1250, 0.35, { type: 'square', vol: 0.06 }); this.tone(1870, 0.28, { type: 'triangle', vol: 0.07 }); this.noise(0.06, { type: 'highpass', freq: 4000, vol: 0.2 }); }
    whiff() { if (!this._ok('whiff', 0.1)) return; this.noise(0.22, { type: 'bandpass', freq: 2400, to: 700, q: 3, vol: 0.25 }); }
    heal() { if (!this._ok('heal', 0.2)) return; [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.35, { vol: 0.1, delay: i * 0.07 })); }
    power() { if (!this._ok('power', 0.2)) return; this.tone(180, 0.8, { type: 'sawtooth', to: 720, vol: 0.08 }); this.noise(0.8, { type: 'bandpass', freq: 300, to: 3000, q: 1.5, vol: 0.15 }); }
    alarm() { if (!this._ok('alarm', 1.5)) return; [660, 880, 660, 880].forEach((f, i) => this.tone(f, 0.12, { type: 'square', vol: 0.07, delay: i * 0.13 })); }
    ultimate() {
        if (!this._ok('ult', 0.5)) return;
        this.tone(70, 1.4, { type: 'sawtooth', to: 35, vol: 0.3 });
        this.noise(1.3, { type: 'lowpass', freq: 3000, to: 120, vol: 0.6 });
        [392, 523, 659].forEach((f, i) => this.tone(f, 0.9, { type: 'square', vol: 0.05, delay: 0.1 + i * 0.05 }));
    }
    fanfare() { if (!this._ok('fan', 1)) return; [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, i > 3 ? 0.5 : 0.18, { type: 'square', vol: 0.07, delay: i * 0.13 })); }
    meet() { if (!this._ok('meet', 0.6)) return; [659, 784, 988, 1319].forEach((f, i) => this.tone(f, 0.3, { type: 'triangle', vol: 0.09, delay: i * 0.09 })); }
    defeat() { if (!this._ok('def', 1)) return; [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.4, { type: 'triangle', vol: 0.12, delay: i * 0.2 })); }
    thunder() { if (!this._ok('thunder', 0.5)) return; this.noise(1.8, { type: 'lowpass', freq: 900, to: 60, vol: 0.7 }); this.noise(0.15, { type: 'highpass', freq: 2000, vol: 0.4 }); }
    chime() { if (!this._ok('chime', 0.5)) return; [784, 988, 1175, 1568, 1976].forEach((f, i) => this.tone(f, 1.6, { vol: 0.07, delay: i * 0.18 })); }
}

/* =====================================================================
   Accounts — daftar/masuk sederhana, disimpan di browser (localStorage)
   Username unik (tidak membedakan huruf besar/kecil). Sandi disimpan dalam bentuk hash.
   ===================================================================== */
const Accounts = {
    _mem: null,
    all() {
        if (this._mem) return this._mem;
        try { this._mem = JSON.parse(localStorage.getItem(ACC_KEY) || '{}'); } catch (e) { this._mem = {}; }
        return this._mem;
    },
    persist() { try { localStorage.setItem(ACC_KEY, JSON.stringify(this._mem)); return true; } catch (e) { return false; } },
    key(u) { return String(u || '').trim().toLowerCase(); },
    hash(user, pass) {
        // FNV-1a ganda dengan "garam" username — cukup untuk akun lokal keluarga, bukan untuk data rahasia
        const s = 'homeric::' + this.key(user) + '::' + pass;
        let h1 = 0x811c9dc5, h2 = 0x01000193;
        for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619); h2 = Math.imul(h2 ^ c, 2246822519); }
        return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
    },
    validName(u) { return /^[a-zA-Z0-9_.]{3,20}$/.test(String(u || '').trim()); },
    register(user, pass) {
        const k = this.key(user), all = this.all();
        if (!this.validName(user)) return { ok: false, msg: 'Username 3–20 karakter: huruf, angka, titik, atau garis bawah.' };
        if (String(pass).length < 4) return { ok: false, msg: 'Kata sandi minimal 4 karakter.' };
        if (all[k]) return { ok: false, msg: `Username "${user.trim()}" sudah dipakai. Coba yang lain.` };
        all[k] = { username: user.trim(), pass: this.hash(user, pass), created: Date.now(), save: null };
        if (!this.persist()) return { ok: false, msg: 'Browser menolak menyimpan data (mode privat?).' };
        return { ok: true, acc: all[k] };
    },
    login(user, pass) {
        const acc = this.all()[this.key(user)];
        if (!acc) return { ok: false, msg: 'Username belum terdaftar. Pilih tab "Daftar Baru".' };
        if (acc.pass !== this.hash(user, pass)) return { ok: false, msg: 'Kata sandi salah.' };
        return { ok: true, acc };
    },
    get(user) { return this.all()[this.key(user)]; },
    save(user, data) { const acc = this.get(user); if (!acc) return; acc.save = data; this.persist(); },
    recent() { const all = this.all(); return Object.values(all).sort((a, b) => (b.lastPlay || 0) - (a.lastPlay || 0)).slice(0, 4); },
    touch(user) { const acc = this.get(user); if (acc) { acc.lastPlay = Date.now(); this.persist(); } try { localStorage.setItem(LAST_KEY, acc ? acc.username : ''); } catch (e) { /* abaikan */ } }
};

/* =====================================================================
   DataManager — data tokoh + progres akun yang sedang main
   ===================================================================== */
class DataManager {
    constructor() {
        this.heroes = (typeof HEROES_DATA !== 'undefined' ? HEROES_DATA : []);
        this.duels = (typeof DUELS_DATA !== 'undefined' ? DUELS_DATA : []);
        this.elemen = (typeof ELEMEN_DATA !== 'undefined' ? ELEMEN_DATA : {});
        this.portraits = window.HERO_PORTRAITS || {};
        this.byId = new Map(this.heroes.map((h, i) => [h.id, Object.assign(h, { no: i + 1 })]));
        this.world = this.heroes.filter((h) => h.id !== SECRET_ID);
        this.user = null;
        this.mode = 'battle';
        this.state = this.blank();
    }
    blank() { return { player: null, collected: { battle: [], explore: [] }, champion: 'player', endingSeen: { battle: false, explore: false }, helpSeen: false, pos: null }; }
    loadUser(acc) {
        this.user = acc.username;
        this.state = Object.assign(this.blank(), acc.save || {});
        this.state.collected = Object.assign({ battle: [], explore: [] }, this.state.collected);
        this.state.endingSeen = Object.assign({ battle: false, explore: false }, this.state.endingSeen);
        this._set = null; this._ph = null;
        Accounts.touch(this.user);
    }
    setMode(m) { this.mode = m; this._set = null; }
    get collected() {
        if (!this._set || this._setMode !== this.mode) { this._set = new Set(this.state.collected[this.mode].filter((id) => this.byId.has(id))); this._setMode = this.mode; }
        return this._set;
    }
    save() {
        if (!this.user) return;
        this.state.collected[this.mode] = [...this.collected];
        Accounts.save(this.user, this.state);
    }
    get(id) { return id === 'player' ? this.playerHero() : this.byId.get(id); }
    collect(id) { const isNew = !this.collected.has(id); this.collected.add(id); this.save(); return isNew; }
    isCollected(id) { return this.collected.has(id); }
    worldDone() { return this.world.every((h) => this.collected.has(h.id)); }
    level() { return 1 + Math.floor(this.collected.size / 4); }
    roster() { return [this.playerHero(), ...this.heroes.filter((h) => this.collected.has(h.id))]; }
    champion() { const c = this.state.champion; return (c !== 'player' && this.collected.has(c)) ? this.byId.get(c) : this.playerHero(); }
    setChampion(id) { this.state.champion = id; this.save(); }
    /** Pemain dibuat seperti data tokoh lain, statistiknya naik sesuai level */
    playerHero() {
        const p = this.state.player || defaultPlayer(this.user || 'Pengembara');
        const lv = this.level();
        const base = Math.min(94, 68 + lv * 1.3);
        let k = base, s = base, t = base, c = base - 2;
        if (p.stance === 'Aggressive') { k += 5; t -= 3; } else if (p.stance === 'Evasive') { s += 5; k -= 3; } else { t += 5; s -= 2; }
        [k, s, t, c] = [k, s, t, c].map((v) => Math.round(clamp(v, 40, 99)));
        const ovr = Math.round((k + s + t + c) / 4);
        const god = PATRONS[p.patron].god;
        const weapon = { Aggressive: 'sword', Technical: 'spear', Evasive: 'bow' }[p.stance];
        const hs = p.hairstyle;
        if (!this._ph || this._phKey !== JSON.stringify(p) + lv) {
            this._phKey = JSON.stringify(p) + lv;
            this._ph = {
                id: 'player', nama: p.name, role: `Pengembara · Level ${lv}`, faksi: 'Pengembara dari Masa Depan', kubu: 'Pengembara', era: 'Masa kini',
                image: '', punya_gambar: false, tinggi: '180 cm', patron: `${god} (pilihanmu)`, elemen: p.patron, combat_stance: p.stance,
                senjata: { sword: 'Pedang perunggu & perisai', spear: 'Tombak & perisai bundar', bow: 'Busur kayu zaitun' }[weapon],
                kekuatan: k, kecepatan: s, taktik: t, kepemimpinan: c, ovr, hp_base: ovr * 10, stamina_regen: Math.round(s / 5 * 10) / 10,
                skills: [
                    { slot: 1, tipe: 'Kekuatan', nama: weapon === 'bow' ? 'Panah Berat' : 'Tebasan Pemberani', deskripsi: 'Serangan sekuat tenaga' },
                    { slot: 2, tipe: 'Kecepatan', nama: 'Langkah Kilat', deskripsi: 'Serangan cepat lalu siap menghindar' },
                    { slot: 3, tipe: 'Taktik', nama: 'Kuda-kuda Perisai', deskripsi: 'Bertahan dan membalas serangan Kekuatan' },
                    { slot: 4, tipe: 'Kharisma', nama: `Doa kepada ${god}`, deskripsi: 'Berkah dewa pelindung (lalu diam 1 giliran)' }
                ],
                ultimate: { nama: `Amukan ${p.name}`, deskripsi: `Seluruh keberanian ${p.name} meledak dalam satu serangan` },
                kuat_melawan: [], lemah_melawan: [], rival_ids: [], sekutu_ids: [],
                warna_tema: this.elemen[p.patron]?.warna || '#ffd23f', warna_jubah: p.cape, warna_logam: '#d9a24e',
                latar_belakang: `${p.name} adalah pengembara yang tiba-tiba terbangun di pulau tempat para pahlawan Homer hidup. Tugasnya: menemui semua tokoh dan mencatat kisah mereka di Buku Sejarah.`,
                pedoman: 'Jadilah penjelajah yang rendah hati: dengarkan kisah setiap tokoh, ambil teladan yang baik, dan belajar dari kesalahan mereka.',
                status_pedoman: 'Pemain', dasar_mitos: 'Tokoh buatanmu sendiri.',
                lookOverride: {
                    skin: hexN(p.skin), hair: hexN(p.hair), longHair: hs === 'long', beardLen: hs === 'beard' ? 0.22 : undefined, beardColor: hs === 'beard' ? hexN(p.hair) : undefined,
                    beard: hs === 'beard' ? undefined : false, cape: hexN(p.cape), crest: hexN(p.cape), helm: p.helm, weapon,
                    shield: weapon !== 'bow', tunic: hexN(this.elemen[p.patron]?.warna || '#ffd23f')
                }
            };
        }
        return this._ph;
    }
    img(h) {
        if (!h) return '';
        if (h.id === 'player') return playerPortrait(this.state.player || defaultPlayer(this.user || 'P'));
        if (this.portraits[h.id]) return this.portraits[h.id];
        // belum ada di portraits.js: coba file di folder assets; kalau tidak ada → potret balok otomatis
        const src = ASSET_DIR + (h.image || h.id + '.jpg');
        this.fb = this.fb || new Map();
        try { this.fb.set(new URL(src, location.href).href, () => (window.game?.preview ? window.game.preview.portrait(h) : this.placeholder(h))); } catch (e) { /* abaikan */ }
        return src;
    }
    placeholder(h) {
        const c = h.warna_tema || '#a98bff';
        const ini = h.nama.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="#2a1660"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/><text x="50" y="62" font-family="Arial" font-weight="700" font-size="34" fill="#fff" text-anchor="middle">${ini}</text></svg>`;
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }
    names(ids) { return (ids || []).map((id) => this.byId.get(id)).filter(Boolean).map((h) => h.nama); }
    iconic(a, b) {
        const d = this.duels.find((x) => (x.hero_1 === a.id && x.hero_2 === b.id) || (x.hero_1 === b.id && x.hero_2 === a.id));
        if (d) return { theme: d.arena, title: d.nama_event, quote: d.kutipan, lesson: d.pesan, source: d.sumber, tag: 'PERTARUNGAN IKONIK' };
        if ((a.rival_ids || []).includes(b.id) || (b.rival_ids || []).includes(a.id)) {
            const src = (b.rival_ids || []).includes(a.id) ? b : a;
            return { theme: 'rival', title: `${a.nama} vs ${b.nama}`, quote: `“${src.ultimate?.nama || 'Rival abadi'}”`, lesson: src.dasar_mitos || '', source: 'Rival dalam mitos', tag: 'RIVAL ABADI' };
        }
        return null;
    }
}
const hexN = (c) => parseInt(String(c).replace('#', ''), 16);
function defaultPlayer(name) {
    return { name: String(name).slice(0, 18), skin: LOOK_OPTS.skin[1], hair: LOOK_OPTS.hair[1], hairstyle: 'short', cape: LOOK_OPTS.cape[0], helm: 'corinth', patron: 'Petir', stance: 'Technical' };
}
/** Potret kotak-kotak pemain digambar di canvas (gaya sama dengan karakter 3D) */
const _ppCache = new Map();
function playerPortrait(p) {
    const key = JSON.stringify(p);
    if (_ppCache.has(key)) return _ppCache.get(key);
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    g.fillStyle = p.cape; g.fillRect(0, 0, 64, 64);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 44, 64, 20);
    g.fillStyle = p.skin; g.fillRect(14, 14, 36, 36);
    g.fillStyle = p.hair;
    if (p.helm === 'corinth') { g.fillStyle = '#d9a24e'; g.fillRect(12, 8, 40, 12); g.fillRect(12, 8, 8, 34); g.fillRect(44, 8, 8, 34); g.fillStyle = p.cape; g.fillRect(28, 0, 8, 10); }
    else if (p.helm === 'pilos') { g.fillStyle = '#8a5a3a'; g.fillRect(14, 6, 36, 10); g.fillRect(24, 0, 16, 8); }
    else { g.fillRect(12, 10, 40, 8); if (p.hairstyle === 'long') { g.fillRect(10, 10, 6, 36); g.fillRect(48, 10, 6, 36); } if (p.helm === 'laurel') { g.fillStyle = '#ffd23f'; g.fillRect(12, 12, 40, 4); } }
    g.fillStyle = '#1d1530'; g.fillRect(22, 28, 6, 7); g.fillRect(36, 28, 6, 7);
    if (p.hairstyle === 'beard') { g.fillStyle = p.hair; g.fillRect(14, 40, 36, 12); }
    else { g.fillStyle = '#8a3a3a'; g.fillRect(28, 42, 8, 3); }
    const url = c.toDataURL();
    _ppCache.set(key, url);
    return url;
}

/* =====================================================================
   Terrain — bentuk pulau (deterministik, dipakai dunia & AI)
   ===================================================================== */
const Terrain = {
    noise(x, z) {
        return Math.sin(x * 0.021 + 1.3) * Math.cos(z * 0.018 - 0.4) * 0.5
            + Math.sin((x + z) * 0.043) * 0.3
            + Math.sin(x * 0.091 - z * 0.077 + 2.1) * 0.14
            + Math.cos(z * 0.13 + x * 0.05) * 0.08;
    },
    height(x, z) {
        const d = Math.hypot(x, z) / ISLAND_R;
        let h = 3.5 + this.noise(x, z) * 3.2;
        h *= 1 - smooth(0.78, 1.0, d);
        h -= smooth(0.86, 1.04, d) * 9;
        // Gunung Olympus
        const ox = x - 0, oz = z + 205;
        h += 78 * Math.exp(-(ox * ox + oz * oz) / (2 * 40 * 40));
        // Troya di atas dataran rata
        const tx = x - TROY.x, tz = z - TROY.z, tk = Math.exp(-(tx * tx + tz * tz) / (2 * 46 * 46));
        h = lerp(h, 6.5, tk * 0.92);
        // persimpangan rata
        const sx = x - SPAWN.x, sz = z - SPAWN.z, sk = Math.exp(-(sx * sx + sz * sz) / (2 * 18 * 18));
        h = lerp(h, 3.2, sk * 0.9);
        // pantai kemah Yunani lebih landai
        if (x < -150) h = lerp(h, Math.min(h, 2.4), smooth(-150, -230, x) * 0.6);
        return h;
    },
    land(x, z) { return this.height(x, z) > 0.9; }
};

/* =====================================================================
   OpenWorld — pulau besar, pemain third-person, NPC berkeliaran
   ===================================================================== */
class OpenWorld {
    constructor(game) {
        this.g = game;
        this.scene = new T.Scene();
        this.camera = new T.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 1500);
        this.npcs = [];
        this.keys = new Set();
        this.cam = { yaw: 0, pitch: 0.32, dist: 9.5 };
        this.player = { pos: new T.Vector3(SPAWN.x, 0, SPAWN.z), vel: new T.Vector3(), yaw: Math.PI, vy: 0, grounded: true, safe: 0, run: false };
        this.stick = { x: 0, y: 0 };
        this.runToggle = false;
        this.region = null;
        this.labelPool = [];
        this.paused = true;
        this._v = new T.Vector3();
    }
    toon(c, extra) { return new T.MeshToonMaterial(Object.assign({ color: c, gradientMap: this.g.gradient }, extra || {})); }
    build() {
        const s = this.scene;
        s.fog = new T.Fog('#e9d6ff', 140, 520);
        s.add(new T.HemisphereLight('#fff4e6', '#7a8cff', 1.55));
        const sun = this.sun = new T.DirectionalLight('#fff3dc', 2.3);
        sun.position.set(80, 140, 60); sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 10, far: 400 });
        s.add(sun, sun.target);
        this._sky();
        this._terrain();
        this._landmarks();
        this._nature();
        this._npcs();
        this._player();
        this._minimapBg();
        this._input();
        // performa: hanya pemain yang memberi bayangan nyata; tokoh lain pakai bayangan bulat
        this.scene.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
        this.ground.receiveShadow = true;
        this.playerBH.root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
        this.placePlayer(this.g.data.state.pos || SPAWN);
    }
    /* ---------- langit ---------- */
    _sky() {
        const geo = new T.SphereGeometry(1200, 32, 16);
        const cols = new Float32Array(geo.attributes.position.count * 3), c = new T.Color(), top = new T.Color('#6f7dff'), mid = new T.Color('#c8b6ff'), bot = new T.Color('#ffd6ec');
        for (let i = 0; i < geo.attributes.position.count; i++) {
            const y = geo.attributes.position.getY(i) / 1200;
            if (y > 0.05) c.copy(mid).lerp(top, smooth(0.05, 0.6, y)); else c.copy(bot).lerp(mid, smooth(-0.2, 0.05, y));
            cols.set([c.r, c.g, c.b], i * 3);
        }
        geo.setAttribute('color', new T.BufferAttribute(cols, 3));
        this.skyDome = new T.Mesh(geo, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false }));
        this.scene.add(this.skyDome);
        // awan
        this.clouds = new T.Group();
        const cm = this.toon('#ffffff', { transparent: true, opacity: 0.95 }), cg = new T.IcosahedronGeometry(1, 1);
        for (let i = 0; i < 46; i++) {
            const cl = new T.Group();
            for (let k = 0; k < 5; k++) { const p = new T.Mesh(cg, cm); p.position.set(k * 4 - 8, rand(-1, 2), rand(-2, 2)); p.scale.setScalar(rand(3, 6)); cl.add(p); }
            const a = rand(0, Math.PI * 2), r = rand(60, 420);
            cl.position.set(Math.cos(a) * r, rand(70, 120), Math.sin(a) * r);
            cl.rotation.y = rand(0, 6);
            this.clouds.add(cl);
        }
        // awan melingkari puncak Olympus
        for (let i = 0; i < 8; i++) {
            const cl = new T.Group();
            for (let k = 0; k < 4; k++) { const p = new T.Mesh(cg, cm); p.position.set(k * 3 - 5, 0, rand(-1, 1)); p.scale.setScalar(rand(2.5, 4)); cl.add(p); }
            const a = (i / 8) * Math.PI * 2;
            cl.position.set(Math.cos(a) * 34, 62 + rand(-4, 4), -205 + Math.sin(a) * 34);
            cl.userData.olympus = a;
            this.clouds.add(cl);
        }
        this.scene.add(this.clouds);
    }
    /* ---------- daratan & laut ---------- */
    _terrain() {
        const SIZE = 680, SEG = 136;
        let geo = new T.PlaneGeometry(SIZE, SIZE, SEG, SEG);
        geo.rotateX(-Math.PI / 2);
        const p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) p.setY(i, Terrain.height(p.getX(i), p.getZ(i)));
        geo = geo.toNonIndexed();
        const pos = geo.attributes.position, cols = new Float32Array(pos.count * 3), c = new T.Color();
        const C = { sand: '#ffe3a3', grass: '#8ee88f', grass2: '#76d98a', meadow: '#b6f08a', flower: '#ffc2e2', rock: '#c7b3ff', rock2: '#ad98ef', snow: '#ffffff', dirt: '#e8c48a', dark: '#5fbf7a', wild: '#6fcf8a' };
        for (let i = 0; i < pos.count; i += 3) {
            const x = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3, z = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3, y = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
            let col;
            const dTroy = Math.hypot(x - TROY.x, z - TROY.z), dSpawn = Math.hypot(x - SPAWN.x, z - SPAWN.z);
            if (y < 1.3) col = C.sand;
            else if (y > 58) col = C.snow;
            else if (y > 22) col = ((i / 3) % 2) ? C.rock : C.rock2;
            else if (dTroy < 32) col = ((i / 3) % 4 === 0) ? '#f0d6a0' : C.dirt;
            else if (dSpawn < 10) col = '#f3e3c3';
            else if (x < -150 && z > 20) col = y < 2.2 ? C.sand : C.grass2;
            else if (x < -60 && z > 120) col = ((i / 3) % 3 === 0) ? C.dark : C.wild;
            else if (x < -110 && z < -40) col = (Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1) < 0.12 ? C.flower : C.meadow;
            else col = (Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1) < 0.035 ? C.flower : (((i / 3) % 3 === 0) ? C.grass2 : C.grass);
            c.set(col);
            for (let k = 0; k < 3; k++) cols.set([c.r, c.g, c.b], (i + k) * 3);
        }
        geo.setAttribute('color', new T.BufferAttribute(cols, 3));
        geo.computeVertexNormals();
        this.ground = new T.Mesh(geo, this.toon('#ffffff', { vertexColors: true }));
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
        // laut
        const sea = new T.Mesh(new T.CircleGeometry(1100, 48), this.toon('#4fc8ff', { transparent: true, opacity: 0.88 }));
        sea.rotation.x = -Math.PI / 2; sea.position.y = 0.35;
        this.sea = sea;
        this.scene.add(sea);
    }
    /* ---------- bangunan khas tiap wilayah ---------- */
    _landmarks() {
        const s = this.scene;
        const M = (c) => this.toon(c);
        const box = (w, h, d, c) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), typeof c === 'string' ? M(c) : c); m.castShadow = true; m.receiveShadow = true; return m; };
        const put = (o, x, z, yaw = 0, lift = 0) => { o.position.set(x, Terrain.height(x, z) + lift, z); o.rotation.y = yaw; s.add(o); return o; };
        const temple = (w, d, colC, roofC, cols = 6) => {
            const g = new T.Group(), m = M(colC);
            g.add(at3(box(w + 1, 0.8, d + 1, '#fff6e6'), 0, 0.4, 0));
            const cg = new T.CylinderGeometry(0.45, 0.5, 6, 8);
            for (let k = 0; k < cols; k++) for (const z of [-d / 2, d / 2]) { const c = new T.Mesh(cg, m); c.position.set(-w / 2 + (k / (cols - 1)) * w, 3.8, z); c.castShadow = true; g.add(c); }
            g.add(at3(box(w + 1, 0.6, d + 1, colC), 0, 7.1, 0));
            const rg = new T.CylinderGeometry(1, 1, 1, 3); rg.rotateZ(Math.PI / 2); rg.rotateX(-Math.PI / 2);
            const roof = new T.Mesh(rg, M(roofC)); roof.castShadow = true;
            roof.scale.set(w + 1.4, 1.6, (d + 1.6) / 1.732); roof.position.y = 7.4 + 0.8; g.add(roof);
            return g;
        };
        const canvasBoard = (text, sub, color) => {
            const c = document.createElement('canvas'); c.width = 512; c.height = 160;
            const g = c.getContext('2d');
            g.fillStyle = '#7a4a2a'; g.fillRect(0, 0, 512, 160);
            g.fillStyle = color; g.fillRect(10, 10, 492, 140);
            g.fillStyle = '#1d1530'; g.font = 'bold 54px Arial'; g.textAlign = 'center'; g.fillText(text, 256, 82);
            g.font = '28px Arial'; g.fillText(sub, 256, 128);
            const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
            return new T.Mesh(new T.PlaneGeometry(6, 1.9), new T.MeshBasicMaterial({ map: tex, side: T.DoubleSide }));
        };
        /* Olympus: kuil emas di puncak + tangga */
        const top = temple(14, 9, '#fff3c4', '#ffd23f', 7); top.scale.setScalar(1.1); put(top, 0, -205, 0, -0.5);
        const throne = box(2, 4, 2, '#ffd23f'); put(throne, 0, -205, 0, 1);
        for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; put(temple(5, 4, '#ffffff', '#ff8fa3', 4), Math.cos(a) * 52, -205 + Math.sin(a) * 52, -a, -0.3).scale.setScalar(0.6); }
        /* Troya: tembok melingkar, menara, gerbang Scaea (menghadap barat), rumah & istana */
        const wallM = M('#f0d9a8'), towerM = M('#e8c48a');
        const N = 40;
        this.troyGate = Math.PI; // arah barat
        for (let i = 0; i < N; i++) {
            const a = (i / N) * Math.PI * 2;
            if (Math.abs(angDiff(a, this.troyGate)) < 0.16) continue;
            const seg = new T.Mesh(new T.BoxGeometry(5.6, 9, 2.2), wallM); seg.castShadow = true;
            const x = TROY.x + Math.cos(a) * TROY.wallR, z = TROY.z + Math.sin(a) * TROY.wallR;
            seg.position.set(x, Terrain.height(x, z) + 4.5, z); seg.rotation.y = -a + Math.PI / 2; s.add(seg);
            if (i % 5 === 0) { const tw = new T.Mesh(new T.BoxGeometry(5, 14, 5), towerM); tw.castShadow = true; tw.position.set(x, Terrain.height(x, z) + 7, z); tw.rotation.y = -a; s.add(tw); const cap = box(6, 1, 6, '#ff8f5a'); cap.position.set(x, tw.position.y + 7.5, z); s.add(cap); }
        }
        const gx = TROY.x + Math.cos(this.troyGate) * TROY.wallR, gz = TROY.z;
        [-1, 1].forEach((k) => { const tw = box(4, 16, 4, '#e8c48a'); put(tw, gx, gz + k * 5.5, 0, 8); });
        const lintel = box(4, 2, 13, '#d9a24e'); put(lintel, gx, gz, 0, 15);
        const palace = temple(16, 11, '#ffe9c6', '#ff6b4a', 7); put(palace, TROY.x + 8, TROY.z, Math.PI / 2, 0);
        for (let i = 0; i < 18; i++) {
            const a = rand(0, Math.PI * 2), r = rand(12, 28), x = TROY.x + Math.cos(a) * r, z = TROY.z + Math.sin(a) * r;
            if (Math.abs(angDiff(a, this.troyGate)) < 0.5) continue;
            const hs = new T.Group(); hs.add(at3(box(4, 3.2, 4, '#fff1d6'), 0, 1.6, 0)); hs.add(at3(box(4.6, 1, 4.6, ['#ff8f5a', '#ff6b6b', '#ffb347'][i % 3]), 0, 3.6, 0));
            put(hs, x, z, rand(0, 3));
        }
        /* Kemah Yunani: kapal di pantai, tenda, api unggun, Kuda Troya sedang dibangun */
        for (let i = 0; i < 9; i++) {
            const z = 20 + i * 14, x = -262 + Math.sin(i) * 6;
            const ship = new T.Group();
            ship.add(at3(box(3.2, 1.8, 13, '#8b5a3c'), 0, 0.9, 0));
            ship.add(at3(box(2.6, 1.6, 2.2, '#6b4428'), 0, 2, 6.2));
            ship.add(at3(box(0.3, 9, 0.3, '#5a3a24'), 0, 5.6, 0));
            ship.add(at3(box(0.2, 5, 6, ['#ffffff', '#ffe3a3', '#ff8fa3'][i % 3]), 0, 6.2, 0));
            ship.add(at3(box(3.4, 0.5, 1, '#1d1530'), 0, 1.4, 6.6));
            ship.position.set(x, Math.max(0.4, Terrain.height(x, z)) - 0.2, z); ship.rotation.y = 0.2 * Math.sin(i * 3); s.add(ship);
        }
        for (let i = 0; i < 16; i++) {
            const x = -200 + rand(-30, 30), z = 70 + rand(-45, 45);
            const tent = new T.Mesh(new T.CylinderGeometry(0.01, 2.6, 3, 4), M(['#ffffff', '#f3e6c8', '#cfe6ff', '#ffd6e8'][i % 4]));
            tent.castShadow = true; put(tent, x, z, Math.PI / 4, 1.5);
        }
        for (let i = 0; i < 4; i++) { const x = -195 + i * 9 - 14, z = 75 + (i % 2) * 12; const fire = new T.Mesh(new T.ConeGeometry(0.7, 1.4, 5), new T.MeshBasicMaterial({ color: '#ffb347' })); put(fire, x, z, 0, 0.7); this._fires = (this._fires || []).concat(fire); }
        const horse = new T.Group(), hw = M('#b07a48');
        [[3, 3, 7, 0, 5, 0], [1.6, 4.5, 2, 0, 8.5, 3], [1.8, 1.8, 3.2, 0, 10.5, 4.4], ...[-1, 1].flatMap((sx) => [[0.9, 4, 0.9, sx * 1, 2, 2.6], [0.9, 4, 0.9, sx * 1, 2, -2.6]]), [3.6, 0.6, 8, 0, 0.3, 0]].forEach(([w, h, d, x, y, z]) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), hw); b.position.set(x, y, z); b.castShadow = true; horse.add(b); });
        put(horse, -160, 40, Math.PI / 2.4);
        /* Padang Legenda: reruntuhan & kapal Argo di bukit */
        for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, x = -175 + Math.cos(a) * 18, z = -100 + Math.sin(a) * 18, h = rand(2, 7); const col = new T.Mesh(new T.CylinderGeometry(0.6, 0.7, h, 8), M('#fff6e6')); col.castShadow = true; put(col, x, z, 0, h / 2); }
        const argo = new T.Group(); argo.add(at3(box(4, 2, 16, '#c98a3c'), 0, 1, 0)); argo.add(at3(box(0.4, 11, 0.4, '#6b4428'), 0, 7, 0)); argo.add(at3(box(0.2, 6, 7, '#ffd23f'), 0, 7.5, 0));
        put(argo, -205, -135, 0.7);
        /* Alam Liar Mitos: labirin Kreta & gua Cyclops */
        const lab = M('#c9b6a0');
        for (let i = 0; i < 6; i++) { const r = 4 + i * 3.2, n = 6 + i * 3; for (let k = 0; k < n; k++) { if ((k + i) % 4 === 0) continue; const a = (k / n) * Math.PI * 2, x = -120 + Math.cos(a) * r, z = 205 + Math.sin(a) * r; const w = new T.Mesh(new T.BoxGeometry(2.2, 3, 0.8), lab); w.castShadow = true; w.position.set(x, Terrain.height(x, z) + 1.5, z); w.rotation.y = -a + Math.PI / 2; s.add(w); } }
        const cave = new T.Mesh(new T.SphereGeometry(10, 9, 6, 0, Math.PI * 2, 0, Math.PI / 2), M('#8f84a8')); put(cave, -60, 215, 0, -1);
        const hole = new T.Mesh(new T.CircleGeometry(3.5, 10), new T.MeshBasicMaterial({ color: '#1d1530' })); hole.position.set(-60, Terrain.height(-60, 205) + 2.6, 205.3); s.add(hole);
        /* Pesisir Odyssey: istana Phaeacia, pondok Circe, pulau Calypso, dermaga */
        put(temple(10, 7, '#e8f7ff', '#4ee6d6', 5), 100, 180, 0.3);
        const hut = new T.Group(); hut.add(at3(box(5, 3.5, 5, '#d8b6ff'), 0, 1.75, 0)); hut.add(at3(new T.Mesh(new T.CylinderGeometry(0.01, 4.3, 3, 4), M('#7b3fc4')), 0, 5, 0)); put(hut, 128, 210, 0.7);
        const dock = box(3, 0.4, 16, '#8b5a3c'); dock.position.set(110, 0.8, 238); s.add(dock);
        /* Persimpangan (tempat mulai): air mancur & papan penunjuk */
        const fountain = new T.Group();
        fountain.add(at3(new T.Mesh(new T.CylinderGeometry(3.2, 3.5, 1, 14), M('#fff6e6')), 0, 0.5, 0));
        fountain.add(at3(new T.Mesh(new T.CylinderGeometry(2.8, 2.8, 0.2, 14), M('#4fc8ff')), 0, 1, 0));
        fountain.add(at3(new T.Mesh(new T.CylinderGeometry(0.4, 0.5, 3, 8), M('#fff6e6')), 0, 2, 0));
        put(fountain, SPAWN.x, SPAWN.z - 14);
        Object.entries(REGIONS).forEach(([k, r], i) => {
            const dx = r.x - SPAWN.x, dz = r.z - SPAWN.z, a = Math.atan2(dx, dz);
            const post = new T.Group();
            post.add(at3(box(0.4, 3.6, 0.4, '#7a4a2a'), 0, 1.8, 0));
            const b = canvasBoard(`${r.name} ➜`, `${Math.round(Math.hypot(dx, dz))} langkah`, KUBU_COLOR[k]); b.position.set(0, 3.2, 0.25); b.scale.setScalar(0.62); post.add(b);
            put(post, SPAWN.x + Math.sin(a) * 8.5, SPAWN.z - 14 + Math.cos(a) * 8.5, a + Math.PI / 2);
        });
    }
    /* ---------- pohon, batu, bunga (instanced) ---------- */
    _nature() {
        const dummy = new T.Object3D(), col = new T.Color();
        const okSpot = (x, z) => {
            const h = Terrain.height(x, z);
            if (h < 1.6 || h > 24) return false;
            if (Math.hypot(x - TROY.x, z - TROY.z) < 40) return false;
            if (Math.hypot(x - SPAWN.x, z - SPAWN.z) < 14) return false;
            if (x < -150 && z > 10 && z < 140) return false; // kemah
            if (Math.hypot(x + 120, z - 205) < 24) return false; // labirin
            return true;
        };
        const spots = (n, tries) => { const out = []; for (let t = 0; t < tries && out.length < n; t++) { const a = rand(0, Math.PI * 2), r = Math.sqrt(Math.random()) * ISLAND_R, x = Math.cos(a) * r, z = Math.sin(a) * r; if (okSpot(x, z)) out.push([x, z]); } return out; };
        // pohon zaitun bulat
        const olive = spots(700, 9000);
        const fol = new T.InstancedMesh(new T.IcosahedronGeometry(1.6, 0), this.toon('#ffffff'), olive.length);
        const trunk = new T.InstancedMesh(new T.CylinderGeometry(0.22, 0.32, 2.2, 5), this.toon('#a86b4a'), olive.length);
        const leaf = ['#5fcf7a', '#7be08a', '#3fbf8f', '#9be36b', '#ff9cc8', '#6fd68a'];
        olive.forEach(([x, z], i) => {
            const s = rand(0.8, 1.5), y = Terrain.height(x, z);
            dummy.position.set(x, y + 1.1 * s, z); dummy.rotation.set(0, rand(0, 6), 0); dummy.scale.setScalar(s); dummy.updateMatrix(); trunk.setMatrixAt(i, dummy.matrix);
            dummy.position.y = y + 2.9 * s; dummy.scale.set(s, s * rand(0.9, 1.4), s); dummy.updateMatrix(); fol.setMatrixAt(i, dummy.matrix);
            fol.setColorAt(i, col.set(leaf[i % leaf.length]));
        });
        // cemara tinggi
        const cyp = spots(260, 5000);
        const cone = new T.InstancedMesh(new T.ConeGeometry(1, 5, 6), this.toon('#3f9f6a'), cyp.length);
        cyp.forEach(([x, z], i) => { const s = rand(0.8, 1.4); dummy.position.set(x, Terrain.height(x, z) + 2.4 * s, z); dummy.rotation.set(0, 0, 0); dummy.scale.set(s, s * rand(1, 1.5), s); dummy.updateMatrix(); cone.setMatrixAt(i, dummy.matrix); });
        // batu
        const rk = spots(260, 4000);
        const rocks = new T.InstancedMesh(new T.DodecahedronGeometry(1, 0), this.toon('#d6c8ff'), rk.length);
        rk.forEach(([x, z], i) => { dummy.position.set(x, Terrain.height(x, z) + 0.2, z); dummy.rotation.set(rand(0, 3), rand(0, 3), 0); dummy.scale.setScalar(rand(0.5, 1.8)); dummy.updateMatrix(); rocks.setMatrixAt(i, dummy.matrix); });
        // bunga
        const fl = spots(900, 6000);
        const flowers = new T.InstancedMesh(new T.BoxGeometry(0.35, 0.35, 0.35), this.toon('#ffffff'), fl.length);
        const fc = ['#ff5fa2', '#ffd23f', '#ffffff', '#b892ff', '#ff8f5a'];
        fl.forEach(([x, z], i) => { dummy.position.set(x, Terrain.height(x, z) + 0.25, z); dummy.rotation.set(0, rand(0, 3), 0); dummy.scale.setScalar(1); dummy.updateMatrix(); flowers.setMatrixAt(i, dummy.matrix); flowers.setColorAt(i, col.set(fc[i % fc.length])); });
        [fol, trunk, cone, rocks].forEach((m) => { m.castShadow = true; });
        this.scene.add(fol, trunk, cone, rocks, flowers);
        this.treeSpots = olive.concat(cyp);
    }
    /* ---------- tokoh-tokoh ---------- */
    _npcs() {
        const shadowGeo = new T.CircleGeometry(0.7, 12), shadowMat = new T.MeshBasicMaterial({ color: '#1d1530', transparent: true, opacity: 0.22, depthWrite: false });
        this.shadowGeo = shadowGeo; this.shadowMat = shadowMat;
        this.g.data.world.forEach((h) => {
            const R = REGIONS[h.kubu] || REGIONS['Akhaia (Yunani)'];
            let x, z, tries = 0;
            do {
                const a = rand(0, Math.PI * 2), r = Math.sqrt(Math.random()) * R.r * 0.85;
                x = R.x + Math.cos(a) * r; z = R.z + Math.sin(a) * r; tries++;
            } while ((!Terrain.land(x, z) || this.blocked(x, z, x, z)) && tries < 60);
            // dewa duduk di lereng Olympus, bukan di puncak terjal
            const bh = new BlockHero(h);
            const sh = new T.Mesh(shadowGeo, shadowMat); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.06; bh.root.add(sh);
            const npc = {
                hero: h, bh, pos: new T.Vector3(x, Terrain.height(x, z), z), home: new T.Vector3(x, 0, z), yaw: rand(0, 6), target: null,
                timer: rand(0, 4), state: 'idle', aggressive: h.combat_stance === 'Aggressive', cooldown: 0, dist: 999, wanderR: h.kubu === 'Dewa Olympus' ? 8 : 16
            };
            bh.root.position.copy(npc.pos); bh.root.rotation.y = npc.yaw;
            this.scene.add(bh.root);
            this.npcs.push(npc);
        });
    }
    _player() {
        if (this.playerBH) { this.scene.remove(this.playerBH.root); this.playerBH.dispose(); }
        this.playerBH = new BlockHero(this.g.data.playerHero(), { shadows: true });
        const sh = new T.Mesh(this.shadowGeo, this.shadowMat); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.06; this.playerBH.root.add(sh);
        this.playerBH.root.traverse((o) => { if (o.isMesh && o !== sh) o.castShadow = true; });
        // sayap Hermes (muncul saat terbang)
        const wm = new T.MeshToonMaterial({ color: '#fff6e0', emissive: '#ffcf4a', emissiveIntensity: 0.35, gradientMap: this.g.gradient, side: T.DoubleSide });
        this.wings = new T.Group();
        [-1, 1].forEach((s) => {
            const w = new T.Group();
            for (let k = 0; k < 4; k++) { const f = new T.Mesh(new T.BoxGeometry(0.05, 0.22, 1.5 - k * 0.28), wm); f.position.set(0, -k * 0.2, -(1.5 - k * 0.28) / 2); w.add(f); }
            w.position.set(s * 0.18, 1.85, -0.3); w.rotation.y = s * 0.35;
            this.wings.add(w);
        });
        this.wings.visible = !!this.flying;
        this.playerBH.P.body.add(this.wings);
        this.scene.add(this.playerBH.root);
    }
    /** Cari titik darat kosong di sekitar (x,z) */
    freeSpot(x, z, rMin = 3, rMax = 9) {
        for (let i = 0; i < 40; i++) { const a = Math.random() * Math.PI * 2, r = rMin + Math.random() * (rMax - rMin), px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (!this.blocked(px, pz, px, pz)) return { x: px, z: pz }; }
        return { x, z };
    }
    teleport(x, z, faceX, faceZ) {
        this.toggleFly(false);
        this.placePlayer({ x, z });
        if (faceX !== undefined) { const yaw = Math.atan2(faceX - x, faceZ - z); this.player.yaw = yaw; this.cam.yaw = yaw + Math.PI; this.cam.pitch = 0.28; }
        this.player.safe = 5;
        this.snapCamera();
    }
    rebuildPlayer() { this._player(); this.placePlayer(this.player.pos); }
    placePlayer(p) {
        const P = this.player;
        P.yaw = Math.PI; this.cam.yaw = 0;
        P.pos.set(p.x, Terrain.height(p.x, p.z), p.z);
        this.playerBH.root.position.copy(P.pos);
        this.snapCamera();
    }
    /** Tabrakan sederhana: tembok Troya (kecuali gerbang) & laut */
    blocked(x0, z0, x, z) {
        if (!Terrain.land(x, z)) return true;
        const d0 = Math.hypot(x0 - TROY.x, z0 - TROY.z), d1 = Math.hypot(x - TROY.x, z - TROY.z);
        const inBand = (d) => d > TROY.wallR - 1.8 && d < TROY.wallR + 1.8;
        if (inBand(d1) || (d0 - TROY.wallR) * (d1 - TROY.wallR) < 0) {
            const a = Math.atan2(z - TROY.z, x - TROY.x);
            if (Math.abs(angDiff(a, this.troyGate)) > 0.13) return true;
        }
        return false;
    }
    /* ---------- input: keyboard, mouse, sentuh ---------- */
    _input() {
        const el = this.g.renderer.domElement;
        addEventListener('keydown', (e) => {
            if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
            this.keys.add(e.code);
            if (this.g.mode === 'world' && !this.paused) {
                if (e.code === 'KeyE' || e.code === 'Enter') this.interact();
                if (e.code === 'KeyF') this.toggleFly();
                if (e.code === 'Space') { e.preventDefault(); this.jump(); }
            }
        });
        addEventListener('keyup', (e) => this.keys.delete(e.code));
        addEventListener('blur', () => this.keys.clear());
        let drag = null;
        el.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') return; drag = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); });
        el.addEventListener('pointermove', (e) => {
            if (!drag) return;
            this.cam.yaw -= (e.clientX - drag.x) * 0.006;
            this.cam.pitch = clamp(this.cam.pitch + (e.clientY - drag.y) * 0.004, -0.15, 1.2);
            drag = { x: e.clientX, y: e.clientY };
        });
        el.addEventListener('pointerup', () => { drag = null; });
        el.addEventListener('wheel', (e) => { this.cam.dist = clamp(this.cam.dist + e.deltaY * 0.01, 4, 26); }, { passive: true });
        // sentuh: joystick kiri, seret kanan untuk kamera
        const stick = $('stick'), knob = $('stick-knob');
        let sid = null, so = null;
        stick.addEventListener('pointerdown', (e) => { sid = e.pointerId; const r = stick.getBoundingClientRect(); so = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; stick.setPointerCapture(e.pointerId); });
        stick.addEventListener('pointermove', (e) => {
            if (e.pointerId !== sid) return;
            let dx = e.clientX - so.x, dy = e.clientY - so.y; const L = Math.hypot(dx, dy), m = 46;
            if (L > m) { dx *= m / L; dy *= m / L; }
            knob.style.transform = `translate(${dx}px, ${dy}px)`;
            this.stick.x = dx / m; this.stick.y = dy / m;
        });
        const endStick = () => { sid = null; knob.style.transform = ''; this.stick.x = this.stick.y = 0; };
        stick.addEventListener('pointerup', endStick); stick.addEventListener('pointercancel', endStick);
        let cid = null, cp = null;
        el.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch' || cid !== null) return; cid = e.pointerId; cp = { x: e.clientX, y: e.clientY }; });
        el.addEventListener('pointermove', (e) => {
            if (e.pointerId !== cid) return;
            this.cam.yaw -= (e.clientX - cp.x) * 0.008; this.cam.pitch = clamp(this.cam.pitch + (e.clientY - cp.y) * 0.005, -0.15, 1.2);
            cp = { x: e.clientX, y: e.clientY };
        });
        const endCam = (e) => { if (e.pointerId === cid) cid = null; };
        el.addEventListener('pointerup', endCam); el.addEventListener('pointercancel', endCam);
        $('t-act').addEventListener('click', () => this.interact());
        $('t-jump').addEventListener('click', () => this.jump());
        $('t-run').addEventListener('click', () => { this.runToggle = !this.runToggle; $('t-run').classList.toggle('on', this.runToggle); });
        $('t-fly').addEventListener('click', () => this.toggleFly());
        const hold = (id, key) => { const b = $(id); b.addEventListener('pointerdown', () => { this[key] = true; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, () => { this[key] = false; })); };
        hold('t-jump', 'flyUp'); hold('t-down', 'flyDown');
    }
    jump() { const P = this.player; if (this.flying) return; if (P.grounded) { P.vy = 8.5; P.grounded = false; this.playerBH.play('Jump', { loop: false }); this.g.audio.boop(); } }
    toggleFly(force) {
        const on = force !== undefined ? force : !this.flying;
        if (on && this.g.data.mode !== 'explore') { this.g.ui.toast('🕊️ Sayap Hermes hanya bisa dipakai di <b>Mode Jelajah</b>.'); return; }
        if (on === !!this.flying) return;
        this.flying = on;
        if (this.wings) this.wings.visible = on;
        this.cam.dist = on ? Math.max(this.cam.dist, 13) : Math.min(this.cam.dist, 10);
        $('t-fly')?.classList.toggle('on', on);
        $('t-down')?.classList.toggle('hidden', !on);
        if (on) { this.player.pos.y += 2.5; this.g.ui.toast('🕊️ <b>Sayap Hermes</b> aktif! Spasi = naik · C = turun · Shift = melesat · F = mendarat'); this.g.audio.swoosh(); }
        else { this.player.vy = 0; this.g.ui.toast('🪶 Mendarat perlahan…'); this.playerBH.play('Idle'); }
    }
    interact() {
        if (this.paused || this.g.mode !== 'world') return;
        const n = this.nearNpc;
        if (!n) return;
        if (this.g.data.mode === 'explore') this.g.meet(n.hero, n);
        else this.g.challenge(n.hero, n);
    }
    /* ---------- kamera third-person ---------- */
    camTarget() { return this.player.pos.clone().add(new T.Vector3(0, 1.7, 0)); }
    camDesired() {
        const t = this.camTarget(), c = this.cam;
        const off = new T.Vector3(Math.sin(c.yaw) * Math.cos(c.pitch), Math.sin(c.pitch), Math.cos(c.yaw) * Math.cos(c.pitch)).multiplyScalar(c.dist);
        const p = t.clone().add(off);
        const gh = Terrain.height(p.x, p.z) + 1.2;
        if (p.y < gh) p.y = gh;
        return p;
    }
    snapCamera() { this.camera.position.copy(this.camDesired()); this.camera.lookAt(this.camTarget()); }
    /* ---------- loop ---------- */
    update(dt, time) {
        const P = this.player, data = this.g.data;
        if (!this.paused) {
            // gerak relatif terhadap kamera
            let ix = 0, iz = 0;
            const k = this.keys;
            if (k.has('KeyW') || k.has('ArrowUp')) iz -= 1;
            if (k.has('KeyS') || k.has('ArrowDown')) iz += 1;
            if (k.has('KeyA') || k.has('ArrowLeft')) ix -= 1;
            if (k.has('KeyD') || k.has('ArrowRight')) ix += 1;
            ix += this.stick.x; iz += this.stick.y;
            const len = Math.hypot(ix, iz);
            const running = k.has('ShiftLeft') || k.has('ShiftRight') || this.runToggle || Math.hypot(this.stick.x, this.stick.y) > 0.92;
            if (len > 0.12) {
                ix /= Math.max(1, len); iz /= Math.max(1, len);
                const cy = this.cam.yaw;
                // maju = menjauhi kamera
                const wx = ix * Math.cos(cy) + iz * Math.sin(cy), wz = -ix * Math.sin(cy) + iz * Math.cos(cy);
                const speed = (this.flying ? (running ? 52 : 28) : (running ? 12 : 6.5)) * Math.min(1, len);
                const nx = P.pos.x + wx * speed * dt, nz = P.pos.z + wz * speed * dt;
                if (this.flying) { if (Math.hypot(nx, nz) < ISLAND_R + 140) { P.pos.x = nx; P.pos.z = nz; } }
                else if (!this.blocked(P.pos.x, P.pos.z, nx, nz)) { P.pos.x = nx; P.pos.z = nz; }
                else if (!this.blocked(P.pos.x, P.pos.z, nx, P.pos.z)) P.pos.x = nx;
                else if (!this.blocked(P.pos.x, P.pos.z, P.pos.x, nz)) P.pos.z = nz;
                const want = Math.atan2(wx, wz);
                P.yaw += angDiff(P.yaw, want) * Math.min(1, dt * 12);
                if (P.grounded && !this.flying) {
                    const anim = running ? 'Run' : 'Walk';
                    if (this.playerBH.anim !== anim) this.playerBH.play(anim);
                    this.stepT = (this.stepT || 0) - dt; if (this.stepT <= 0) { this.stepT = running ? 0.28 : 0.42; this.g.audio.step(); }
                }
            } else if (P.grounded && !this.flying && (this.playerBH.anim === 'Run' || this.playerBH.anim === 'Walk')) this.playerBH.play('Idle');
            const gh = Terrain.height(P.pos.x, P.pos.z);
            if (this.flying) {
                // terbang: Spasi naik, C/Ctrl turun
                const up = (k.has('Space') || this.flyUp) ? 1 : 0, down = (k.has('KeyC') || k.has('ControlLeft') || k.has('KeyQ') || this.flyDown) ? 1 : 0;
                P.pos.y = clamp(P.pos.y + (up - down) * 20 * dt, Math.max(gh, 0.4) + 0.6, 175);
                P.vy = 0; P.grounded = false;
                if (this.playerBH.anim !== 'Fly') this.playerBH.play('Fly');
                if (this.wings) { const f = Math.sin(time * (len > 0.12 ? 9 : 4)) * 0.45; this.wings.children[0].rotation.y = 0.35 + f; this.wings.children[1].rotation.y = -0.35 - f; }
            } else {
                // gravitasi & lompat
                P.vy -= 24 * dt; P.pos.y += P.vy * dt;
                if (P.pos.y <= gh) { P.pos.y = gh; P.vy = 0; if (!P.grounded) { P.grounded = true; this.playerBH.play('Idle'); } }
            }
            P.safe = Math.max(0, P.safe - dt);
        }
        this.playerBH.root.position.copy(P.pos);
        this.playerBH.root.rotation.y = P.yaw;
        this.playerBH.update(dt);
        // kamera mengikuti dengan halus
        const want = this.camDesired();
        this.camera.position.lerp(want, Math.min(1, dt * 7));
        this.camera.lookAt(this.camTarget());
        this.sun.position.set(P.pos.x + 60, P.pos.y + 120, P.pos.z + 40); this.sun.target.position.copy(P.pos);
        this.skyDome.position.copy(this.camera.position);
        // awan & api unggun
        this.clouds.children.forEach((c, i) => { if (c.userData.olympus !== undefined) { const a = c.userData.olympus + time * 0.05; c.position.x = Math.cos(a) * 34; c.position.z = -205 + Math.sin(a) * 34; } else c.position.x += Math.sin(i) * dt * 0.8; });
        (this._fires || []).forEach((f, i) => { f.scale.y = 1 + Math.sin(time * 9 + i) * 0.25; });
        // NPC
        this.updateNpcs(dt, time);
        // wilayah
        this.regionT = (this.regionT || 0) - dt;
        if (this.regionT <= 0) { this.regionT = 0.5; this.checkRegion(); this.g.ui.drawMinimap(); }
        this.g.ui.updateLabels();
    }
    updateNpcs(dt, time) {
        const P = this.player, data = this.g.data, battle = data.mode === 'battle';
        let near = null, nearD = 5.5;
        for (const n of this.npcs) {
            const dx = P.pos.x - n.pos.x, dz = P.pos.z - n.pos.z;
            n.dist = Math.hypot(dx, dz, (P.pos.y - n.pos.y) * 1.5);
            const cp = this.camera.position, cdx = cp.x - n.pos.x, cdy = cp.y - n.pos.y - 1.2, cdz = cp.z - n.pos.z;
            const vis = n.dist < 230 && (cdx * cdx + cdy * cdy + cdz * cdz) > 2.9; // sembunyikan tokoh yang menempel di lensa kamera
            n.bh.root.visible = vis;
            if (!vis) continue;
            n.cooldown = Math.max(0, n.cooldown - dt);
            const got = data.isCollected(n.hero.id);
            const active = n.dist < 140;
            if (!active) continue;
            // keputusan perilaku
            const canChase = battle && n.aggressive && !got && n.cooldown <= 0 && P.safe <= 0 && !this.paused;
            if (canChase && (n.state === 'chase' ? n.dist < 34 : n.dist < 17)) {
                if (n.state !== 'chase') { n.state = 'chase'; this.g.ui.toast(`⚠️ <b>${esc(n.hero.nama)}</b> melihatmu dan datang menantang!`); this.g.audio.alarm(); }
            } else if (n.state === 'chase') { n.state = 'idle'; n.timer = 2; }
            if (n.state !== 'chase' && n.dist < 6.5 && !this.paused) n.state = 'greet';
            else if (n.state === 'greet' && n.dist >= 6.5) { n.state = 'idle'; n.timer = rand(1, 3); }
            let moving = 0;
            if (n.state === 'chase') {
                n.yaw = Math.atan2(dx, dz);
                const sp = 8.2 * dt, nx = n.pos.x + Math.sin(n.yaw) * sp, nz = n.pos.z + Math.cos(n.yaw) * sp;
                if (!this.blocked(n.pos.x, n.pos.z, nx, nz)) { n.pos.x = nx; n.pos.z = nz; }
                moving = 2;
                if (n.dist < 2.3) { n.state = 'idle'; this.g.challenge(n.hero, n, true); }
            } else if (n.state === 'greet') {
                const want = Math.atan2(dx, dz); n.yaw += angDiff(n.yaw, want) * Math.min(1, dt * 6);
                if (n.dist < nearD) { near = n; nearD = n.dist; }
            } else {
                n.timer -= dt;
                if (n.state === 'walk' && n.target) {
                    const tx = n.target.x - n.pos.x, tz = n.target.z - n.pos.z, d = Math.hypot(tx, tz);
                    if (d < 0.6 || n.timer <= 0) { n.state = 'idle'; n.timer = rand(2, 7); }
                    else {
                        const want = Math.atan2(tx, tz); n.yaw += angDiff(n.yaw, want) * Math.min(1, dt * 5);
                        const sp = 2.3 * dt, nx = n.pos.x + Math.sin(n.yaw) * sp, nz = n.pos.z + Math.cos(n.yaw) * sp;
                        if (!this.blocked(n.pos.x, n.pos.z, nx, nz)) { n.pos.x = nx; n.pos.z = nz; moving = 1; } else { n.state = 'idle'; n.timer = rand(1, 3); }
                    }
                } else if (n.timer <= 0) {
                    const a = rand(0, Math.PI * 2), r = rand(3, n.wanderR);
                    const tx = n.home.x + Math.cos(a) * r, tz = n.home.z + Math.sin(a) * r;
                    if (Terrain.land(tx, tz)) { n.target = { x: tx, z: tz }; n.state = 'walk'; n.timer = 14; }
                    else n.timer = 1;
                }
            }
            n.pos.y = Terrain.height(n.pos.x, n.pos.z);
            const anim = moving === 2 ? 'Run' : moving === 1 ? 'Walk' : (n.state === 'greet' ? 'Idle2' : 'Idle');
            if (n.bh.anim !== anim && !(n.bh.anim === 'Cast' && n.bh.t < 1)) n.bh.play(anim);
            if (n.state === 'greet' && n.greetT !== n.hero.id) { n.greetT = n.hero.id; n.bh.play('Cast', { loop: false }); this.g.audio.swoosh(); }
            if (n.state !== 'greet') n.greetT = null;
            n.bh.root.position.copy(n.pos);
            n.bh.root.rotation.y = n.yaw;
            if (n.dist < 70) n.bh.update(dt);
        }
        if (near !== this.nearNpc) { this.nearNpc = near; this.g.ui.showLore(near ? near.hero : null); }
    }
    checkRegion() {
        const P = this.player.pos;
        let best = null, bd = 1e9;
        for (const [k, r] of Object.entries(REGIONS)) { const d = Math.hypot(P.x - r.x, P.z - r.z); if (d < r.r + 15 && d < bd) { bd = d; best = k; } }
        if (!best && Math.hypot(P.x - SPAWN.x, P.z - SPAWN.z) < 25) best = 'spawn';
        if (best !== this.region) {
            this.region = best;
            if (best) {
                const r = best === 'spawn' ? { name: 'Persimpangan', sub: 'Pusat pulau' } : REGIONS[best];
                this.g.ui.banner(r.name, r.sub);
            }
        }
        // simpan posisi sesekali
        this.saveT = (this.saveT || 0) + 1;
        if (this.saveT % 10 === 0) { this.g.data.state.pos = { x: Math.round(P.x), z: Math.round(P.z) }; this.g.data.save(); }
    }
    _minimapBg() {
        const S = 180, c = document.createElement('canvas'); c.width = c.height = S;
        const g = c.getContext('2d'), img = g.createImageData(S, S);
        for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
            const x = (i / S - 0.5) * 2 * (ISLAND_R + 20), z = (j / S - 0.5) * 2 * (ISLAND_R + 20), h = Terrain.height(x, z);
            let col = h < 0.9 ? [79, 200, 255] : h < 1.6 ? [255, 227, 163] : h > 55 ? [255, 255, 255] : h > 22 ? [199, 179, 255] : [130, 220, 140];
            if (h >= 1.6 && Math.hypot(x - TROY.x, z - TROY.z) < 34) col = [232, 196, 138];
            const o = (j * S + i) * 4; img.data[o] = col[0]; img.data[o + 1] = col[1]; img.data[o + 2] = col[2]; img.data[o + 3] = 255;
        }
        g.putImageData(img, 0, 0);
        this.minimapBg = c;
    }
    pause(p) { this.paused = p; if (p) { this.keys.clear(); this.stick.x = this.stick.y = 0; } }
    resize() { this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); }
}

/* =====================================================================
   BattleEngine — duel 3D gaya Pokémon
   Aturan Kharisma: setelah memakai berkah dewa, giliran berikutnya DILEWATI (seperti potion)
   ===================================================================== */
class BattleEngine {
    constructor(game) {
        this.g = game;
        this.scene = new T.Scene();
        this.camera = new T.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 200);
        this.camBase = new T.Vector3(0, 2.1, 7.2);
        this.look = new T.Vector3(0, 1.15, 0);
        this.camOffset = new T.Vector3();
        this.shakeT = 0;
        this.busy = false;
        this.fighters = [null, null];
        this._build();
    }
    _build() {
        const s = this.scene, toon = (c) => new T.MeshToonMaterial({ color: c, gradientMap: this.g.gradient });
        this.hemi = new T.HemisphereLight('#fff4e6', '#6a4cff', 1.4); s.add(this.hemi);
        this.key = new T.DirectionalLight('#fff1d6', 2.6);
        this.key.position.set(4, 9, 6); this.key.castShadow = true;
        this.key.shadow.mapSize.set(1024, 1024);
        Object.assign(this.key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 });
        s.add(this.key);
        this.rim = new T.PointLight('#ff9f5a', 30, 30); this.rim.position.set(0, 4, -5); s.add(this.rim);
        const ground = new T.Mesh(new T.CylinderGeometry(9, 10, 0.8, 28), toon('#ffe3a3'));
        ground.position.y = -0.4; ground.receiveShadow = true; s.add(ground);
        const ring = new T.Mesh(new T.CylinderGeometry(5.2, 5.2, 0.05, 40), toon('#ffcf8a')); ring.position.y = 0.03; ring.receiveShadow = true; s.add(ring);
        const inner = new T.Mesh(new T.TorusGeometry(5.2, 0.12, 6, 48), toon('#ff8fa3')); inner.rotation.x = Math.PI / 2; inner.position.y = 0.08; s.add(inner);
        const colG = new T.CylinderGeometry(0.35, 0.42, 1, 7), capG = new T.BoxGeometry(1, 0.3, 1);
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2 + 0.13, h = [3.6, 2.2, 4.2, 1.4, 3.1, 2.7][i % 6];
            if (Math.abs(Math.sin(a)) < 0.25 && Math.cos(a) > 0) continue;
            const c = new T.Mesh(colG, toon('#fff6e6')); c.scale.y = h; c.position.set(Math.cos(a) * 8, h / 2, Math.sin(a) * 8 - 1); c.castShadow = true;
            const cap = new T.Mesh(capG, toon('#ffe0b3')); cap.position.set(c.position.x, h + 0.15, c.position.z);
            s.add(c, cap);
        }
        const N = 260, pos = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) { pos[i * 3] = rand(-12, 12); pos[i * 3 + 1] = rand(0, 10); pos[i * 3 + 2] = rand(-10, 6); }
        const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3));
        this.particles = new T.Points(pg, new T.PointsMaterial({ color: '#ffe9a8', size: 0.09, transparent: true, opacity: 0.85, depthWrite: false }));
        s.add(this.particles);
        this.burstMat = new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide });
        this.burst = new T.Mesh(new T.TorusGeometry(1, 0.08, 6, 32), this.burstMat); this.burst.rotation.x = Math.PI / 2; s.add(this.burst);
        this.wardMat = new T.MeshBasicMaterial({ color: '#6fffc2', transparent: true, opacity: 0, depthWrite: false });
        this.ward = new T.Mesh(new T.SphereGeometry(1.25, 16, 12), this.wardMat); s.add(this.ward);
    }
    theme(name) {
        const th = ARENA_THEMES[name] || ARENA_THEMES.arena;
        document.querySelector('.sky').style.background = th.sky;
        this.key.color.set(th.light); this.rim.color.set(th.rim); this.particles.material.color.set(th.particle);
        return th;
    }
    async start(playerHero, enemyHero) {
        this.over = false;
        const mk = (h, idx, side) => {
            const old = this.fighters[idx];
            if (old) { this.scene.remove(old.root); old.dispose(); }
            const f = this.fighters[idx] = new BlockHero(h, { shadows: true });
            this.scene.add(f.root);
            f.root.position.set(side * 2.3, 0, 0);
            f.root.rotation.set(0, side < 0 ? Math.PI / 2 - 0.45 : -Math.PI / 2 + 0.45, 0);
            f.home = f.root.position.clone(); f.homeRot = f.root.rotation.y;
            f.play('Idle');
            return { hero: h, f, side, maxHp: h.hp_base, hp: h.hp_base, st: 50, regen: Math.max(12, h.stamina_regen), dodge: false, block: false, ward: 0, rage: false, ultUsed: false, kcd: 0, recover: false };
        };
        this.p = mk(playerHero, 0, -1);
        this.e = mk(enemyHero, 1, 1);
        this.round = 1;
        this.camera.position.copy(this.camBase).add(new T.Vector3(0, 1.5, 4));
        this.theme('arena');
        this.g.ui.buildDuel(this.p, this.e);
        this.g.ui.log(`<b>${esc(enemyHero.nama)}</b> siap bertarung! ${STANCE_ICON[enemyHero.combat_stance]} ${enemyHero.combat_stance} · ${ELEMENT_ICON(enemyHero.elemen)} ${enemyHero.elemen}`);
        const icon = this.g.data.iconic(playerHero, enemyHero);
        if (icon) {
            this.theme(icon.theme);
            this.key.intensity = 4.2; this.rim.intensity = 90;
            this.g.audio.thunder(); this.g.shake();
            await this.g.ui.cutscene(icon);
        } else { this.key.intensity = 2.6; this.rim.intensity = 30; }
        this.matchupHint();
        this.playerTurn();
    }
    matchupHint() {
        const a = this.p.hero, b = this.e.hero, notes = [];
        if (STANCE_BEATS[a.combat_stance] === b.combat_stance) notes.push('Stance-mu unggul (×1.5)');
        if (STANCE_BEATS[b.combat_stance] === a.combat_stance) notes.push('Stance lawan unggul atasmu');
        if ((a.kuat_melawan || []).includes(b.id)) notes.push(`Dalam mitos, ${a.nama} mengalahkan ${b.nama} (×1.2)`);
        if ((a.lemah_melawan || []).includes(b.id)) notes.push(`Dalam mitos, ${b.nama} mengungguli ${a.nama}`);
        if (notes.length) this.g.ui.log(notes.join(' · '));
    }
    /** Mulai giliran: regen stamina; kalau baru saja memakai Kharisma, giliran ini dilewati */
    async beginTurn(u) {
        u.dodge = false; u.block = false;
        if (this.round > 1 || u === this.e) u.st = Math.min(100, u.st + u.regen);
        if (u.kcd > 0) u.kcd--;
        if (u.recover) {
            u.recover = false;
            this.g.ui.updateDuel(this.p, this.e, false, this.round);
            this.g.ui.log(`😮‍💨 <b>${esc(u.hero.nama)}</b> masih memulihkan diri setelah menerima berkah — giliran dilewati.`);
            this.g.ui.float(u, 'MEMULIHKAN DIRI…', 'info');
            u.f.play('Idle2');
            await Tweens.wait(1.4);
            return false;
        }
        return true;
    }
    async playerTurn() {
        if (this.over) return;
        this.busy = true;
        const canAct = await this.beginTurn(this.p);
        if (!canAct) { await this.enemyTurn(); return; }
        this.busy = false;
        this.g.ui.updateDuel(this.p, this.e, true, this.round);
    }
    canUse(u, slot) {
        if (slot === 3 && this.ultReady(u)) return true;
        if (slot === 3) return u.kcd === 0;
        return u.st >= SKILL_COST[slot];
    }
    ultReady(u) { return !u.ultUsed && u.hp / u.maxHp < 0.2; }
    async playerAct(slot) {
        if (this.busy || this.over || !this.canUse(this.p, slot)) return;
        this.busy = true;
        this.g.audio.beep();
        this.g.ui.updateDuel(this.p, this.e, false, this.round);
        await this.act(this.p, this.e, slot);
        if (this.over) return;
        await Tweens.wait(0.35);
        await this.enemyTurn();
    }
    async enemyTurn() {
        if (this.over) return;
        const e = this.e;
        this.g.ui.updateDuel(this.p, this.e, false, this.round);
        const canAct = await this.beginTurn(e);
        if (canAct) {
            this.g.ui.updateDuel(this.p, this.e, false, this.round);
            await Tweens.wait(0.55);
            await this.act(e, this.p, this.ai());
            if (this.over) return;
        }
        this.round++;
        await Tweens.wait(0.25);
        this.playerTurn();
    }
    ai() {
        const e = this.e, p = this.p;
        if (this.ultReady(e)) return 3;
        const w = [0, 0, 0, 0];
        if (e.st >= SKILL_COST[0]) w[0] = 3 + (p.hp / p.maxHp < 0.3 ? 2 : 0) + (e.hero.combat_stance === 'Aggressive' ? 1.5 : 0) + (p.recover ? 3 : 0);
        if (e.st >= SKILL_COST[1]) w[1] = 2 + (e.hero.combat_stance === 'Evasive' ? 1.5 : 0);
        if (e.st >= SKILL_COST[2]) w[2] = 1.2 + (p.st >= SKILL_COST[0] ? 1.4 : 0) + (e.hero.combat_stance === 'Technical' ? 1.2 : 0);
        if (e.kcd === 0) w[3] = e.hp / e.maxHp < 0.4 ? 2.4 : (e.st < 25 ? 1.2 : 0.2);
        const sum = w.reduce((a, b) => a + b, 0);
        if (sum <= 0) return 2;
        let r = Math.random() * sum;
        for (let i = 0; i < 4; i++) { r -= w[i]; if (r <= 0) return i; }
        return 0;
    }
    calc(att, def, kind) {
        const A = att.hero, D = def.hero;
        let base;
        if (kind === 'power') base = 70 + A.kekuatan * 1.25;
        else if (kind === 'speed') base = 30 + A.kecepatan * 0.6;
        else base = (90 + A.kekuatan * 1.4 + A.taktik * 0.4) * 1.55;
        let mult = 1; const tags = [];
        if (STANCE_BEATS[A.combat_stance] === D.combat_stance) { mult *= 1.5; tags.push('Stance unggul!'); }
        const elA = this.g.data.elemen[A.elemen];
        if (elA && elA.kuat_ke === D.elemen) { mult *= 1.25; tags.push(`${A.elemen} ▶ ${D.elemen}`); }
        if ((A.kuat_melawan || []).includes(D.id)) { mult *= 1.2; tags.push('Sesuai mitos!'); }
        if ((A.lemah_melawan || []).includes(D.id)) mult *= 0.85;
        if (att.rage) { mult *= 1.3; att.rage = false; tags.push('Amarah Api'); }
        if (def.recover) { mult *= 1.15; tags.push('Lawan lengah'); }
        mult *= 1 - D.taktik * 0.0015;
        let crit = false;
        if (kind !== 'ult' && Math.random() < A.taktik / 650) { mult *= 1.5; crit = true; }
        if (att === this.e) mult *= 0.92;
        return { dmg: Math.round(base * mult * rand(0.9, 1.1)), crit, tags };
    }
    async act(u, t, slot) {
        const ult = slot === 3 && this.ultReady(u);
        const sk = u.hero.skills[slot];
        if (ult) {
            u.ultUsed = true;
            this.g.ui.log(`🔥 <b>${esc(u.hero.nama)}</b> mengeluarkan ULTIMATE: <b>${esc(u.hero.ultimate.nama)}</b>!`);
            await this.doUltimate(u, t);
        } else if (slot === 0) {
            u.st -= SKILL_COST[0];
            this.g.ui.log(`⚔️ <b>${esc(u.hero.nama)}</b> — ${esc(sk.nama)}`);
            await this.doStrike(u, t, 'power');
        } else if (slot === 1) {
            u.st -= SKILL_COST[1];
            this.g.ui.log(`⚡ <b>${esc(u.hero.nama)}</b> — ${esc(sk.nama)} (siap menghindar 50%)`);
            await this.doStrike(u, t, 'speed');
            u.dodge = true;
        } else if (slot === 2) {
            u.st -= SKILL_COST[2];
            u.block = true;
            this.g.ui.log(`🛡️ <b>${esc(u.hero.nama)}</b> — ${esc(sk.nama)}: bertahan & siap membalas serangan Kekuatan`);
            this.g.audio.clang();
            u.f.play('Block', { loop: false, clamp: true, timeScale: 0.8 });
            this.flashWard(u, '#6fffc2');
            await Tweens.wait(0.8);
        } else {
            u.kcd = 2;
            u.recover = true;
            await this.doPatron(u, sk);
        }
        this.g.ui.updateDuel(this.p, this.e, false, this.round);
        await this.checkEnd();
    }
    async moveTo(u, target, dur) {
        const from = u.f.root.position.clone();
        const d = target.clone().sub(from);
        if (d.lengthSq() > 0.01) u.f.root.rotation.y = Math.atan2(d.x, d.z);
        await Tweens.add(dur, (k) => u.f.root.position.lerpVectors(from, target, ease(k)));
    }
    async doStrike(u, t, kind) {
        const dir = Math.sign(t.f.home.x - u.f.home.x);
        const near = t.f.root.position.clone().add(new T.Vector3(-dir * 1.25, 0, 0));
        this.camShift(u.side * 0.8);
        u.f.play('Run', { timeScale: kind === 'speed' ? 1.6 : 1.2 });
        this.g.audio.swoosh();
        await this.moveTo(u, near, kind === 'speed' ? 0.3 : 0.45);
        const dur = u.f.play(kind === 'speed' ? 'Kick' : 'Attack', { loop: false, clamp: true, timeScale: kind === 'speed' ? 1.5 : 1.45 });
        await Tweens.wait(dur * (kind === 'speed' ? 0.42 : 0.55));
        this.g.audio.whiff();
        await this.resolveHit(u, t, kind);
        await Tweens.wait(dur * 0.35);
        u.f.play('Run', { timeScale: 1.4 });
        await this.moveTo(u, u.f.home, 0.4);
        u.f.root.rotation.y = u.f.homeRot;
        u.f.play('Idle');
        this.camShift(0);
    }
    async resolveHit(u, t, kind) {
        const { dmg, crit, tags } = this.calc(u, t, kind);
        if (t.dodge && kind !== 'ult' && Math.random() < 0.5) {
            t.f.play('Jump', { loop: false, timeScale: 1.6 });
            this.g.audio.whiff();
            this.g.ui.float(t, 'MELESET!', 'info');
            this.g.ui.log(`💨 <b>${esc(t.hero.nama)}</b> berhasil menghindar!`);
            await Tweens.wait(0.5);
            return;
        }
        let final = dmg;
        if (t.block && kind !== 'ult') {
            final = Math.round(dmg * 0.4);
            this.g.audio.clang();
            t.f.play('Block', { loop: false, timeScale: 1.2 });
            if (kind === 'power') {
                const counter = Math.round(dmg * 0.5 * (0.6 + t.hero.taktik / 250));
                u.hp = Math.max(0, u.hp - counter);
                setTimeout(() => { this.g.ui.float(u, `-${counter} BALASAN`, 'crit'); this.g.audio.crunch(); u.f.play('Hit', { loop: false, timeScale: 1.2 }); }, 250);
                this.g.ui.log(`🛡️ <b>${esc(t.hero.nama)}</b> menangkis dan membalas ${counter} damage!`);
            }
        } else t.f.play('Hit', { loop: false, timeScale: 1.1 });
        if (t.ward > 0) { final = Math.round(final * 0.7); t.ward--; }
        t.hp = Math.max(0, t.hp - final);
        this.g.audio.crunch();
        this.shakeT = crit || kind === 'ult' ? 0.5 : 0.22;
        if (crit || kind === 'ult') this.g.shake();
        this.g.ui.float(t, `-${final}`, crit ? 'crit' : 'dmg');
        if (tags.length) setTimeout(() => this.g.ui.float(t, tags.join(' · '), 'info', 0.6), 200);
        this.g.ui.updateDuel(this.p, this.e, false, this.round);
    }
    async doPatron(u, sk) {
        const h = u.hero, el = h.elemen, cha = 0.6 + h.kepemimpinan / 250;
        const heal = (pct) => { const v = Math.round(u.maxHp * pct * cha); u.hp = Math.min(u.maxHp, u.hp + v); return v; };
        let msg, hv = 0;
        if (el === 'Petir') { u.st = Math.min(100, u.st + 45); hv = heal(0.08); msg = '+45 stamina'; }
        else if (el === 'Api') { u.st = Math.min(100, u.st + 25); u.rage = true; hv = heal(0.08); msg = 'serangan berikutnya ×1.3'; }
        else if (el === 'Air') { u.st = Math.min(100, u.st + 10); hv = heal(0.2); msg = 'pemulihan besar'; }
        else { u.st = Math.min(100, u.st + 15); u.ward = 2; hv = heal(0.12); msg = '2 serangan berikutnya −30%'; }
        this.g.ui.log(`✨ <b>${esc(h.nama)}</b> — ${esc(sk.nama)} · ${msg}. Giliran berikutnya ${esc(h.nama)} diam memulihkan diri.`);
        const dur = u.f.play('PowerUp', { loop: false, clamp: true, timeScale: 1.3 });
        this.g.audio.power();
        this.burstFx(u, this.g.data.elemen[el]?.warna || '#ffffff');
        await Tweens.wait(dur * 0.45);
        this.g.audio.heal();
        if (hv) this.g.ui.float(u, `+${hv}`, 'heal');
        if (el === 'Bumi') this.flashWard(u, '#6fdc8c');
        await Tweens.wait(dur * 0.4);
        u.f.play('Idle');
    }
    async doUltimate(u, t) {
        this.g.audio.ultimate();
        const fade = $('fade'); fade.classList.add('red', 'on');
        setTimeout(() => fade.classList.remove('on'), 160);
        setTimeout(() => fade.classList.remove('red'), 700);
        this.key.intensity = 5; this.rim.intensity = 120; this.rim.color.set('#ff2a55');
        const R = 7;
        this.ultCam = true;
        const spin = Tweens.add(2.4, (k) => {
            const a = ease(k) * Math.PI * 1.1 * -u.side;
            this.camera.position.set(Math.sin(a) * R * 0.8 + u.side * 0.5, 1.4 + Math.sin(k * Math.PI) * 1.8, Math.cos(a) * R);
            this.camera.lookAt(0, 1.2, 0);
        });
        this.burstFx(u, '#ff2a55');
        u.f.play('PowerUp', { loop: false, timeScale: 2 });
        await Tweens.wait(0.6);
        const dir = Math.sign(t.f.home.x - u.f.home.x);
        u.f.play('Run', { timeScale: 1.8 });
        await this.moveTo(u, t.f.root.position.clone().add(new T.Vector3(-dir * 1.2, 0, 0)), 0.3);
        const dur = u.f.play('Attack2', { loop: false, clamp: true, timeScale: 1.7 });
        await Tweens.wait(dur * 0.5);
        await this.resolveHit(u, t, 'ult');
        await spin;
        this.ultCam = false;
        u.f.play('Run', { timeScale: 1.4 });
        await this.moveTo(u, u.f.home, 0.4);
        u.f.root.rotation.y = u.f.homeRot; u.f.play('Idle');
        this.key.intensity = 2.6; this.rim.intensity = 30;
    }
    burstFx(u, color) {
        this.burstMat.color.set(color);
        this.burst.position.set(u.f.root.position.x, 0.15, u.f.root.position.z);
        Tweens.add(0.9, (k) => { this.burst.scale.setScalar(0.4 + k * 3.2); this.burstMat.opacity = (1 - k) * 0.9; this.burst.position.y = 0.15 + k * 1.6; });
    }
    flashWard(u, color) {
        this.wardMat.color.set(color);
        this.ward.position.set(u.f.root.position.x, 1, u.f.root.position.z);
        Tweens.add(0.9, (k) => { this.ward.scale.setScalar(0.8 + k * 0.4); this.wardMat.opacity = Math.sin(k * Math.PI) * 0.35; });
    }
    camShift(x) { const from = this.camOffset.x; Tweens.add(0.5, (k) => { this.camOffset.x = lerp(from, x, ease(k)); }); }
    async checkEnd() {
        if (this.over) return;
        const loser = this.p.hp <= 0 ? this.p : (this.e.hp <= 0 ? this.e : null);
        if (!loser) return;
        this.over = true; this.busy = true;
        const winner = loser === this.p ? this.e : this.p;
        await Tweens.wait(0.4);
        loser.f.play('Death', { loop: false, clamp: true });
        this.g.audio.crunch();
        await Tweens.wait(1.6);
        winner.f.play('Cast', { loop: false, clamp: true });
        await Tweens.wait(1.2);
        this.g.duelOver(winner === this.p);
    }
    update(dt, time) {
        this.fighters.forEach((f) => f && f.update(dt));
        this.particles.rotation.y += dt * 0.05;
        this.particles.position.y = Math.sin(time * 0.4) * 0.3;
        if (!this.ultCam) {
            const sway = new T.Vector3(Math.sin(time * 0.35) * 0.35, Math.sin(time * 0.5) * 0.12, 0);
            const target = this.camBase.clone().add(this.camOffset).add(sway);
            this.camera.position.lerp(target, Math.min(1, dt * 2.5));
            if (this.shakeT > 0) { this.shakeT -= dt; this.camera.position.x += rand(-0.08, 0.08); this.camera.position.y += rand(-0.06, 0.06); }
            this.camera.lookAt(this.look);
        }
    }
    head(u) { return u.f.root.position.clone().add(new T.Vector3(0, 2.6 * u.f.baseScale, 0)); }
    resize() { this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); const narrow = innerWidth < innerHeight; this.camBase.set(0, narrow ? 2.8 : 2.1, narrow ? 11.5 : 7.2); }
}

/* =====================================================================
   EndingEngine — The Ultimate Legacy (semua tokoh terkumpul)
   ===================================================================== */
class EndingEngine {
    constructor(game) {
        this.g = game;
        this.scene = new T.Scene();
        this.camera = new T.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 400);
        this.scene.add(new T.HemisphereLight('#ffffff', '#5a3cff', 1.6));
        const k = new T.DirectionalLight('#ffe9c6', 2.5); k.position.set(3, 6, 5); this.scene.add(k);
        const N = 3500, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), c = new T.Color();
        for (let i = 0; i < N; i++) {
            const v = new T.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize().multiplyScalar(rand(12, 120));
            pos.set([v.x, v.y, v.z], i * 3);
            c.set(['#ffffff', '#ffd6f5', '#bfe9ff', '#fff2b3'][i % 4]); col.set([c.r, c.g, c.b], i * 3);
        }
        const g = new T.BufferGeometry();
        g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('color', new T.BufferAttribute(col, 3));
        this.stars = new T.Points(g, new T.PointsMaterial({ size: 0.35, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }));
        this.scene.add(this.stars);
        const disc = new T.Mesh(new T.CylinderGeometry(1.6, 1.9, 0.3, 24), new T.MeshToonMaterial({ color: '#ff5fd2', emissive: '#ff5fd2', emissiveIntensity: 0.4, gradientMap: this.g.gradient }));
        disc.position.y = -0.15; this.scene.add(disc);
    }
    start() {
        const z = this.g.data.byId.get(SECRET_ID);
        if (!this.mq) { this.mq = new BlockHero(z); this.mq.root.scale.setScalar(1.25); this.scene.add(this.mq.root); }
        this.mq.play('PowerUp', { loop: false, clamp: true, timeScale: 0.7 });
        setTimeout(() => this.mq.play('Idle2'), 3200);
        this.t = 0;
    }
    update(dt) {
        this.t += dt;
        this.mq?.update(dt);
        this.stars.rotation.y += dt * 0.02;
        const a = this.t * 0.15, r = lerp(14, 5.5, Math.min(1, this.t / 5));
        this.camera.position.set(Math.sin(a) * r, 1.6 + Math.sin(this.t * 0.3) * 0.4, Math.cos(a) * r);
        this.camera.lookAt(0, 1.1, 0);
    }
    resize() {
        this.camera.aspect = innerWidth / innerHeight;
        if (innerWidth > 760) this.camera.setViewOffset(innerWidth, innerHeight, innerWidth * 0.2, 0, innerWidth, innerHeight);
        else this.camera.clearViewOffset();
        this.camera.updateProjectionMatrix();
    }
}

/* =====================================================================
   UI — semua layar DOM
   ===================================================================== */
class UI {
    constructor(game) { this.g = game; this.filter = 'Semua'; this.authMode = 'login'; }
    bind() {
        const g = this.g;
        const close = (id) => () => { g.audio.boop(); $(id).classList.add('hidden'); g.resumeWorld(); };
        $('book-btn').onclick = () => { g.audio.beep(); g.world.pause(true); this.openBook(); };
        $('book-close').onclick = close('book');
        $('champion-btn').onclick = () => { g.audio.beep(); g.world.pause(true); this.openChampion(); };
        $('champ-close').onclick = close('champion');
        $('menu-btn').onclick = () => { g.audio.beep(); g.world.pause(true); $('menu').classList.remove('hidden'); };
        $('menu-resume').onclick = close('menu');
        $('menu-help').onclick = () => { $('menu').classList.add('hidden'); $('help').classList.remove('hidden'); };
        $('help-close').onclick = close('help');
        $('menu-mode').onclick = () => { $('menu').classList.add('hidden'); g.showMode(); };
        $('menu-look').onclick = () => { $('menu').classList.add('hidden'); g.showCreator(true); };
        $('menu-spawn').onclick = () => { $('menu').classList.add('hidden'); g.world.placePlayer(SPAWN); g.resumeWorld(); };
        $('menu-logout').onclick = () => { $('menu').classList.add('hidden'); g.logout(); };
        $('sound-btn').onclick = () => { g.audio.setMuted(!g.audio.muted); $('sound-btn').textContent = g.audio.muted ? '🔇' : '🔊'; g.audio.beep(); };
        $('lore-act').onclick = () => g.world.interact();
        $('lore-img').onclick = () => { const n = g.world.nearNpc; if (n) this.lightbox(n.hero); };
        $('lightbox').onclick = () => $('lightbox').classList.add('hidden');
        $('flee-btn').onclick = () => { if (!g.battle.busy) { g.audio.boop(); g.fleeDuel(); } };
        $('result-back').onclick = () => { g.audio.beep(); $('result').classList.add('hidden'); g.backToWorld(true); };
        $('result-again').onclick = () => { g.audio.beep(); $('result').classList.add('hidden'); g.rematch(); };
        $('ending-close').onclick = () => { g.audio.beep(); g.leaveEnding(); };
        $('mode-battle').onclick = () => g.enterWorld('battle');
        $('mode-explore').onclick = () => g.enterWorld('explore');
        $('mode-logout').onclick = () => g.logout();
        addEventListener('keydown', (e) => {
            if (g.mode === 'duel' && ['1', '2', '3', '4'].includes(e.key)) g.battle.playerAct(+e.key - 1);
            if (e.key === 'Escape' && g.mode === 'world') {
                if (!$('lightbox').classList.contains('hidden')) { $('lightbox').classList.add('hidden'); return; }
                const open = ['book', 'champion', 'help', 'menu'].filter((id) => !$(id).classList.contains('hidden'));
                if (open.length) { open.forEach((id) => $(id).classList.add('hidden')); g.resumeWorld(); }
                else { g.world.pause(true); $('menu').classList.remove('hidden'); }
            }
        });
        // akun
        const setTab = (m) => {
            this.authMode = m;
            $('tab-login').classList.toggle('on', m === 'login'); $('tab-register').classList.toggle('on', m === 'register');
            $('auth-go').textContent = m === 'login' ? 'Masuk' : 'Daftar & Main';
            $('auth-msg').textContent = '';
        };
        $('tab-login').onclick = () => setTab('login');
        $('tab-register').onclick = () => setTab('register');
        $('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            g.audio.init();
            const u = $('auth-user').value, p = $('auth-pass').value;
            const r = this.authMode === 'login' ? Accounts.login(u, p) : Accounts.register(u, p);
            if (!r.ok) { $('auth-msg').textContent = r.msg; g.audio.boop(); return; }
            g.audio.chime();
            g.afterLogin(r.acc, this.authMode === 'register');
        });
        this.setTab = setTab;
    }
    showAuth() {
        $('auth').classList.remove('hidden');
        const rec = Accounts.recent();
        $('auth-recent').innerHTML = rec.length ? rec.map((a) => `<button type="button" data-u="${esc(a.username)}">👤 ${esc(a.username)}</button>`).join('') : '';
        [...$('auth-recent').children].forEach((b) => b.onclick = () => { this.setTab('login'); $('auth-user').value = b.dataset.u; $('auth-pass').focus(); });
        this.setTab(rec.length ? 'login' : 'register');
        let last = ''; try { last = localStorage.getItem(LAST_KEY) || ''; } catch (e) { /* abaikan */ }
        $('auth-user').value = last;
        setTimeout(() => (last ? $('auth-pass') : $('auth-user')).focus(), 50);
    }
    /* ---------- pembuat karakter ---------- */
    openCreator(p, onDone) {
        const st = Object.assign({}, p);
        $('cr-name').value = st.name;
        const sw = (id, key, list) => {
            const el = $(id); el.innerHTML = '';
            list.forEach((c) => { const b = document.createElement('button'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', c); b.className = st[key] === c ? 'on' : ''; b.onclick = () => { st[key] = c; this.g.audio.beep(); sw(id, key, list); this.g.previewPlayer(st); }; el.appendChild(b); });
        };
        const chips = (id, key, list) => {
            const el = $(id); el.innerHTML = '';
            list.forEach(([v, label]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.className = st[key] === v ? 'on' : ''; b.onclick = () => { st[key] = v; this.g.audio.beep(); chips(id, key, list); this.g.previewPlayer(st); }; el.appendChild(b); });
        };
        sw('cr-skin', 'skin', LOOK_OPTS.skin); sw('cr-hair', 'hair', LOOK_OPTS.hair); sw('cr-cape', 'cape', LOOK_OPTS.cape);
        chips('cr-hairstyle', 'hairstyle', LOOK_OPTS.hairstyle); chips('cr-helm', 'helm', LOOK_OPTS.helm);
        chips('cr-patron', 'patron', Object.entries(PATRONS).map(([k, v]) => [k, `${v.icon} ${v.label}`]));
        chips('cr-stance', 'stance', [['Aggressive', '🗡️ Agresif · pedang'], ['Technical', '🛡️ Teknis · tombak'], ['Evasive', '💨 Lincah · busur']]);
        $('cr-name').oninput = () => { st.name = $('cr-name').value; };
        $('cr-msg').textContent = '';
        $('cr-go').onclick = () => {
            const name = $('cr-name').value.trim();
            if (name.length < 2) { $('cr-msg').textContent = 'Ketik nama karaktermu dulu (minimal 2 huruf).'; return; }
            st.name = name; this.g.audio.chime();
            $('creator').classList.add('hidden');
            onDone(st);
        };
        $('creator').classList.remove('hidden');
        this.g.previewPlayer(st);
        setTimeout(() => $('cr-name').focus(), 50);
    }
    showMode() {
        const d = this.g.data, total = d.heroes.length;
        $('mode-title').textContent = `Halo, ${d.state.player?.name || d.user}! Mau main apa hari ini?`;
        const prog = (m) => (d.state.collected[m] || []).length;
        $('mode-battle-prog').textContent = `Progres: ${prog('battle')}/${total} tokoh`;
        $('mode-explore-prog').textContent = `Progres: ${prog('explore')}/${total} tokoh`;
        $('mode').classList.remove('hidden');
    }
    toast(msg, ms = 2800) {
        const t = $('toast'); t.innerHTML = msg; t.classList.remove('hidden');
        clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.add('hidden'), ms);
    }
    banner(name, sub) {
        const b = $('region-banner');
        b.innerHTML = `<small>${esc(sub)}</small>${esc(name)}`;
        b.classList.add('on'); clearTimeout(this._bt); this._bt = setTimeout(() => b.classList.remove('on'), 2600);
    }
    refreshHud() {
        const d = this.g.data, total = d.heroes.length, n = d.collected.size;
        $('progress-count').textContent = `${n}/${total}`;
        $('progress-bar').style.width = (n / total * 100).toFixed(1) + '%';
        const ph = d.playerHero();
        $('hud-name').textContent = ph.nama;
        $('hud-sub').textContent = `Lv ${d.level()} · ${d.mode === 'battle' ? 'Mode Bertarung' : 'Mode Jelajah'}`;
        $('hud-avatar').src = d.img(ph);
        $('champion-btn').classList.toggle('hidden', d.mode !== 'battle');
        $('t-fly')?.classList.toggle('hidden', d.mode !== 'explore');
        $('hint').textContent = d.mode === 'battle'
            ? 'WASD jalan · Shift lari · Spasi lompat · seret mouse = kamera · E menantang · Esc menu'
            : 'WASD jalan · Shift lari · Spasi lompat · F terbang (Spasi naik, C turun) · seret mouse = kamera · E menyapa · Esc menu';
    }
    showLore(h) {
        const box = $('lore-popup');
        if (!h || this.g.mode !== 'world') { box.classList.add('hidden'); return; }
        const d = this.g.data, got = d.isCollected(h.id);
        $('lore-img').src = d.img(h);
        $('lore-name').textContent = h.nama + (got ? ' ✅' : '');
        $('lore-role').textContent = `${h.role} · ${h.era}`;
        const k = $('lore-kubu'); k.textContent = h.kubu; k.style.background = (KUBU_COLOR[h.kubu] || '#fff') + '55';
        $('lore-text').textContent = h.latar_belakang;
        $('lore-matchup').innerHTML = `${STANCE_ICON[h.combat_stance]} ${h.combat_stance} · ${ELEMENT_ICON(h.elemen)} ${h.elemen} · OVR ${h.ovr}`;
        $('lore-act').textContent = d.mode === 'battle' ? (got ? '⚔ Tanding ulang [E]' : '⚔ Tantang [E]') : (got ? '📖 Baca lagi [E]' : '👋 Sapa [E]');
        box.classList.remove('hidden');
    }
    /* label nama di atas kepala NPC terdekat */
    updateLabels() {
        const W = this.g.world, layer = $('labels'), d = this.g.data;
        if (this.g.mode !== 'world' || (W.paused && !this.g.duelPending)) { layer.style.display = 'none'; return; }
        layer.style.display = '';
        const cand = W.npcs.filter((n) => n.dist < 32 && n.bh.root.visible).sort((a, b) => a.dist - b.dist).slice(0, 10);
        while (W.labelPool.length < 10) { const el = document.createElement('div'); el.className = 'nlabel'; layer.appendChild(el); W.labelPool.push(el); }
        const v = new T.Vector3();
        W.labelPool.forEach((el, i) => {
            const n = cand[i];
            if (!n) { el.style.display = 'none'; return; }
            v.copy(n.pos); v.y += 2.6 * n.bh.baseScale + 0.3;
            v.project(W.camera);
            if (v.z > 1 || Math.abs(v.x) > 1.1 || Math.abs(v.y) > 1.1) { el.style.display = 'none'; return; }
            if (W.occluded && W.occluded(n)) { el.style.display = 'none'; return; }
            const got = d.isCollected(n.hero.id), battle = d.mode === 'battle';
            const agg = battle && n.aggressive && !got;
            el.style.display = '';
            el.className = 'nlabel' + (n.state === 'chase' ? ' chase' : agg ? ' agg' : got ? ' got' : '');
            const txt = `${n.state === 'chase' ? '❗ ' : agg ? '⚔ ' : got ? '✅ ' : ''}${n.hero.nama}`;
            if (el._t !== txt) { el.textContent = txt; el._t = txt; }
            el.style.left = ((v.x + 1) / 2 * innerWidth) + 'px';
            el.style.top = ((1 - v.y) / 2 * innerHeight) + 'px';
            el.style.opacity = clamp(1.4 - n.dist / 30, 0.35, 1);
        });
    }
    drawMinimap() {
        const W = this.g.world, cv = $('minimap'), g = cv.getContext('2d'), S = cv.width, d = this.g.data;
        if (!W.minimapBg) return;
        g.save();
        g.clearRect(0, 0, S, S);
        g.beginPath(); g.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); g.clip();
        g.drawImage(W.minimapBg, 0, 0, S, S);
        const map = (x, z) => [(x / (2 * (ISLAND_R + 20)) + 0.5) * S, (z / (2 * (ISLAND_R + 20)) + 0.5) * S];
        for (const n of W.npcs) {
            const [x, y] = map(n.pos.x, n.pos.z), got = d.isCollected(n.hero.id);
            g.fillStyle = n.state === 'chase' ? '#ff2a55' : got ? '#ffd23f' : (d.mode === 'battle' && n.aggressive) ? '#ff6b8a' : '#1d1530';
            g.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
        g.font = 'bold 9px sans-serif'; g.fillStyle = '#1d1530'; g.textAlign = 'center';
        Object.values(REGIONS).forEach((r) => { const [x, y] = map(r.x, r.z); g.fillText(r.name.split(' ').pop(), x, y - 8); });
        const [px, py] = map(W.player.pos.x, W.player.pos.z);
        g.translate(px, py); g.rotate(-W.player.yaw + Math.PI);
        g.fillStyle = '#ff5fa2'; g.strokeStyle = '#fff'; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(0, -7); g.lineTo(5, 5); g.lineTo(0, 2); g.lineTo(-5, 5); g.closePath(); g.fill(); g.stroke();
        g.restore();
    }
    /* ---------- duel ---------- */
    buildDuel(p, e) {
        const d = this.g.data;
        const fill = (pre, u) => {
            $(pre + '-img').src = d.img(u.hero);
            $(pre + '-name').textContent = u.hero.nama;
            $(pre + '-tags').textContent = `${STANCE_ICON[u.hero.combat_stance]} ${u.hero.combat_stance} · ${ELEMENT_ICON(u.hero.elemen)} ${u.hero.elemen}`;
        };
        fill('p', p); fill('e', e);
        const grid = $('skill-grid'); grid.innerHTML = '';
        p.hero.skills.forEach((s, i) => {
            const b = document.createElement('button');
            b.className = 'skill'; b.type = 'button'; b.dataset.slot = i; b.dataset.type = s.tipe;
            b.onclick = () => this.g.battle.playerAct(i);
            grid.appendChild(b);
        });
        $('duel-log').innerHTML = '';
    }
    updateDuel(p, e, myTurn, round) {
        const set = (pre, u) => {
            const hpPct = u.hp / u.maxHp * 100;
            $(pre + '-hp').style.width = hpPct + '%';
            $(pre + '-hp').parentElement.classList.toggle('low', hpPct < 20);
            $(pre + '-hp-text').textContent = `${Math.ceil(u.hp)} / ${u.maxHp}`;
            $(pre + '-st').style.width = u.st + '%';
            $(pre + '-st-text').textContent = `Stamina ${Math.floor(u.st)}`;
            const st = [];
            if (u.recover) st.push('😮‍💨 Memulihkan diri (lewat 1 giliran)');
            if (u.dodge) st.push('💨 Menghindar 50%');
            if (u.block) st.push('🛡️ Bertahan');
            if (u.ward) st.push(`⛰️ Perisai ×${u.ward}`);
            if (u.rage) st.push('🔥 Amarah');
            if (u.kcd && !u.recover) st.push(`✨ siap lagi ${u.kcd} giliran`);
            if (u.ultUsed) st.push('💀 Ultimate terpakai');
            $(pre + '-status').innerHTML = st.map((s) => `<em>${s}</em>`).join('');
        };
        set('p', p); set('e', e);
        $('turn-label').textContent = myTurn ? 'GILIRANMU' : 'GILIRAN LAWAN';
        $('turn-label').classList.toggle('enemy-turn', !myTurn);
        $('turn-count').textContent = `Ronde ${round}`;
        const B = this.g.battle;
        [...$('skill-grid').children].forEach((b, i) => {
            const s = p.hero.skills[i];
            const ult = i === 3 && B.ultReady(p);
            b.classList.toggle('ultimate', ult);
            const cost = ult ? 'ULTIMATE' : (i === 3 ? (p.kcd ? `⏳${p.kcd}` : 'Lewat 1 giliran') : '⚡' + SKILL_COST[i]);
            const desc = ult ? p.hero.ultimate.deskripsi : `${s.tipe} — ${s.deskripsi}`;
            b.innerHTML = `<span class="ico">${ult ? '💥' : SKILL_ICON[i]}</span><b>${esc(ult ? p.hero.ultimate.nama : s.nama)}</b><small>${esc(desc)}</small><span class="cost">${cost}</span>`;
            b.disabled = !myTurn || !B.canUse(p, i);
            b.title = `[${i + 1}] ${desc}`;
        });
        $('flee-btn').disabled = !myTurn;
    }
    log(html) { const l = $('duel-log'); l.innerHTML = html; l.style.animation = 'none'; void l.offsetWidth; l.style.animation = 'popIn .25s ease'; }
    float(u, text, cls, delay = 0) {
        const B = this.g.battle;
        const show = () => {
            const v = B.head(u).project(B.camera);
            const el = document.createElement('div');
            el.className = 'float-num ' + cls; el.textContent = text;
            el.style.left = ((v.x + 1) / 2 * innerWidth + rand(-20, 20)) + 'px';
            el.style.top = ((1 - v.y) / 2 * innerHeight) + 'px';
            $('float-layer').appendChild(el);
            setTimeout(() => el.remove(), 1400);
        };
        delay ? setTimeout(show, delay * 1000) : show();
    }
    cutscene(icon) {
        return new Promise((resolve) => {
            $('cut-tag').textContent = icon.tag; $('cut-title').textContent = icon.title;
            $('cut-quote').textContent = icon.quote; $('cut-lesson').textContent = icon.lesson;
            $('cut-source').textContent = 'Sumber: ' + icon.source;
            $('cutscene').classList.remove('hidden'); $('duel-ui').classList.add('hidden');
            $('cut-go').onclick = () => { this.g.audio.beep(); $('cutscene').classList.add('hidden'); $('duel-ui').classList.remove('hidden'); resolve(); };
        });
    }
    /** Kisah lengkap seorang tokoh (dipakai kartu sapa & Buku Sejarah) */
    storyHTML(h, full = true) {
        const d = this.g.data;
        const names = (ids) => d.names(ids);
        const list = (ids, cls) => { const n = names(ids); return n.length ? `<div class="tags ${cls}">${n.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : '<p class="muted">—</p>'; };
        const R = REGIONS[h.kubu];
        const sec = (icon, title, body) => body ? `<section class="story-sec"><h4>${icon} ${title}</h4>${body}</section>` : '';
        const p = (t) => t ? `<p>${esc(t)}</p>` : '';
        const intro = `${h.nama} adalah ${String(h.role || '').toLowerCase()} dari ${h.faksi}. Ia hidup di masa ${String(h.era || '').toLowerCase()}, dilindungi oleh ${h.patron}, dan bertarung dengan gaya ${STANCE_NAME[h.combat_stance] || h.combat_stance} berelemen ${h.elemen}.${R ? ` Di pulau ini ia tinggal di ${R.name}.` : ''}`;
        const kuat = names(h.kuat_melawan), lemah = names(h.lemah_melawan);
        const duelLine = (kuat.length || lemah.length) ? `<p>${kuat.length ? `Menurut kisah kuno, ${esc(h.nama)} pernah mengungguli <b>${esc(kuat.join(', '))}</b>. ` : ''}${lemah.length ? `Namun ${esc(h.nama)} kalah atau tertekan oleh <b>${esc(lemah.join(', '))}</b>.` : ''}</p>` : '';
        let html = '';
        html += sec('📜', 'Siapa dia?', `<p>${esc(intro)}</p>${p(h.latar_belakang)}`);
        html += sec('⚔️', 'Kemampuan legendaris', (h.kemampuan_spesial || []).map((k) => { const [a, ...b] = String(k).split(':'); return `<div class="skl"><b>${esc(a)}</b><small>${esc(b.join(':').trim())}</small></div>`; }).join(''));
        html += sec('🔎', 'Fakta unik', p(h.fakta_unik));
        html += sec('🛐', 'Dewa pelindung & senjata', `<p>🛐 ${esc(h.patron)}<br>🗡️ ${esc(h.senjata)}</p>`);
        if (full) html += sec('✨', 'Jurus dalam duel', h.skills.map((s) => `<div class="skl"><b>${SKILL_ICON[s.slot - 1]} ${esc(s.nama)}</b><small>${esc(s.tipe)} — ${esc(s.deskripsi)}</small></div>`).join('') + `<div class="skl ult"><b>💥 ${esc(h.ultimate.nama)}</b><small>Ultimate — ${esc(h.ultimate.deskripsi)}</small></div>`);
        html += sec('🤝', 'Kawan & lawan', `${duelLine}<h5>Kuat melawan</h5>${list(h.kuat_melawan, 'good')}<h5>Lemah melawan</h5>${list(h.lemah_melawan, 'bad')}<h5>Rival</h5>${list(h.rival_ids, '')}<h5>Sekutu</h5>${list(h.sekutu_ids, '')}`);
        html += sec('🏁', 'Akhir kisahnya', p(h.akhir_kisah));
        html += sec('⚠️', 'Kelemahan', p(h.kelemahan));
        html += sec('📚', 'Sumber kisah asli', p(h.dasar_mitos));
        return html;
    }
    lightbox(h) {
        const d = this.g.data;
        const img = $('lightbox-img');
        img.dataset.fb = '';
        img.onerror = () => { img.onerror = null; img.src = d.img(h); };
        img.src = h.id === 'player' ? d.img(h) : (d.portraits[h.id] ? ASSET_DIR + (h.image || h.id + '.jpg') : d.img(h));
        $('lightbox-cap').textContent = `${h.nama} — ${h.role}`;
        $('lightbox').classList.remove('hidden');
        this.g.audio.beep();
    }
    result({ win, enemy, isNew, meet }) {
        const d = this.g.data;
        const card = $('result-card');
        card.classList.toggle('wide', !!meet);
        $('result-again').classList.toggle('hidden', !!meet);
        $('result-back').textContent = '🌍 Lanjut Jelajah';
        $('result-img').src = d.img(enemy);
        $('result-zoom').onclick = () => this.lightbox(enemy);
        if (meet) {
            $('result-tag').textContent = isNew ? '✨ TOKOH BARU DITEMUI!' : '📖 KISAH LAMA';
            $('result-title').textContent = enemy.nama;
            $('result-text').innerHTML = `<span class="chip" style="background:${KUBU_COLOR[enemy.kubu] || '#fff'}55">${esc(enemy.kubu)}</span> <b>${esc(enemy.role)}</b><br><small>${STANCE_ICON[enemy.combat_stance]} ${enemy.combat_stance} · ${ELEMENT_ICON(enemy.elemen)} ${enemy.elemen} · OVR ${enemy.ovr} · ${esc(enemy.umur || '')} · ${esc(enemy.tinggi || '')}</small>`;
            $('result-body').innerHTML = this.storyHTML(enemy, false);
            $('result-body').scrollTop = 0;
        } else {
            $('result-tag').textContent = win ? (isNew ? 'KEMENANGAN · HALAMAN BARU!' : 'KEMENANGAN') : 'KEKALAHAN';
            $('result-title').textContent = win ? `${enemy.nama} dikalahkan!` : `${enemy.nama} terlalu kuat…`;
            $('result-text').innerHTML = win
                ? `${esc(enemy.nama)} tercatat di Buku Sejarah${isNew ? ' dan kini bisa membantumu di menu Tim' : ''}.<br><small>${esc(enemy.dasar_mitos || '')}</small>`
                : `Kamu dibawa kembali ke Persimpangan. Tips: pilih petarung dengan stance <b>${esc(Object.keys(STANCE_BEATS).find((k) => STANCE_BEATS[k] === enemy.combat_stance))}</b> untuk mengalahkan ${esc(enemy.combat_stance)}.`;
            $('result-body').innerHTML = '';
        }
        $('result-status').textContent = 'Pedoman: ' + enemy.status_pedoman;
        $('result-pedoman').textContent = enemy.pedoman;
        $('result').classList.remove('hidden');
    }
    /* ---------- Buku Sejarah ---------- */
    openBook() {
        const d = this.g.data;
        const kubus = ['Semua', ...KUBU_ORDER.filter((k) => d.heroes.some((h) => h.kubu === k))];
        $('book-filters').innerHTML = kubus.map((k) => `<button type="button" data-k="${esc(k)}" class="${k === this.filter ? 'on' : ''}">${esc(k)}</button>`).join('');
        [...$('book-filters').children].forEach((b) => b.onclick = () => { this.filter = b.dataset.k; this.g.audio.beep(); this.openBook(); });
        $('book-sub').textContent = `${d.collected.size} dari ${d.heroes.length} tokoh terkoleksi · ${d.mode === 'battle' ? 'Mode Bertarung' : 'Mode Jelajah'}`;
        const list = d.heroes.filter((h) => this.filter === 'Semua' || h.kubu === this.filter);
        const grid = $('book-grid'); grid.innerHTML = '';
        list.forEach((h) => {
            const got = d.isCollected(h.id);
            const c = document.createElement('button');
            c.type = 'button'; c.className = 'card' + (got ? '' : ' locked');
            c.innerHTML = `<img loading="lazy" src="${d.img(h)}" alt=""><span class="no">#${String(h.no).padStart(3, '0')}</span><span class="el">${got ? ELEMENT_ICON(h.elemen) : ''}</span><span class="nm">${got ? esc(h.nama) : '???'}</span>`;
            c.onclick = () => { this.g.audio.beep(); [...grid.children].forEach((x) => x.classList.remove('sel')); c.classList.add('sel'); this.detail(h); };
            grid.appendChild(c);
        });
        $('book').classList.remove('hidden');
    }
    detail(h) {
        const d = this.g.data, box = $('book-detail'), got = d.isCollected(h.id);
        const R = REGIONS[h.kubu], g = this.g;
        const top = `<div class="bk-top"><div class="bk-3d-slot" id="bk-3d-slot"></div>
            <button type="button" class="bk-photo" id="bk-photo" ${got ? '' : 'disabled'}><img src="${d.img(h)}" alt="" ${got ? '' : 'style="filter:brightness(0)"'}>${got ? '<span>🔍</span>' : ''}</button></div>`;
        const tele = h.id === SECRET_ID ? '' : got
            ? `<button type="button" class="btn btn-primary wide" id="bk-tele">📍 Teleport ke ${esc(h.nama)}</button>`
            : `<button type="button" class="btn glass wide" id="bk-tele">🧭 Teleport ke ${esc(R ? R.name : 'wilayahnya')}</button>`;
        if (!got) {
            box.innerHTML = `${top}<h3>???</h3><p class="role">#${String(h.no).padStart(3, '0')} · ${esc(h.kubu)}</p><p>${h.id === SECRET_ID ? 'Tokoh rahasia. Kumpulkan semua 119 tokoh lain untuk membuka halaman ini.' : `Belum terkoleksi. Petunjuk: cari di <b>${esc(R ? R.name : 'pulau')}</b>.`}</p>${tele}`;
        } else {
            const stat = (n, v) => `<span>${n}</span><span class="sb"><i style="width:${v}%"></i></span><b>${v}</b>`;
            box.innerHTML = `${top}
                <h3>${esc(h.nama)}</h3>
                <p class="role">${esc(h.role)} · ${esc(h.faksi)}</p>
                <div class="tags"><span>${STANCE_ICON[h.combat_stance]} ${h.combat_stance}</span><span>${ELEMENT_ICON(h.elemen)} ${h.elemen}</span><span>OVR ${h.ovr}</span><span>HP ${h.hp_base}</span><span>${esc(h.era)}</span></div>
                ${tele}
                <h4>Statistik</h4>
                <div class="stats">${stat('Kekuatan', h.kekuatan)}${stat('Kecepatan', h.kecepatan)}${stat('Taktik', h.taktik)}${stat('Kharisma', h.kepemimpinan)}</div>
                ${this.storyHTML(h, true)}
                <h4>Pedoman · ${esc(h.status_pedoman)}</h4><p>${esc(h.pedoman)}</p>`;
            $('bk-photo').onclick = () => this.lightbox(h);
        }
        if (g.preview) { $('bk-3d-slot').appendChild(g.preview.canvas); g.preview.show(h, !got); }
        const tb = $('bk-tele');
        if (tb) tb.onclick = () => { $('book').classList.add('hidden'); got ? g.teleportTo(h.id) : g.teleportRegion(h.kubu); };
        box.scrollTop = 0;
    }
    openChampion() {
        const d = this.g.data, grid = $('champ-grid');
        grid.innerHTML = '';
        const cur = d.champion().id;
        d.roster().forEach((h) => {
            const t = document.createElement('div'); t.className = 'champ-tile';
            t.innerHTML = `<button type="button" class="card${h.id === cur ? ' sel' : ''}"><img src="${d.img(h)}" alt=""><span class="el">${STANCE_ICON[h.combat_stance]}</span><span class="nm">${esc(h.nama)}<br><small>OVR ${h.ovr} · ${ELEMENT_ICON(h.elemen)}</small></span></button>`;
            t.querySelector('button').onclick = () => { this.g.audio.beep(); d.setChampion(h.id); this.openChampion(); this.toast(`⚔ ${esc(h.nama)} siap bertarung!`); };
            grid.appendChild(t);
        });
        $('champion').classList.remove('hidden');
    }
}

/* =====================================================================
   BlockPreview — model balok 3D yang berputar di Buku Sejarah,
   sekaligus "pemotret" potret balok untuk tokoh yang belum punya gambar
   ===================================================================== */
class BlockPreview {
    constructor(game) {
        this.g = game;
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'bk3d'; this.canvas.width = this.canvas.height = 360;
        this.renderer = new T.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
        this.renderer.setPixelRatio(1);
        this.scene = new T.Scene();
        this.scene.add(new T.HemisphereLight('#fff4e6', '#7a8cff', 1.5));
        const d = new T.DirectionalLight('#ffffff', 1.7); d.position.set(3, 5, 4); this.scene.add(d);
        this.cam = new T.PerspectiveCamera(32, 1, 0.1, 60);
        this.disc = new T.Mesh(new T.CylinderGeometry(1.25, 1.35, 0.14, 28), new T.MeshToonMaterial({ color: '#ffe3a3', gradientMap: game.gradient }));
        this.disc.position.y = -0.07; this.scene.add(this.disc);
        this.black = new T.MeshBasicMaterial({ color: '#1d1530' });
        this.cache = new Map();
    }
    frame(bh, portrait) {
        const h = 2.6 * bh.baseScale;
        if (portrait) { this.cam.position.set(0.35 * h, h * 0.86, h * 0.82 + 0.9); this.cam.lookAt(0, h * 0.8, 0); }
        else { this.cam.position.set(0, h * 0.62, h * 1.75 + 1.4); this.cam.lookAt(0, h * 0.48, 0); }
    }
    show(hero, silhouette) {
        if (this.bh) { this.scene.remove(this.bh.root); this.bh.dispose(); }
        this.bh = new BlockHero(hero);
        if (silhouette) this.bh.root.traverse((m) => { if (m.isMesh) m.material = this.black; });
        this.bh.root.rotation.y = -0.5;
        this.scene.add(this.bh.root);
        this.frame(this.bh, false);
        if (!this.running) { this.running = true; this.loop(); }
    }
    loop() {
        if (!document.body.contains(this.canvas) || $('book').classList.contains('hidden')) { this.running = false; return; }
        requestAnimationFrame(() => this.loop());
        this.bh.root.rotation.y += 0.01;
        this.bh.update(1 / 60);
        this.renderer.render(this.scene, this.cam);
    }
    portrait(hero) {
        if (this.cache.has(hero.id)) return this.cache.get(hero.id);
        const bh = new BlockHero(hero); bh.play('Idle'); bh.update(0.01);
        if (this.bh) this.bh.root.visible = false;
        this.scene.add(bh.root);
        this.frame(bh, true);
        this.scene.background = new T.Color(hero.warna_jubah || '#3b2a7a');
        this.renderer.render(this.scene, this.cam);
        const url = this.canvas.toDataURL('image/png');
        this.scene.background = null; this.scene.remove(bh.root); bh.dispose();
        if (this.bh) { this.bh.root.visible = true; this.frame(this.bh, false); }
        this.cache.set(hero.id, url);
        return url;
    }
}

/* =====================================================================
   Game — alur layar: loading → akun → buat karakter → pilih mode → dunia
   ===================================================================== */
class Game {
    constructor() {
        this.audio = new AudioSynth();
        this.data = new DataManager();
        this.ui = new UI(this);
        this.mode = 'loading';
        this.clock = new T.Clock();
        this.renderer = new T.WebGLRenderer({ canvas: $('world-canvas'), antialias: true, alpha: true, powerPreference: 'high-performance' });
        this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
        this.renderer.setSize(innerWidth, innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = T.PCFSoftShadowMap;
        this.gradient = (() => { const tex = new T.DataTexture(new Uint8Array([70, 150, 215, 255]), 4, 1, T.RedFormat); tex.minFilter = tex.magFilter = T.NearestFilter; tex.generateMipmaps = false; tex.needsUpdate = true; return tex; })();
        addEventListener('resize', () => this.resize());
        if (matchMedia('(pointer: coarse)').matches) document.body.classList.add('touch-mode');
    }
    progress(p, text) { $('loading-bar').style.width = Math.round(p * 100) + '%'; if (text) $('loading-text').textContent = text; }
    async init() {
        try {
            this.progress(0.15, `Memuat ${this.data.heroes.length} data pahlawan…`);
            if (!this.data.heroes.length) throw new Error('data.js kosong');
            await new Promise((r) => setTimeout(r, 30));
            this.progress(0.35, 'Membentuk pulau, Gunung Olympus & tembok Troya…');
            await new Promise((r) => setTimeout(r, 30));
            this.world = new OpenWorld(this);
            this.data.state.player = defaultPlayer('Pengembara');
            this.world.build();
            this.progress(0.85, 'Para pahlawan mulai berjalan-jalan…');
            this.battle = new BattleEngine(this);
            this.ending = new EndingEngine(this);
            this.preview = new BlockPreview(this);
            this.ui.bind();
            this.progress(1, 'Siap!');
            this.mode = 'world';
            this.world.pause(true);
            this.resize();
            this.loop();
            const q = new URLSearchParams(location.search).get('debug');
            this.debug = q;
            setTimeout(() => { $('loading').classList.add('hidden'); this.ui.showAuth(); }, 250);
        } catch (err) {
            console.error(err);
            this.progress(1, '⚠️ Gagal memuat: ' + err.message);
        }
    }
    afterLogin(acc, isNew) {
        this.data.loadUser(acc);
        $('auth').classList.add('hidden');
        if (this.debug === 'all' || this.debug === 'ending') { ['battle', 'explore'].forEach((m) => { this.data.state.collected[m] = this.data.world.map((h) => h.id); }); this.data._set = null; }
        if (!this.data.state.player || isNew) this.showCreator(false);
        else this.showMode();
    }
    showCreator(fromMenu) {
        this.world.pause(true);
        $('hud').classList.add('hidden'); $('minimap').classList.add('hidden'); $('touch').classList.add('hidden'); $('lore-popup').classList.add('hidden');
        this.creatorCam = true;
        this.ui.openCreator(this.data.state.player || defaultPlayer(this.data.user), (p) => {
            this.creatorCam = false;
            this.data.state.player = p; this.data._ph = null; this.data.save();
            this.world.rebuildPlayer();
            if (fromMenu) this.resumeWorld(true); else this.showMode();
        });
    }
    previewPlayer(p) {
        this.data.state.player = Object.assign({}, p);
        this.world.rebuildPlayer();
    }
    showMode() {
        this.world.pause(true);
        $('hud').classList.add('hidden'); $('minimap').classList.add('hidden'); $('touch').classList.add('hidden'); $('lore-popup').classList.add('hidden');
        this.ui.showMode();
    }
    enterWorld(mode) {
        this.audio.init(); this.audio.chime();
        this.data.setMode(mode);
        if (mode !== 'explore') this.world.toggleFly?.(false);
        $('mode').classList.add('hidden');
        this.world.npcs.forEach((n) => { n.state = 'idle'; n.cooldown = 0; });
        if (!this._placed) { this._placed = true; this.world.placePlayer(this.data.state.pos || SPAWN); }
        this.world.player.safe = 4;
        this.resumeWorld(true);
        this.ui.toast(mode === 'battle' ? '⚔️ <b>Mode Bertarung</b> — hati-hati dengan tokoh bertanda ⚔ merah!' : '🧭 <b>Mode Jelajah</b> — dekati tokoh dan tekan E untuk menyapa.', 3500);
        if (!this.data.state.helpSeen) { this.world.pause(true); $('help').classList.remove('hidden'); this.data.state.helpSeen = true; this.data.save(); }
        else { $('hint').classList.remove('hidden'); setTimeout(() => $('hint').classList.add('hidden'), 8000); }
        if (this.debug === 'ending') setTimeout(() => this.playEnding(), 400);
    }
    resumeWorld(full) {
        this.mode = 'world';
        document.body.classList.remove('mode-duel');
        document.querySelector('.sky').style.background = '';
        $('hud').classList.remove('hidden'); $('minimap').classList.remove('hidden');
        $('touch').classList.toggle('hidden', !document.body.classList.contains('touch-mode'));
        this.ui.refreshHud();
        this.world.pause(false);
        if (full) this.world.snapCamera();
    }
    logout() {
        this.data.save();
        this.world.pause(true);
        ['hud', 'minimap', 'touch', 'lore-popup', 'mode', 'menu'].forEach((id) => $(id).classList.add('hidden'));
        this.data.user = null;
        $('auth-pass').value = ''; this._placed = false;
        this.ui.showAuth();
    }
    resize() {
        this.renderer.setSize(innerWidth, innerHeight);
        this.world?.resize(); this.battle?.resize(); this.ending?.resize();
    }
    shake() { document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake'); }
    /* ---------- Teleport dari Buku Sejarah ---------- */
    teleportTo(id) {
        const W = this.world, n = W.npcs.find((x) => x.hero.id === id);
        if (!n) return;
        const spot = W.freeSpot(n.pos.x, n.pos.z, 3.5, 6);
        n.state = 'idle'; n.cooldown = Math.max(n.cooldown, 8);
        W.teleport(spot.x, spot.z, n.pos.x, n.pos.z);
        this.fadeFlash();
        this.resumeWorld(true);
        this.ui.toast(`📍 Kamu tiba di dekat <b>${esc(n.hero.nama)}</b>.`);
    }
    teleportRegion(kubu) {
        const R = REGIONS[kubu]; if (!R) return;
        const spot = this.world.freeSpot(R.x, R.z, 2, R.r * 0.5);
        this.world.teleport(spot.x, spot.z);
        this.fadeFlash();
        this.resumeWorld(true);
        this.ui.toast(`🧭 Selamat datang di <b>${esc(R.name)}</b>. Cari tokohnya di sekitar sini!`);
    }
    fadeFlash() { const f = $('fade'); f.classList.add('on'); setTimeout(() => f.classList.remove('on'), 350); this.audio.swoosh(); }
    /* ---------- Mode Jelajah: menyapa ---------- */
    meet(hero, npc) {
        if (this.mode !== 'world') return;
        const isNew = this.data.collect(hero.id);
        this.world.pause(true);
        $('lore-popup').classList.add('hidden');
        if (isNew) this.audio.meet(); else this.audio.beep();
        npc.bh.play('PowerUp', { loop: false });
        this.ui.refreshHud();
        this.ui.result({ enemy: hero, isNew, meet: true });
        this.lastMeetNew = isNew;
    }
    /* ---------- Mode Bertarung ---------- */
    async challenge(hero, npc, ambush = false) {
        if (this.mode !== 'world' || this.transitioning) return;
        const me = this.data.champion();
        this.transitioning = true;
        this.world.pause(true);
        this.enemy = hero; this.enemyNpc = npc;
        $('lore-popup').classList.add('hidden');
        if (ambush) { this.ui.toast(`⚔️ <b>${esc(hero.nama)}</b> menantangmu duel!`); this.audio.thunder(); }
        else this.audio.beep();
        $('fade').classList.add('on');
        await Tweens.wait(0.45);
        this.mode = 'duel';
        document.body.classList.add('mode-duel');
        ['hud', 'minimap', 'touch', 'hint'].forEach((id) => $(id).classList.add('hidden'));
        $('labels').style.display = 'none';
        $('duel-ui').classList.remove('hidden');
        $('fade').classList.remove('on');
        this.transitioning = false;
        await this.battle.start(me, hero);
    }
    rematch() { $('duel-ui').classList.remove('hidden'); this.battle.start(this.data.champion(), this.enemy); }
    async fleeDuel() {
        this.battle.over = true;
        if (this.enemyNpc) this.enemyNpc.cooldown = 20;
        this.world.player.safe = 8;
        this.ui.toast('🏃 Kamu berhasil kabur! Musuh tidak akan mengejar sebentar.');
        await this.backToWorld(false);
    }
    duelOver(win) {
        let isNew = false;
        if (win) { isNew = this.data.collect(this.enemy.id); this.audio.fanfare(); } else { this.audio.defeat(); }
        if (this.enemyNpc) this.enemyNpc.cooldown = win ? 0 : 30;
        this.lastWin = win;
        $('duel-ui').classList.add('hidden');
        this.ui.result({ win, enemy: this.enemy, isNew });
        this.ui.refreshHud();
    }
    async backToWorld(fromResult) {
        if (this.mode === 'duel') {
            $('fade').classList.add('on');
            await Tweens.wait(0.4);
            $('duel-ui').classList.add('hidden'); $('cutscene').classList.add('hidden');
            if (fromResult && !this.lastWin) this.world.placePlayer(SPAWN);
            this.world.player.safe = 6;
            this.resumeWorld(true);
            $('fade').classList.remove('on');
        } else this.resumeWorld(false);
        if (fromResult && this.data.worldDone() && !this.data.state.endingSeen[this.data.mode]) {
            await Tweens.wait(0.6);
            this.playEnding();
        }
    }
    /* ---------- Secret Ending ---------- */
    async playEnding() {
        if (this.mode === 'ending') return;
        this.world.pause(true);
        ['hud', 'minimap', 'touch', 'lore-popup', 'hint'].forEach((id) => $(id).classList.add('hidden'));
        $('labels').style.display = 'none';
        this.audio.chime();
        $('fade').classList.add('on');
        await Tweens.wait(1.2);
        document.body.classList.add('mode-ending');
        this.mode = 'ending';
        this.ending.start();
        this.data.collect(SECRET_ID);
        this.data.state.endingSeen[this.data.mode] = true; this.data.save();
        $('fade').classList.remove('on');
        $('ending').classList.remove('hidden');
    }
    leaveEnding() {
        $('ending').classList.add('hidden');
        document.body.classList.remove('mode-ending');
        this.resumeWorld(true);
        this.ui.toast('🌟 Zhovaga kini tercatat di Buku Sejarah!');
    }
    loop() {
        requestAnimationFrame(() => this.loop());
        const dt = Math.min(this.clock.getDelta(), 0.05);
        const time = this.clock.elapsedTime;
        Tweens.update(dt);
        if (this.mode === 'world' || this.mode === 'loading') {
            this.world.update(dt, time);
            if (this.creatorCam) {
                // kamera menyorot karakter dari depan, sedikit ke kanan layar
                const P = this.world.player.pos, a = this.world.player.yaw;
                const cam = this.world.camera, narrow = innerWidth < 760, side = narrow ? 0 : 1.6;
                const dist = narrow ? 6.5 : 5.2;
                cam.position.set(P.x + Math.sin(a) * dist - Math.cos(a) * side, P.y + 2.2, P.z + Math.cos(a) * dist + Math.sin(a) * side);
                cam.lookAt(P.x - Math.cos(a) * side, P.y + (narrow ? -0.6 : 1.3), P.z + Math.sin(a) * side);
            }
            if (this.world.render) this.world.render(); else this.renderer.render(this.world.scene, this.world.camera);
        } else if (this.mode === 'duel') {
            this.battle.update(dt, time);
            this.renderer.render(this.battle.scene, this.battle.camera);
        } else if (this.mode === 'ending') {
            this.ending.update(dt);
            this.renderer.render(this.ending.scene, this.ending.camera);
        }
    }
}

// Gambar yang gagal dimuat → gambar pengganti (bukan ikon rusak)
document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.fb) return;
    img.dataset.fb = '1';
    const alt = window.game?.data?.fb?.get(img.src);
    if (alt) { img.src = alt(); return; }
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#3b2a7a"/><text x="50" y="62" font-family="Arial" font-size="40" fill="#a98bff" text-anchor="middle">?</text></svg>');
}, true);

window.addEventListener('DOMContentLoaded', () => {
    if (!window.THREE || !window.BlockHero) { $('loading-text').textContent = '⚠️ vendor/three.bundle.js atau blockhero.js tidak ditemukan.'; return; }
    window.game = new Game();
    window.game.init();
});
