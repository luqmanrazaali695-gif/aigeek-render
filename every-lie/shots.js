/* "What If Every Lie You Told Became Real?" — 60 shots · 8:45 (525 s) · collision-safe.
   Safety rules used in EVERY shot (nothing ever passes through anything):
   · pedestrians only on pavements (z = ±4.6) or clear indoor floors, ≥ 0.7 m apart
   · cars only inside lanes (z = ±1.7), spaced ≥ 6 m, STOPPED whenever people are near
   · nobody ever crosses a live lane; crowds march single-file at ONE shared speed
   · every moving pair is separated in time OR space by ≥ 0.6 m                       */
const K = KAZ, T = K.THREE, PI = Math.PI;
K.config({ leftLabel: 'YOUR LIES', rightLabel: 'YOU ARE', prefix: '×' });
const CORAL = '#ff7a66', GOLD = '#e8c56a', GREEN = '#7ddc8f';

// 60 frame counts @30fps — sections: 45+35+55+60+60+65+60+60+50+35 = 525 s
const F = [270,270,270,270,270, 262,263,262,263, 275,275,275,275,275,275,
  257,257,257,257,257,257,258, 257,257,257,257,257,257,258, 278,278,278,278,279,279,280,
  257,257,257,257,257,257,258, 257,257,257,257,257,257,258, 250,250,250,250,250,250, 262,263,262,263];
let n = 0;
const SH = o => { K.shot(Object.assign({ dur: F[n++] / 30 }, o)); };
const HERO = { shirt: 0x2f9c8c, pants: 0x4a5568, hair: 0x2a1d14 };

// ---------- shared builders ----------
function laptop(x = 0, y = 0, z = 0) {
  const g = new T.Group();
  g.add(K.box(.62, .02, .42, 0x9aa2ad, 0, .01, 0));
  const scr = new T.Mesh(new T.PlaneGeometry(.58, .36), new T.MeshStandardMaterial({ color: 0x1a1e24, emissive: 0x000000, emissiveIntensity: 1 }));
  scr.position.set(0, .19, -.185); scr.rotation.x = -.18; g.add(scr);
  g.screen = scr; g.position.set(x, y, z); return g;
}
function phoneG(x = 0, y = 0, z = 0) {
  const g = new T.Group();
  g.add(K.box(.09, .016, .18, 0x23262b, 0, 0, 0));
  const scr = new T.Mesh(new T.PlaneGeometry(.076, .155), new T.MeshStandardMaterial({ color: 0x223542, emissive: 0x223542, emissiveIntensity: .5 }));
  scr.rotation.x = -PI / 2; scr.position.y = .012; g.add(scr);
  g.screen = scr; g.position.set(x, y, z); return g;
}
// school bus, nose faces -z, length ≈ 4.8 m — keep it 5 m from any person
function bus() {
  const g = new T.Group();
  g.add(K.box(1.9, 1.15, 4.4, 0xe8b93a, 0, .95, 0));
  g.add(K.box(1.94, .36, 3.4, 0xbfe0f2, 0, 1.32, .2));
  g.add(K.box(1.9, .3, .5, 0x9a7a1f, 0, .42, -2.3));
  [[-.85, -1.35], [.85, -1.35], [-.85, 1.35], [.85, 1.35]].forEach(([x, z]) => { const w = K.cyl(.34, .34, .24, 0x1a1a1a, x, .34, z, 10); w.rotation.z = PI / 2; g.add(w); });
  g.add(K.box(.28, .18, .1, 0xfff2c0, -.55, 1.02, -2.42, { emissive: 0xffe9a8, emissiveIntensity: .9 }));
  g.add(K.box(.28, .18, .1, 0xfff2c0, .55, 1.02, -2.42, { emissive: 0xffe9a8, emissiveIntensity: .9 }));
  return g;
}
// small gold slab — a spoken "word" made physical
function wordBit(c = 0xe8c56a) {
  const m = new T.Mesh(new T.BoxGeometry(.16, .05, .16),
    new T.MeshStandardMaterial({ color: c, emissive: 0x7a5a18, emissiveIntensity: .8, flatShading: true }));
  return m;
}
function podium() {
  const g = new T.Group();
  g.add(K.box(.9, 1.05, .6, 0x27313d, 0, .525, 0));
  g.add(K.box(1, .07, .68, 0x33404f, 0, 1.08, 0));
  g.add(K.box(.5, .12, .12, 0xe8c56a, 0, 1.08, .3));
  return g;
}
function photoFrame(w = .8, h = .6, c0 = 0xd9c7a6) {
  const g = new T.Group();
  g.add(K.box(w + .08, h + .08, .05, 0x5f4a33, 0, 0, 0));
  const pic = K.box(w, h, .02, c0, 0, 0, .035);
  g.add(pic); g.pic = pic; return g;
}
// single-file walkers, all the SAME speed, ≥1.35 m apart — nobody can ever collide
function marchRow(count, { x = 0, z = 4.6, spacing = 1.35, speed = 1.2, dir = -1, seed = 3, lead = 6 } = {}) {
  const g = new T.Group(), list = [], r = K.rng(seed);
  const shirts = [0xc25b4a, 0x4a6fc2, 0xd9a441, 0x7a5fb0, 0x4f9a6a, 0xd97a9a];
  for (let i = 0; i < count; i++) {
    const pn = K.person({ shirt: shirts[(i + seed) % 6], pants: [0x3d4a66, 0x6b5a48, 0x2f2f33][i % 3], longHair: r() > .55 });
    pn.userData.i = i; pn.rotation.y = dir > 0 ? PI / 2 : -PI / 2;
    list.push(pn); g.add(pn);
  }
  g.update = t => list.forEach(pn => {
    const i = pn.userData.i;
    pn.position.x = dir * (t * speed + i * spacing) + x + dir * lead;
    K.walk(pn, t * speed * 4.8 + i * 1.7);
  });
  return g;
}
// road sign on a pole (STOP, etc.)
function signPole(text, w = .95, h = .6, y = 1.9, bg = '#e33d2e') {
  const g = new T.Group();
  g.add(K.box(.07, y, .07, 0x8a8f96, 0, y / 2, 0));
  const s = K.sign(text, w, h, { bg, color: '#ffffff' }); s.position.set(0, y, 0); g.add(s);
  return g;
}
// ============ SECTION 1 · 00:00 THE FIRST LIE (shots 1-5) ============
// 1. Bedroom, 8:17 AM — the phone rings
SH({
  dur: 9, value: '0', status: 'INNOCENT', sub: 'MON · 8:17 AM',
  caption: 'At 8:17 on a Monday morning,<br>your boss calls.',
  title: 'THE FIRST LIE',
  setup(K) {
    const scene = K.indoor(), cam = K.camera(38);
    const bed = K.bed(0x35507a); bed.position.set(0, 0, -1.2); scene.add(bed);
    const hero = K.person(HERO); hero.position.set(0, .72, -.15); hero.rotation.x = -PI / 2; scene.add(hero);
    scene.add(K.box(.7, .7, .7, 0x5f4a33, 1.05, .35, -1.9));
    const ph = phoneG(1.05, .716, -1.9); scene.add(ph);
    const tag = K.label('INCOMING · BOSS', .8, GOLD); tag.position.set(1.05, 1.55, -1.9); scene.add(tag);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [3.6, 1.8, 2.2], [2.7, 1.55, 1.5], [0, .8, -1.2]);
        hero.position.y = .72 + Math.sin(t * 2) * .008;
        if (t > 1) ph.position.x = 1.05 + Math.sin(t * 44) * .012;
        tag.pop(K.pop(t, 1.2));
      }
    };
  }
});
// 2. The empty report
SH({
  dur: 9, value: '0', status: 'DEADLINE', statusColor: CORAL, sub: 'FILE: EMPTY',
  caption: '"Did you finish the report?"<br>You stare at the empty laptop screen.',
  setup(K) {
    const scene = K.indoor(), cam = K.camera(36);
    const tb = K.table(); tb.position.set(0, 0, -1.6); scene.add(tb);
    const ch = K.chair(); ch.position.set(-.55, 0, -.8); ch.rotation.y = .25; scene.add(ch);
    const lp = laptop(0, .8, -1.6); scene.add(lp);
    const hero = K.person(HERO); hero.position.set(-.55, .13, -.8); hero.rotation.y = .25; scene.add(hero); K.sit(hero);
    const zero = K.label('REPORT · 0%', .8, CORAL); zero.position.set(0, 1.35, -1.6); scene.add(zero);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [1.9, 2.0, .8], [1.0, 1.5, -.1], [-.3, 1.05, -1.65]);
        hero.parts.head.rotation.x = .22; K.idle(hero, t);
        zero.pop(K.pop(t, 1.6));
      }
    };
  }
});
// 3. Four words — the first lie
SH({
  dur: 9, value: '1', status: 'FIRST LIE', statusColor: CORAL, sub: '8:19 AM',
  caption: 'Then you say four words.<br>"<b>Yeah. It\'s already done.</b>"',
  setup(K) {
    const scene = K.indoor(), cam = K.camera(34);
    const tb = K.table(); tb.position.set(0, 0, -1.6); scene.add(tb);
    const ch = K.chair(); ch.position.set(-.55, 0, -.8); ch.rotation.y = .25; scene.add(ch);
    scene.add(laptop(0, .8, -1.6));
    const hero = K.person(HERO); hero.position.set(-.55, .13, -.8); hero.rotation.y = .25; scene.add(hero); K.sit(hero);
    const bits = []; for (let i = 0; i < 3; i++) { const b = wordBit(); b.material.transparent = true; scene.add(b); bits.push(b); }
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [-.2, 1.6, 2.1], [-.35, 1.4, 1.3], [-.5, 1.15, -.8]);
        hero.parts.head.rotation.x = .1;
        const mo = t > 2.1 && t < 4.4 ? 1 + Math.sin(t * 18) * .6 : 1;
        hero.parts.mouth.scale.y = mo;
        bits.forEach((b, i) => {
          const u = K.clamp((t - (2.3 + i * .45)) / 2.6);
          b.material.opacity = u > 0 && u < 1 ? 1 - u * .7 : 0;
          b.scale.setScalar(Math.max(.001, K.pop(t, 2.3 + i * .45, .3) * 1.2));
          b.position.set(-.5 + (i - 1) * .16 * u, 1.3 + u * .5, -.35 + u * .9);
        });
      }
    };
  }
});
// 4. The laptop turns itself on — 42 perfect pages
SH({
  dur: 9, value: '1', status: 'REALITY EDITS', statusColor: CORAL, sub: '42 PAGES',
  caption: 'Your laptop turns on by itself.<br>A complete report appears — 42 pages.',
  setup(K) {
    const scene = K.indoor(), cam = K.camera(30);
    const tb = K.table(); tb.position.set(0, 0, -1.6); scene.add(tb);
    const lp = laptop(0, .8, -1.6); scene.add(lp);
    const pages = []; for (let i = 0; i < 3; i++) { const p = K.box(.24, .015, .32, 0xf2efe6); scene.add(p); pages.push(p); }
    const tag = K.label('FORMATTED · SOURCED · DONE', .75, GOLD); tag.position.set(0, 1.55, -1.6); scene.add(tag);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [2.0, 1.75, 1.0], [1.45, 1.45, .45], [0, 1.0, -1.6]);
        const on = K.ramp(t, .8, .9);
        lp.screen.material.emissive.setRGB(.38 * on, .55 * on, .62 * on);
        lp.screen.material.color.setRGB(K.lerp(.1, .92, on), K.lerp(.12, .95, on), K.lerp(.14, .98, on));
        pages.forEach((p, i) => {
          const u = K.clamp((t - (1.6 + i * .7)) / 2.5);
          p.scale.setScalar(Math.max(.001, K.pop(t, 1.6 + i * .7, .4)));
          p.position.set(K.lerp(0, .05 + i * .04, u), .86 + u * (.08 + i * .07), -1.42 + i * .07);
          p.rotation.y = K.lerp(0, .18 * (i - 1), u);
        });
        tag.pop(K.pop(t, 3.4));
      }
    };
  }
});
// 5. "Excellent work." — you wrote nothing
SH({
  dur: 9, value: '1', status: 'PRAISED', sub: 'NOT ONE WORD',
  caption: 'Your boss opens it.<br>"Excellent work."<br>You haven\'t written a single word.',
  setup(K) {
    const scene = K.indoor(), cam = K.camera(36);
    const tb = K.table(); tb.position.set(0, 0, -1.6); scene.add(tb);
    const ch = K.chair(); ch.position.set(-.55, 0, -.8); ch.rotation.y = .25; scene.add(ch);
    const lp = laptop(0, .8, -1.6); scene.add(lp);
    const hero = K.person(HERO); hero.position.set(-.55, .13, -.8); hero.rotation.y = .25; scene.add(hero); K.sit(hero);
    const ok = K.label('"Excellent work."', .9, GOLD); ok.position.set(.4, 1.9, -1.6); scene.add(ok);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [2.2, 1.9, 1.4], [1.3, 1.5, .6], [-.2, 1.1, -1.7]);
        lp.screen.material.emissive.setRGB(.38, .55, .62); lp.screen.material.color.setHex(0xd8ecff);
        K.idle(hero, t);
        const rel = K.ramp(t, 2.6, 1);
        hero.parts.armL.rotation.x = -.55 * rel; hero.parts.armR.rotation.x = -.55 * rel;
        ok.pop(K.pop(t, 1.4));
      }
    };
  }
});
// ============ SECTION 2 · 00:45 THE RULE (shots 6-9) ============
// 6. Words leave the mouth and become things
SH({
  dur: 262 / 30, value: '1', status: 'THE RULE', sub: '00:45',
  caption: 'Every time you knowingly lie,<br>reality changes to make it true.',
  title: 'THE RULE',
  setup(K) {
    const scene = K.indoor(), cam = K.camera(32);
    const hero = K.person(HERO); hero.position.set(0, 0, -1.2); scene.add(hero);
    const bits = []; for (let i = 0; i < 5; i++) { const b = wordBit(); b.material.transparent = true; scene.add(b); bits.push(b); }
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [2.6, 1.7, 1.8], [1.8, 1.45, 1.1], [0, 1.35, -1.2]);
        K.idle(hero, t);
        const mo = t > .8 ? 1 + Math.sin(t * 15) * .5 : 1; hero.parts.mouth.scale.y = mo;
        bits.forEach((b, i) => {
          const u = K.clamp((t - (.8 + i * .65)) / 2.8);
          b.material.opacity = u > 0 && u < 1 ? 1 - u * .75 : 0;
          b.scale.setScalar(Math.max(.001, K.pop(t, .8 + i * .65, .3)));
          b.position.set(Math.sin(i * 2.1) * .5 * u, 1.3 + u * .7, -.95 + u * 1.1);
          b.rotation.y = u * 2.5;
        });
      }
    };
  }
});
// 7. The three conditions (rules card)
SH({
  dur: 263 / 30, value: '1', status: 'RULES', sub: '3 CONDITIONS',
  caption: 'It must be deliberate. It must be factual.<br>No jokes. No metaphors. No stories.',
  card: () => `<h4>THE THREE CONDITIONS</h4><ul style="text-align:left;line-height:1.6;font-size:1.02em"><li><b>Deliberate</b> — you know it is false</li><li><b>Factual</b> — a real claim, not a story</li><li><b>Spoken</b> — out loud, to another person</li></ul>`,
  setup(K) {
    const scene = K.indoor(), cam = K.camera(38);
    const hero = K.person(HERO); hero.position.set(-2.6, 0, -.6); hero.rotation.y = .5; scene.add(hero);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [-1.2, 1.6, 2.6], [-1.6, 1.5, 1.8], [-2.6, 1.3, -.6]);
        K.idle(hero, t);
      }
    };
  }
});
// 8. Demo: "My mug is full." — it fills
SH({
  dur: 262 / 30, value: '2', status: 'SMALLEST WAY', statusColor: CORAL, sub: 'DEMO LIE',
  caption: 'Say it — and the universe finds<br>the smallest way to make it true.',
  setup(K) {
    const scene = K.indoor(), cam = K.camera(32);
    const tb = K.table(); tb.position.set(0, 0, -1.5); scene.add(tb);
    const hero = K.person(HERO); hero.position.set(1.7, 0, -1.5); hero.rotation.y = -PI / 2; scene.add(hero);
    scene.add(K.mug(-.2, .8, -1.5));
    const fill = K.cyl(.072, .06, .11, 0x6b4226, -.2, .855, -1.5, 10); fill.scale.y = .001; scene.add(fill);
    const say = K.label('"My mug is full."', .8, CORAL); say.position.set(-.2, 1.55, -1.3); scene.add(say);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [2.9, 2.0, 1.7], [2.2, 1.65, .85], [.65, 1.35, -1.5]);
        K.idle(hero, t);
        const mo = t > .6 && t < 1.6 ? 1 + Math.sin(t * 20) * .6 : 1; hero.parts.mouth.scale.y = mo;
        fill.scale.y = Math.max(.001, K.ramp(t, 2.2, 1.1) * 2);
        say.pop(K.pop(t, .7));
      }
    };
  }
});
// 9. Your memories stay — everyone else's change
SH({
  dur: 263 / 30, value: '2', status: 'MEMORY EDIT', sub: 'WHO REMEMBERS',
  caption: 'Your memories stay. Everyone else\'s change.<br>Documents, photos, history rearrange.',
  setup(K) {
    const scene = K.indoor(), cam = K.camera(36);
    const hero = K.person(HERO); hero.position.set(-1.3, 0, -1.2); scene.add(hero);
    const pal = K.person({ shirt: 0xc25b4a, longHair: true }); pal.position.set(1.3, 0, -1.2); pal.rotation.y = PI; scene.add(pal);
    const frames = [[-2.4, 2.15, 0xd9c7a6], [0, 2.15, 0xcfd6d2], [2.4, 2.15, 0xdccbb0]].map(([x, y, c]) => {
      const f = photoFrame(1, .75, c); f.position.set(x, y, -3.85); scene.add(f); return f;
    });
    const mine = K.label('YOU REMEMBER', .8, GREEN); mine.position.set(-1.3, 2.45, -1.2); scene.add(mine);
    const lost = K.label('THEY FORGET', .8, CORAL); lost.position.set(1.3, 2.45, -1.2); scene.add(lost);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 1.7, 3.4], [0, 1.55, 2.6], [0, 1.4, -1.2]);
        K.idle(hero, t); K.idle(pal, t + 3);
        mine.pop(K.pop(t, 1.2)); lost.pop(K.pop(t, 2.2));
        frames.forEach((f, i) => {
          const u = K.ramp(t, 2.6 + i * .4, .9);
          f.pic.material.color.setHex(u > .5 ? [0xc7d9e8, 0xe0c7d9, 0xd9e0c7][i] : [0xd9c7a6, 0xcfd6d2, 0xdccbb0][i]);
        });
      }
    };
  }
});
// ============ SECTION 3 · 01:20 THE PERFECT LIFE (shots 10-15) ============
// 10. "I transferred it yesterday."
SH({
  dur: 275 / 30, value: '3', status: 'RENT PAID', statusColor: CORAL, sub: 'LIE #3',
  caption: 'Your landlord asks about the rent.<br>"<b>I transferred it yesterday.</b>"',
  title: 'THE PERFECT LIFE',
  setup(K) {
    const scene = K.outdoor(), cam = K.camera(38);
    scene.add(K.road({ along: 'x', z: 0 }));
    scene.add(K.house(6, -7.5), K.house(-7, -8.5, { wall: 0xdccbb0, roof: 0x8a4b3c }));
    scene.add(K.tree(-10, 2.5, 1.2, 11), K.tree(10.5, 1.5, 1.3, 13), K.tree(11, -6, 1.1, 17));
    const hero = K.person(HERO); hero.baseY = .12; hero.position.set(5.2, .12, -4.6); hero.rotation.y = -PI / 2 + .1; scene.add(hero);
    const ll = K.person({ shirt: 0x6b5a48, hair: 0x8a8f96 }); ll.baseY = .12; ll.position.set(2.4, .12, -4.6); ll.rotation.y = PI / 2; scene.add(ll);
    const q = K.label('"Did you pay the rent?"', .85, CORAL); q.position.set(2.4, 2.4, -4.4); scene.add(q);
    const a = K.label('"I transferred it yesterday."', .85, GOLD); a.position.set(5.2, 2.5, -4.4); scene.add(a);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [3.2, 2.4, 2.2], [3.4, 1.8, .8], [4.4, 1.4, -4.6]);
        K.idle(hero, t); K.idle(ll, t + 2);
        const mo = t > 3.2 && t < 5 ? 1 + Math.sin(t * 18) * .6 : 1; hero.parts.mouth.scale.y = mo;
        q.pop(K.pop(t, 1)); a.pop(K.pop(t, 3.4));
      }
    };
  }
});
// 11. The receipt appears
SH({
  dur: 275 / 30, value: '3', status: 'RECEIPT FOUND', sub: 'PROOF APPEARS',
  caption: 'Your balance changes.<br>The payment appears in the history.',
  setup(K) {
    const scene = K.indoor(), cam = K.camera(30);
    const tb = K.table(); tb.position.set(0, 0, -1.5); scene.add(tb);
    const ph = phoneG(0, .81, -1.5); ph.scale.setScalar(2.2); scene.add(ph);
    const hero = K.person(HERO); hero.position.set(1.6, 0, -1.5); hero.rotation.y = -PI / 2; scene.add(hero);
    const ok = K.label('✓ RENT RECEIVED', .9, GREEN); ok.position.set(0, 1.6, -1.4); scene.add(ok);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [2.0, 1.85, 1.25], [1.35, 1.45, .6], [.35, 1.1, -1.55]);
        K.idle(hero, t);
        const on = K.ramp(t, 1.4, .8);
        ph.screen.material.emissive.setRGB(.1 * on, .55 * on, .3 * on);
        ok.pop(K.pop(t, 2));
      }
    };
  }
});
// 12. Free coffee for life
SH({
  dur: 275 / 30, value: '4', status: 'FREE FOR LIFE', statusColor: CORAL, sub: 'LIE #4',
  caption: 'At the coffee shop:<br>"<b>The owner said my coffee is free.</b>"',
  setup(K) {
    const scene = K.indoor({ wall: 0xd8c9ae }), cam = K.camera(36);
    scene.add(K.box(3.2, 1.05, .7, 0x7a4a26, .3, .525, -2.4));
    const cas = K.person({ shirt: 0xd9a441, longHair: true }); cas.position.set(.3, 0, -3.1); scene.add(cas);
    const hero = K.person(HERO); hero.position.set(-1.3, 0, -1); hero.rotation.y = PI - .3; scene.add(hero);
    scene.add(K.mug(.3, 1.05, -2.2), K.plate(-.4, 1.05, -2.3));
    const say = K.label('"My coffee is free."', .85, GOLD); say.position.set(-1.3, 2.4, -.9); scene.add(say);
    const own = K.label('FREE · LIFETIME · PROMISED', .8, CORAL); own.position.set(.3, 2.3, -2.2); scene.add(own);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [-.2, 1.9, 1.9], [-.5, 1.55, 1.1], [-.6, 1.35, -1.9]);
        K.idle(hero, t); K.idle(cas, t + 1);
        const mo = t > 1 && t < 2.8 ? 1 + Math.sin(t * 18) * .6 : 1; hero.parts.mouth.scale.y = mo;
        say.pop(K.pop(t, 1)); own.pop(K.pop(t, 3.2));
      }
    };
  }
});
// 13. Five-year veteran
SH({
  dur: 275 / 30, value: '5', status: '5-YEAR VETERAN', statusColor: CORAL, sub: 'LIE #5',
  caption: '"<b>I\'ve worked here for five years.</b>"<br>Your employment history rewrites itself.',
  setup(K) {
    const scene = K.indoor({ wall: 0xcfd6d2, floor: 0x8f8a80 }), cam = K.camera(36);
    const d1 = K.table(); d1.position.set(-1.9, 0, -2.4); scene.add(d1);
    const d2 = K.table(); d2.position.set(2.1, 0, -2.4); scene.add(d2);
    const hero = K.person(HERO); hero.position.set(-1.2, 0, -1.1); hero.rotation.y = .55; scene.add(hero);
    const col = K.person({ shirt: 0x4a6fc2 }); col.position.set(1.3, 0, -1.1); col.rotation.y = -.55; scene.add(col);
    const say = K.label('"Five years, remember?"', .85, GOLD); say.position.set(-1.2, 2.4, -1); scene.add(say);
    const hr = K.label('EMPLOYED · 5 YEARS', .85, CORAL); hr.position.set(.2, 2.7, -1.8); scene.add(hr);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [.3, 1.9, 2.4], [0, 1.5, 1.4], [.1, 1.3, -1.6]);
        K.idle(hero, t); K.idle(col, t + 4);
        const mo = t > .9 && t < 2.6 ? 1 + Math.sin(t * 18) * .6 : 1; hero.parts.mouth.scale.y = mo;
        say.pop(K.pop(t, .9)); hr.pop(K.pop(t, 3));
      }
    };
  }
});
// 14. The mayor calls you
SH({
  dur: 275 / 30, value: '6', status: 'THE MAYOR', statusColor: CORAL, sub: 'LIE #6',
  caption: '"<b>I know the mayor.</b>"<br>The next morning, his office calls you.',
  setup(K) {
    const scene = K.indoor({ wall: 0xdccbb0 }), cam = K.camera(34);
    const tb = K.table(); tb.position.set(0, 0, -1.5); scene.add(tb);
    const hero = K.person(HERO); hero.position.set(1.5, 0, -1.5); hero.rotation.y = -PI / 2; scene.add(hero);
    const ph = phoneG(-.2, .81, -1.4); scene.add(ph);
    const ring = K.label('MAYOR\'S OFFICE · CALLING', .85, CORAL); ring.position.set(-.2, 2.15, -1.4); scene.add(ring);
    const yrs = K.label('"KNOWN EACH OTHER FOR YEARS"', .8, GOLD); yrs.position.set(-.2, 2.75, -1.4); scene.add(yrs);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [1.1, 1.8, .6], [.7, 1.4, -.1], [-.1, 1.1, -1.45]);
        K.idle(hero, t);
        if (t > 1.6) ph.position.x = -.2 + Math.sin(t * 40) * .014;
        ring.pop(K.pop(t, 1.6)); yrs.pop(K.pop(t, 4.6));
        const pick = K.ramp(t, 5.4, .9);
        hero.parts.armR.rotation.x = -1.15 * pick;
      }
    };
  }
});
// 15. Effortless — the count explodes
SH({
  dur: 275 / 30, value: '47', status: 'EFFORTLESS', statusColor: CORAL, sub: 'IN ONE WEEK',
  caption: 'Within a week, lying is easier than truth.<br>Why study? Why apply? Why save?',
  setup(K) {
    const scene = K.outdoor(), cam = K.camera(38);
    scene.add(K.road({ along: 'x', z: 0 }));
    scene.add(K.house(-8, -8, { wall: 0xcfd6d2, roof: 0x4f5d53 }), K.house(9, -8.5), K.house(0, -9.5, { wall: 0xdccbb0, roof: 0x8a4b3c }));
    scene.add(K.tree(-11, 2, 1.2, 21), K.tree(11.5, 2.5, 1.25, 23));
    const hero = K.person(HERO); hero.baseY = .12; hero.position.set(0, .12, -4.6); scene.add(hero);
    const ws = ['GRADUATED', 'HIRED', 'RICH', 'FREE RENT'];
    const tags = ws.map((w, i) => { const l = K.label(w, .95, GOLD); scene.add(l); return l; });
    return {
      scene, camera: cam, update(t, k) {
        const a = -.5 + k * 1.1, r = 7.2;
        cam.position.set(Math.sin(a) * r, K.lerp(2.3, 2.9, k), Math.cos(a) * r + .5);
        cam.lookAt(0, 1.5, -4.6);
        hero.parts.armL.rotation.x = -2.75 * K.ramp(t, .6, .9);
        hero.parts.armR.rotation.x = -2.75 * K.ramp(t, .6, .9);
        tags.forEach((l, i) => {
          const ang = i * PI / 2 + t * .22;
          l.position.set(Math.cos(ang) * 2.3, 1.75 + Math.sin(t * .9 + i) * .22, -4.6 + Math.sin(ang) * 2.3);
          l.pop(K.pop(t, .9 + i * .8));
        });
      }
    };
  }
});
// ============ SECTION 4 · 02:15 THE SCIENCE OF LYING (shots 16-22) ============
// 16. People talk — small bubbles everywhere
SH({
  dur: 257 / 30, value: '47', status: 'REAL WORLD', sub: 'BEFORE THE POWER',
  caption: 'Here\'s something interesting.<br>Lying is already part of human communication.',
  title: 'THE SCIENCE OF LYING',
  setup(K) {
    const scene = K.outdoor(), cam = K.camera(38);
    scene.add(K.road({ along: 'x', z: 0 }));
    scene.add(K.tree(-9, 3, 1.2, 31), K.tree(9.5, -3, 1.25, 33));
    const mk = (x, z, ry) => { const p = K.person({ shirt: [0x4a6fc2, 0xd9a441, 0x7a5fb0, 0xd97a9a][(x + 9) % 4] }); p.baseY = .12; p.position.set(x, .12, z); p.rotation.y = ry; scene.add(p); return p; };
    const A1 = mk(-3.4, -4.6, PI / 2), A2 = mk(-2.3, -4.6, -PI / 2), B1 = mk(2.5, 4.6, PI / 2), B2 = mk(3.6, 4.6, -PI / 2);
    const bub = [A1, A2, B1, B2].map((p, i) => { const l = K.label('···', .6, '#f3ead8'); l.position.set(p.position.x, 2.35, p.position.z); scene.add(l); return l; });
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 2.6, 10], [0, 2.1, 7.5], [0, 1.3, 0]);
        [A1, A2, B1, B2].forEach((p, i) => K.idle(p, t + i * 1.3));
        bub.forEach((l, i) => {
          const t0 = .8 + i * 1.15;
          l.material.opacity = t > t0 ? Math.max(0, Math.sin((t - t0) * 2.1)) : 0;
          l.pop(K.pop(t, t0, .25));
        });
      }
    };
  }
});
// 17. The 1996 diary study
SH({
  dur: 257 / 30, value: '47', status: 'DEPAULO · 1996', sub: 'DIARY STUDY',
  caption: 'A 1996 diary study found:<br>students reported <b>~2 lies a day</b>, others ~1.',
  card: t => `<h4>Lies per day · diary study</h4><div style="display:flex;gap:2.4em;align-items:flex-end;justify-content:center;height:9.5em;padding:.4em 1em 0">` +
    [[2, '77 STUDENTS', GOLD, .5], [1, '70 COMMUNITY', '#b9b2c8', 1.1]].map(([v, y, c, t0]) => {
      const a = K.ramp(t, t0, .5);
      return `<div style="width:5em"><div style="font-weight:700;opacity:${a}">~${(v * a).toFixed(1)}</div><div style="height:${v * a * 3.2}em;background:${c};border-radius:.2em .2em 0 0;margin-top:.25em"></div><div style="font-size:.72em;opacity:.85;margin-top:.35em">${y}</div></div>`;
    }).join('') + `</div>`,
  setup(K) {
    const scene = K.outdoor({ mood: 'dusk' }), cam = K.camera(38);
    scene.add(K.road({ along: 'x', z: 0 }));
    scene.add(K.tree(-8, 2.6, 1.3, 41), K.tree(8.6, 2.2, 1.1, 43));
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 2.2, 9.5], [0, 1.9, 8], [0, 1.2, -4]);
      }
    };
  }
});
// 18. 60% tell no lies at all
SH({
  dur: 257 / 30, value: '47', status: '1,000 ADULTS', sub: '24-HOUR SURVEY',
  caption: 'But a survey of 1,000 adults found:<br><b>60% told no lies in 24 hours.</b>',
  card: t => `<h4>“How many lies in the last 24 h?”</h4><div style="display:flex;gap:2.4em;align-items:flex-end;justify-content:center;height:9.5em;padding:.4em 1em 0">` +
    [[60, 'ZERO LIES', GOLD, .5], [40, 'ONE OR MORE', CORAL, 1.1]].map(([v, y, c, t0]) => {
      const a = K.ramp(t, t0, .5);
      return `<div style="width:5em"><div style="font-weight:700;opacity:${a}">${Math.round(v * a)}%</div><div style="height:${v * a * .115}em;background:${c};border-radius:.2em .2em 0 0;margin-top:.25em"></div><div style="font-size:.72em;opacity:.85;margin-top:.35em">${y}</div></div>`;
    }).join('') + `</div>`,
  setup(K) {
    const scene = K.outdoor(), cam = K.camera(40);
    scene.add(K.tree(-7, 2, 1.3, 51), K.tree(7.5, 2.6, 1.15, 53), K.tree(0, 3.4, 1.2, 55));
    const cr = K.crowd(8, { seed: 9, spread: 1.2 }); cr.position.set(0, 0, -1); scene.add(cr);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 2.4, 9], [0, 2, 7.5], [0, 1.2, -1]);
        cr.children.forEach((p, i) => K.idle(p, t + i * .7));
      }
    };
  }
});
// 19. Half of all lies come from 5%
SH({
  dur: 257 / 30, value: '47', status: 'THE 5%', statusColor: CORAL, sub: 'CONCENTRATION',
  caption: 'Almost half of all reported lies<br>come from just <b>5% of people</b>.',
  card: t => {
    const on = Math.round(100 * K.ramp(t, .5, 1.4));
    let sq = ''; for (let i = 0; i < 100; i++) {
      const hot = i < 5, lit = i < on;
      sq += `<span style="display:inline-block;width:1.05em;height:1.05em;margin:.09em;border-radius:.18em;background:${lit ? (hot ? CORAL : '#b9b2c8') : 'rgba(185,178,200,.14)'}"></span>`;
    }
    return `<h4>Who tells the lies?</h4><div style="width:24em;margin:.3em auto 0">${sq}</div><div style="font-size:.78em;opacity:.85;margin-top:.5em">red = the 5% · nearly half of all lies</div>`;
  },
  setup(K) {
    const scene = K.outdoor({ mood: 'dusk' }), cam = K.camera(38);
    scene.add(K.road({ along: 'x', z: 0 }));
    scene.add(K.tree(-9, 2.4, 1.25, 61), K.tree(9, -2.6, 1.2, 63));
    return { scene, camera: cam, update(t, k) { K.dolly(cam, k, [0, 2.1, 9], [0, 1.8, 7.6], [0, 1.1, -4]); } };
  }
});
// 20. Rarely vs constantly
SH({
  dur: 257 / 30, value: '47', status: 'UNEQUAL', sub: 'NOT DISTRIBUTED',
  caption: 'Lying isn\'t distributed equally.<br>Some rarely do it. Others constantly.',
  setup(K) {
    const scene = K.outdoor(), cam = K.camera(36);
    scene.add(K.road({ along: 'x', z: 0 }));
    const calm = K.person({ shirt: 0x4f9a6a }); calm.baseY = .12; calm.position.set(-2.6, .12, -4.6); calm.rotation.y = PI / 2; scene.add(calm);
    const busy = K.person({ shirt: 0xd97a9a, longHair: true }); busy.baseY = .12; busy.position.set(1.8, .12, -4.6); busy.rotation.y = PI / 2; scene.add(busy);
    const l1 = K.label('RARELY', .8, GREEN); l1.position.set(-2.6, 2.45, -4.6); scene.add(l1);
    const l2 = K.label('CONSTANTLY', .8, CORAL); l2.position.set(1.8, 2.45, -4.6); scene.add(l2);
    const bub = []; for (let i = 0; i < 3; i++) { const b = K.label('···', .55, '#f3ead8'); b.position.set(1.8 + (i - 1) * .5, 2.9, -4.6); scene.add(b); bub.push(b); }
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [-.4, 2.2, 4.6], [-.4, 1.9, 3.2], [-.4, 1.5, -4.6]);
        K.idle(calm, t); K.idle(busy, t * 1.6);
        l1.pop(K.pop(t, 1)); l2.pop(K.pop(t, 1.4));
        bub.forEach((b, i) => { b.material.opacity = t > 2 + i * .7 ? Math.max(0, Math.sin((t - 2 - i * .7) * 2.4)) : 0; });
      }
    };
  }
});
// 21. The illusory truth effect
SH({
  dur: 257 / 30, value: '47', status: 'ILLUSORY TRUTH', sub: 'FAMILIAR ≠ TRUE',
  caption: 'Psychologists call it the <i>illusory truth effect</i>:<br>repeat a claim — it starts to feel true.',
  card: t => {
    let rows = ''; for (let i = 0; i < 5; i++) {
      const a = K.ramp(t, .5 + i * .5, .45);
      rows += `<div style="font-size:1.12em;font-weight:700;opacity:${(.25 + .75 * a).toFixed(2)};color:${i === 4 ? GOLD : 'inherit'};margin:.24em 0">“People say this all the time.”</div>`;
    }
    return `<h4>Say it again. And again.</h4>${rows}`;
  },
  setup(K) {
    const scene = K.indoor(), cam = K.camera(36);
    const hero = K.person(HERO); hero.position.set(2.2, 0, -1.6); hero.rotation.y = -PI / 2 - .2; scene.add(hero);
    return { scene, camera: cam, update(t, k) { K.dolly(cam, k, [1.4, 1.6, 2.2], [1.1, 1.45, 1.5], [1.4, 1.25, -1.4]); K.idle(hero, t); } };
  }
});
// 22. Feeling true → becoming true
SH({
  dur: 258 / 30, value: '47', status: 'THE DIFFERENCE', statusColor: CORAL, sub: 'BELIEF → REALITY',
  caption: 'In your world, repetition changes belief.<br>In this world, it changes <b>reality</b>.',
  setup(K) {
    const scene = K.indoor(), cam = K.camera(32);
    const tb = K.table(); tb.position.set(0, 0, -1.5); scene.add(tb);
    const sg = K.sign('FEELS TRUE', 1.7, .5, { bg: '#f3ead8', color: '#1c1c22' });
    sg.material.transparent = true; sg.position.set(0, 1.75, -1.5); scene.add(sg);
    const bar = K.box(1.15, .26, .26, 0xe8c56a, 0, .82, -1.5, { emissive: 0x7a5a18, emissiveIntensity: .8 });
    bar.scale.setScalar(.001); scene.add(bar);
    const hero = K.person(HERO); hero.position.set(1.9, 0, -1.2); hero.rotation.y = -PI / 2 - .3; scene.add(hero);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [1.1, 1.7, .9], [.7, 1.35, .05], [0, 1.15, -1.5]);
        K.idle(hero, t);
        const u = K.ramp(t, 2.4, 1.2);
        sg.material.opacity = 1 - u;
        sg.position.y = K.lerp(1.75, 1.3, u);
        bar.scale.setScalar(Math.max(.001, K.pop(t, 3.4, .5) * 1.1));
        bar.rotation.y = u * 1.5;
      }
    };
  }
});
// ============ SECTION 5 · 03:15 THE BRIDGE (shots 23-29) ============
// Shared damaged-bridge set. Bus lives ONLY in the far lane (z = -1.7);
// people live ONLY on the pavement (z = 4.6) — 5.6 m of separation, always.
function bridgeKit(scene) {
  scene.add(K.road({ along: 'x', z: 0 }));
  scene.add(K.box(9, .12, 22, 0x14181e, 0, .05, 0));                       // washed-out chasm
  const L = K.box(3, .12, 8.6, 0x9aa2ad, -3, .1, 0);
  const M = K.box(3, .12, 8.6, 0x9aa2ad, 0, .1, 0);
  const R = K.box(3, .12, 8.6, 0x9aa2ad, 3, .1, 0);
  scene.add(L, M, R);
  scene.add(K.box(9.6, .14, .1, 0xf2ead6, 0, .3, 4.25), K.box(9.6, .14, .1, 0xf2ead6, 0, .3, -4.25));
  const sup = [[-3, -3.2], [3, -3.2], [-3, 3.2], [3, 3.2]].map(([x, z]) => K.box(.28, 1.7, .3, 0x8a6a44, x, -.62, z));
  sup.forEach(s => scene.add(s));
  scene.add(K.mountain(-42, -30, 3.2, 0x6f7a88), K.mountain(30, -38, 3.8, 0x76818f), K.mountain(-6, -46, 4.4, 0x66707e));
  scene.add(K.house(-16, -10), K.house(16, -10.5, { wall: 0xdccbb0, roof: 0x8a4b3c }));
  scene.add(K.tree(-10.5, 2.8, 1.2, 71), K.tree(10.2, 2.6, 1.15, 73), K.tree(-9.6, -3, 1.3, 75), K.tree(9.8, -3.2, 1.25, 77));
  return { L, M, R, sup };
}
function damage(kit, mul = 1) {
  kit.L.rotation.z = -.07 * mul; kit.R.rotation.z = .07 * mul;
  kit.M.rotation.z = .17 * mul; kit.M.position.y = .1 - .07 * mul;
  kit.sup.forEach((s, i) => { s.rotation.z = (i % 2 ? 1 : -1) * .16 * mul; s.rotation.x = (i < 2 ? 1 : -1) * .09 * mul; });
}
// 23. The storm breaks the bridge
SH({
  dur: 257 / 30, value: '47', status: 'STORM', statusColor: CORAL, sub: 'EVENING',
  caption: 'One evening, a storm damages<br>a bridge outside your city.',
  title: 'WHEN THE LIE BECOMES A WEAPON',
  setup(K) {
    const scene = K.outdoor({ mood: 'dusk' }), cam = K.camera(40);
    const kit = bridgeKit(scene);
    [[-7, 9.5, 0x3a4148], [8, 10, 0x333a40], [1, 11, 0x414850]].forEach(([x, y, c]) => { const cl = K.ball(2.4, c); cl.position.set(x, y, -14); cl.scale.set(1.6, .8, 1.2); scene.add(cl); });
    damage(kit);
    return { scene, camera: cam, update(t, k) { K.dolly(cam, k, [15, 4.4, 15], [10.5, 3.4, 12.5], [0, 1, -2]); } };
  }
});
// 24. Cracks and bending steel
SH({
  dur: 257 / 30, value: '47', status: 'DAMAGE RISING', statusColor: CORAL, sub: 'HOLDING BY A THREAD',
  caption: 'Concrete is cracking.<br>Steel supports are bending.',
  setup(K) {
    const scene = K.outdoor({ mood: 'dusk' }), cam = K.camera(34);
    const kit = bridgeKit(scene);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [-9.5, 2.6, 6.5], [-2.5, 1.9, 4.6], [0, .4, 0]);
        damage(kit, 1 + k * .18);
      }
    };
  }
});
// 25. The school bus — STOP!
SH({
  dur: 257 / 30, value: '47', status: '23 ABOARD', statusColor: CORAL, sub: 'SCHOOL BUS',
  caption: 'A school bus approaches.<br>Emergency workers shout: "<b>STOP!</b>"',
  setup(K) {
    const scene = K.outdoor({ mood: 'dusk' }), cam = K.camera(38);
    const kit = bridgeKit(scene); damage(kit);
    const bu = bus(); bu.rotation.y = -PI / 2; bu.position.set(-16, 0, -1.7); scene.add(bu);
    const sp = signPole('STOP', .95, .6, 2, '#e33d2e'); sp.position.set(-8.8, 0, 4.2); scene.add(sp);
    const w1 = K.person({ shirt: 0xd97a2a }); w1.baseY = .12; w1.position.set(-6.6, .12, 4.6); w1.rotation.y = PI; scene.add(w1);
    const w2 = K.person({ shirt: 0xf2ead8 }); w2.baseY = .12; w2.position.set(-4.4, .12, 4.6); w2.rotation.y = PI; scene.add(w2);
    const stop = K.label('"STOP!"', 1.1, CORAL); stop.position.set(-7.4, 3.3, 3.4); scene.add(stop);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [-4, 3.2, 13], [-5.5, 2.5, 10], [-9, 1.2, -1.7]);
        bu.position.x = -16 + 5 * K.smooth(k * 1.25);
        K.idle(w1, t); K.idle(w2, t + 2);
        const shout = K.ramp(t, 2, .7);
        w1.parts.armR.rotation.x = -2.7 * shout; w2.parts.armR.rotation.x = -2.7 * K.ramp(t, 2.3, .7);
        stop.pop(K.pop(t, 2.1, .3));
      }
    };
  }
});
// 26. The lie that saves the bus
SH({
  dur: 257 / 30, value: '48', status: 'THE BRIDGE LIE', statusColor: CORAL, sub: 'LIE #48',
  caption: 'You step forward and say:<br>"<b>This bridge is strong enough<br>to hold the bus.</b>"',
  setup(K) {
    const scene = K.outdoor({ mood: 'dusk' }), cam = K.camera(38);
    const kit = bridgeKit(scene); damage(kit);
    const bu = bus(); bu.rotation.y = -PI / 2; bu.position.set(-11, 0, -1.7); scene.add(bu);
    const sp = signPole('STOP', .95, .6, 2, '#e33d2e'); sp.position.set(-8.8, 0, 4.2); scene.add(sp);
    const w1 = K.person({ shirt: 0xd97a2a }); w1.baseY = .12; w1.position.set(-6.6, .12, 4.6); w1.rotation.y = PI; scene.add(w1);
    const w2 = K.person({ shirt: 0xf2ead8 }); w2.baseY = .12; w2.position.set(-4.4, .12, 4.6); w2.rotation.y = PI; scene.add(w2);
    const hero = K.person(HERO); hero.baseY = .12; hero.position.set(1.8, .12, 4.6); hero.rotation.y = PI; scene.add(hero);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [3.6, 2.6, 9.5], [2.2, 2, 7.6], [0, 1.2, -1]);
        const step = K.smooth((t - .4) / 1.6);
        hero.position.z = K.lerp(4.6, 3.95, step);
        if (step < 1) K.walk(hero, t * 7); else { hero.position.y = hero.baseY; K.idle(hero, t); }
        const mo = t > 2.6 ? 1 + Math.sin(t * 17) * .7 : 1; hero.parts.mouth.scale.y = mo;
        K.idle(w1, t + 3); K.idle(w2, t + 1);
      }
    };
  }
});
// 27. Reality repairs the bridge
SH({
  dur: 257 / 30, value: '48', status: 'REALITY REPAIRS', statusColor: CORAL, sub: 'ACCEPTED',
  caption: 'A second later, the cracks disappear.<br>The steel strengthens. The concrete heals.',
  setup(K) {
    const scene = K.outdoor({ mood: 'dusk' }), cam = K.camera(34);
    const kit = bridgeKit(scene); damage(kit);
    const bu = bus(); bu.rotation.y = -PI / 2; bu.position.set(-11, 0, -1.7); scene.add(bu);
    const fl = new T.Mesh(new T.SphereGeometry(.55, 10, 8), new T.MeshBasicMaterial({ color: 0xfff6d8, transparent: true, opacity: 0 }));
    fl.position.set(0, 1.3, 0); scene.add(fl);
    const tag = K.label('REPAIRED', 1, GOLD); tag.position.set(0, 2.6, 0); scene.add(tag);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [-7, 2.8, 8], [-2, 2.1, 5.6], [0, .6, 0]);
        const u = K.ramp(t, 1.6, 1.6);
        damage(kit, 1 - u);
        if (u >= 1) damage(kit, 0);
        fl.material.opacity = Math.max(0, Math.sin(Math.min(1, u) * PI) * .9);
        fl.scale.setScalar(.001 + u * .9);
        tag.pop(K.pop(t, 3.2, .4));
      }
    };
  }
});
// 28. Twenty-three children make it home
SH({
  dur: 257 / 30, value: '48', status: '23 SAFE', statusColor: GOLD, sub: 'MIRACLE',
  caption: 'The bus crosses safely.<br>Twenty-three children make it home.',
  setup(K) {
    const scene = K.outdoor({ mood: 'dusk' }), cam = K.camera(40);
    const kit = bridgeKit(scene); damage(kit, 0);
    const bu = bus(); bu.rotation.y = -PI / 2; bu.position.set(-11, 0, -1.7); scene.add(bu);
    const sp = signPole('STOP', .95, .6, 2, '#e33d2e'); sp.position.set(-8.8, 0, 4.2); scene.add(sp);
    const w1 = K.person({ shirt: 0xd97a2a }); w1.baseY = .12; w1.position.set(-6.6, .12, 4.6); w1.rotation.y = PI; scene.add(w1);
    const w2 = K.person({ shirt: 0xf2ead8 }); w2.baseY = .12; w2.position.set(-4.4, .12, 4.6); w2.rotation.y = PI; scene.add(w2);
    const hero = K.person(HERO); hero.baseY = .12; hero.position.set(1.3, .12, 3.95); hero.rotation.y = PI; scene.add(hero);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [-13, 3.4, 12], [-6, 2.9, 9.5], [0, 1.1, -1.7]);
        bu.position.x = -11 + 22.5 * K.smooth(k * 1.15);
        bu.position.y = .16 * K.smooth((bu.position.x + 10.4) / .9) * (1 - K.smooth((bu.position.x - 4) / .9));
        K.idle(w1, t); K.idle(w2, t + 2); K.idle(hero, t + 4);
      }
    };
  }
});
// 29. Millions of views by morning
SH({
  dur: 258 / 30, value: '48', status: 'MIRACLE WORKER', statusColor: GOLD, sub: 'VIRAL',
  caption: 'Someone records everything.<br>By morning: millions of views.',
  setup(K) {
    const scene = K.outdoor({ mood: 'night' }), cam = K.camera(38);
    const kit = bridgeKit(scene); damage(kit, 0);
    const bu = bus(); bu.rotation.y = -PI / 2; bu.position.set(10, 0, -1.7); scene.add(bu);
    const by = K.person({ shirt: 0x7a5fb0, longHair: true }); by.baseY = .12; by.position.set(-3, .12, 4.6); by.rotation.y = PI; scene.add(by);
    const ph = phoneG(-2.62, 1.98, 4.4); ph.rotation.y = PI; scene.add(ph);
    const hero = K.person(HERO); hero.baseY = .12; hero.position.set(1.8, .12, 4.6); hero.rotation.y = 0; scene.add(hero);
    const v1 = K.label('1.2M VIEWS', .8, GOLD); v1.position.set(-3, 3.2, 4.6); scene.add(v1);
    const v2 = K.label('7.4M VIEWS', .8, GOLD); v2.position.set(-3, 3.2, 4.6); scene.add(v2);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [4, 2.6, 10], [1.5, 2.2, 8], [-.8, 1.5, 4]);
        bu.position.x = 10 + t * .55;
        K.idle(by, t); by.parts.armR.rotation.x = -2.85;
        if (t > 1.5) K.walk(hero, t * 6.5), hero.position.x = 1.8 + K.smooth((t - 1.5) / 2) * 3.6;
        v1.pop(K.pop(t, 2.6)); v2.pop(K.pop(t, 5)); v2.position.y = 3.2 + (t > 5 ? (t - 5) * .5 : 0);
      }
    };
  }
});
// ============ SECTION 6 · 04:15 EVERYONE WANTS A LIE (shots 30-36) ============
// 30. The press finds you
SH({
  dur: 278 / 30, value: '48', status: 'DAY 12', sub: 'THE FAME',
  caption: 'Within days, powerful people<br>start looking for you.',
  title: 'EVERYONE WANTS A LIE',
  setup(K) {
    const scene = K.outdoor(), cam = K.camera(38);
    scene.add(K.road({ along: 'x', z: 9 }));
    scene.add(K.tree(-10, 3.5, 1.2, 81), K.tree(10, 4, 1.2, 83));
    const po = podium(); po.position.set(0, 0, -3); scene.add(po);
    [[-.28, -.12], [0, 0], [.28, .12]].forEach(([x, tilt]) => {
      const m = K.cyl(.025, .025, .5, 0x1c1e21, x, 1.37, -2.8, 6); m.rotation.x = .28 + tilt; scene.add(m);
      const tip = K.ball(.05, 0x9aa2ad); tip.position.set(x, 1.62, -2.73); scene.add(tip);
    });
    const hero = K.person(HERO); hero.position.set(0, 0, -3.55); scene.add(hero);
    const r1 = K.person({ shirt: 0x4a6fc2 }); r1.position.set(-3, 0, .9); r1.rotation.y = PI / 2 - .35; scene.add(r1);
    const r2 = K.person({ shirt: 0xd9a441, longHair: true }); r2.position.set(0, 0, 1.7); r2.rotation.y = PI; scene.add(r2);
    const r3 = K.person({ shirt: 0x7a5fb0 }); r3.position.set(3, 0, .9); r3.rotation.y = -PI / 2 + .35; scene.add(r3);
    const flashes = [r1, r2, r3].map(p => { const f = new T.Mesh(new T.SphereGeometry(.07, 6, 5), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })); f.position.set(p.position.x, 1.7, p.position.z - .5); scene.add(f); return f; });
    const hd = K.sign('WHO IS THE MIRACLE WORKER?', 4.4, .62, { bg: '#1c1c22', color: GOLD, font: '800 28px Inter, Arial, sans-serif' });
    hd.position.set(0, 3.6, -3); scene.add(hd);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 2.2, 8.5], [0, 1.8, 6.5], [0, 1.5, -3]);
        K.idle(hero, t); [r1, r2, r3].forEach((p, i) => K.idle(p, t + i * 1.1));
        flashes.forEach((f, i) => { f.material.opacity = Math.pow(Math.max(0, Math.sin(t * 6.5 + i * 2.4)), 6) * .95; });
        hd.rotation.z = Math.sin(t * 1.3) * .04;
      }
    };
  }
});
// 31. Everyone has a request
SH({
  dur: 278 / 30, value: '48', status: 'THE REQUESTS', sub: 'EVERYONE ASKS',
  caption: 'Politicians. Businesses. Banks.<br>Governments.',
  card: t => `<h4>What they want you to say</h4><div style="text-align:left;font-size:1.04em;line-height:1.7">` +
    [['“The elections were fair.”', GOLD, .5], ['“The product is completely safe.”', GOLD, 1], ['“The bank is financially secure.”', GOLD, 1.5], ['“That person does not exist.”', CORAL, 2]]
      .map(([s, c, t0]) => `<div style="opacity:${K.ramp(t, t0, .4).toFixed(2)};color:${c}">▸ ${s}</div>`).join('') + `</div>`,
  setup(K) {
    const scene = K.indoor({ mood: 'night' }), cam = K.camera(36);
    const tb = K.table({ w: 3.2, d: 1.2 }); tb.position.set(0, 0, -2.4); scene.add(tb);
    const o1 = K.person({ shirt: 0x33404f }); o1.position.set(-1, .13, -2.4); scene.add(o1); K.sit(o1);
    const o2 = K.person({ shirt: 0x5a4a6f, longHair: true }); o2.position.set(1, .13, -2.4); scene.add(o2); K.sit(o2);
    const hero = K.person(HERO); hero.position.set(0, 0, .4); hero.rotation.y = PI; scene.add(hero);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 2, 4.2], [0, 1.7, 3.2], [0, 1.3, -2]);
        K.idle(hero, t); K.idle(o1, t + 1); K.idle(o2, t + 2);
      }
    };
  }
});
// 32. The politician's ask
SH({
  dur: 278 / 30, value: '48', status: 'THE REQUEST', sub: 'TOMORROW · LIVE',
  caption: 'A politician asks you to announce:<br>"<b>The elections were fair.</b>"',
  setup(K) {
    const scene = K.outdoor({ mood: 'night' }), cam = K.camera(38);
    scene.add(K.road({ along: 'x', z: 9 }));
    const po = podium(); po.position.set(0, 0, -3); scene.add(po);
    const pol = K.person({ shirt: 0x33404f, hair: 0x8a8f96 }); pol.position.set(1.55, 0, -3); pol.rotation.y = -PI / 2 - .2; scene.add(pol);
    const hero = K.person(HERO); hero.position.set(-1.3, 0, -1.3); hero.rotation.y = PI - .4; scene.add(hero);
    const say = K.label('"Say the elections were fair."', .85, GOLD); say.position.set(1.55, 2.5, -2.9); scene.add(say);
    const cr = K.crowd(6, { seed: 15, spread: 1.25 }); cr.position.set(-.2, 0, 5.6); scene.add(cr);
    const s1 = signPole('FAIR?', .8, .5, 2.1, '#f3ead8'); s1.position.set(-2.6, 0, 5.2); scene.add(s1);
    const s2 = signPole('VOTE?', .8, .5, 2.1, '#f3ead8'); s2.position.set(2.8, 0, 6); scene.add(s2);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [-.2, 2.5, 6], [.3, 1.9, 4.2], [.3, 1.5, -3]);
        K.idle(hero, t); K.idle(pol, t + 2);
        cr.children.forEach((p, i) => K.idle(p, t + i));
        say.pop(K.pop(t, 1.5));
      }
    };
  }
});
// 33. The sentence they wrote for you
SH({
  dur: 278 / 30, value: '48', status: 'DANGER', statusColor: CORAL, sub: 'READ IT ALIVE',
  caption: '"<b>There is no one who opposes<br>this government.</b>"',
  alert: { label: 'OUTSIDE', value: 'THOUSANDS PROTEST' },
  setup(K) {
    const scene = K.indoor({ mood: 'night' }), cam = K.camera(34);
    const po = podium(); po.position.set(0, 0, -2.5); scene.add(po);
    const hero = K.person(HERO); hero.position.set(0, 0, -3.15); hero.rotation.y = PI; scene.add(hero);
    const pol = K.person({ shirt: 0x33404f }); pol.position.set(1.8, 0, -2); pol.rotation.y = -PI / 2; scene.add(pol);
    const s1 = K.sign('NO ONE OPPOSES', 2.6, .5, { bg: '#1c1c22', color: CORAL, font: '800 44px Inter, Arial, sans-serif' }); s1.position.set(0, 2.9, -3.9); scene.add(s1);
    const s2 = K.sign('THIS GOVERNMENT', 2.6, .5, { bg: '#1c1c22', color: CORAL, font: '800 44px Inter, Arial, sans-serif' }); s2.position.set(0, 2.3, -3.9); scene.add(s2);
    const red = new T.Mesh(new T.SphereGeometry(.06, 8, 6), new T.MeshStandardMaterial({ color: 0x330000, emissive: 0xff2010, emissiveIntensity: 3 }));
    red.position.set(-.55, 1.75, -2.5); scene.add(red);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 1.9, 3.4], [0, 1.75, 1.6], [0, 1.45, -3.1]);
        K.idle(hero, t); K.idle(pol, t + 1);
        red.material.emissiveIntensity = 2 + Math.sin(t * 9) * 1.6;
      }
    };
  }
});
// 34. The universe doesn't do justice
SH({
  dur: 279 / 30, value: '48', status: 'UNKNOWN', statusColor: CORAL, sub: 'WHAT WOULD HAPPEN?',
  caption: 'The universe doesn\'t care about justice.<br>It only needs to make your sentence true.',
  setup(K) {
    const scene = K.outdoor({ mood: 'night' }), cam = K.camera(40);
    scene.add(K.road({ along: 'x', z: 9 }));
    const po = podium(); po.position.set(0, 0, -3); scene.add(po);
    const hero = K.person(HERO); hero.position.set(0, 0, -3.55); hero.rotation.y = PI; scene.add(hero);
    const fadeG = new T.Group(); scene.add(fadeG);
    const cr = K.crowd(6, { seed: 21, spread: 1.25 }); cr.position.set(-.2, 0, 5.6); fadeG.add(cr);
    const s1 = signPole('FAIR?', .8, .5, 2.1, '#f3ead8'); s1.position.set(-2.6, 0, 5.2); fadeG.add(s1);
    const s2 = signPole('VOTE?', .8, .5, 2.1, '#f3ead8'); s2.position.set(2.8, 0, 6); fadeG.add(s2);
    fadeG.traverse(o => { if (o.material) { o.material.transparent = true; } });
    const l1 = K.label('MAYBE THEY DISAPPEAR', .85, CORAL); l1.position.set(-.2, 2.9, 5.6); scene.add(l1);
    const l2 = K.label('OR THE MEMORY OF THEM', .85, CORAL); l2.position.set(-.2, 2.2, 5.6); scene.add(l2);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 2.4, 8], [0, 2.1, 6.6], [0, 1.4, 2]);
        K.idle(hero, t);
        const fade = 1 - .93 * K.smooth((t - 1.4) / 3.2);
        fadeG.traverse(o => { if (o.material) o.material.opacity = fade; });
        l1.pop(K.pop(t, 2.4)); l2.pop(K.pop(t, 4.6));
        l1.material.opacity = l2.material.opacity = 1 - .6 * K.smooth((t - 1.4) / 3.2);
      }
    };
  }
});
// 35. You refuse
SH({
  dur: 279 / 30, value: '48', status: 'REFUSED', statusColor: GOLD, sub: 'THE LINE HELD',
  caption: 'You don\'t say it.<br>Maybe the protesters would disappear.',
  setup(K) {
    const scene = K.outdoor({ mood: 'night' }), cam = K.camera(36);
    scene.add(K.road({ along: 'x', z: 9 }));
    const po = podium(); po.position.set(0, 0, -3); scene.add(po);
    const pol = K.person({ shirt: 0x33404f }); pol.position.set(1.8, 0, -2.1); pol.rotation.y = -PI / 2 - .3; scene.add(pol);
    const hero = K.person(HERO); hero.position.set(-1.4, 0, -3); hero.rotation.y = .5; scene.add(hero);
    const cr = K.crowd(6, { seed: 21, spread: 1.25 }); cr.position.set(-.2, 0, 5.6); scene.add(cr);
    const ok = K.label('NOT SAID', .95, GREEN); ok.position.set(-1.4, 2.6, -3); scene.add(ok);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [1.8, 2.3, 4.6], [-.4, 1.9, 3.4], [-.6, 1.4, -3]);
        K.idle(hero, t);
        hero.parts.head.rotation.x = .3 * K.ramp(t, 1.2, 1.2);
        K.idle(pol, t + 3); cr.children.forEach((p, i) => K.idle(p, t + i));
        ok.pop(K.pop(t, 2.4));
      }
    };
  }
});
// 36. The trap
SH({
  dur: 280 / 30, value: '48', status: 'THE TRAP', statusColor: CORAL, sub: 'NO CONTROL',
  caption: 'You can choose the lie.<br>You cannot choose how reality fulfills it.',
  setup(K) {
    const scene = K.indoor({ mood: 'night' }), cam = K.camera(36);
    const hero = K.person(HERO); hero.position.set(0, 0, -2.2); hero.rotation.y = PI; scene.add(hero);
    const s1 = K.sign('YOU CHOOSE THE LIE', 3.4, .55, { bg: '#1c1c22', color: GOLD, font: '800 40px Inter, Arial, sans-serif' }); s1.position.set(0, 2.5, -2.2); scene.add(s1);
    const s2 = K.sign('REALITY FILLS THE REST', 3.4, .55, { bg: '#1c1c22', color: CORAL, font: '800 34px Inter, Arial, sans-serif' }); s2.material.transparent = true; s2.position.set(0, 1.75, -2.2); scene.add(s2);
    const q = K.label('?', 2.4, CORAL); q.position.set(0, 3.05, -2.2); scene.add(q);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 2, 2.6], [0, 1.9, 1.9], [0, 1.9, -2.4]);
        K.idle(hero, t);
        hero.parts.head.rotation.x = .12;
        s2.material.opacity = K.ramp(t, 1.8, .9);
        q.material.rotation = Math.sin(t * 1.4) * .28;
        q.pop(K.pop(t, 3));
      }
    };
  }
});
// ============ SECTION 7 · 05:20 THE REAL CONSEQUENCE (shots 37-43) ============
// 37. Weeks of small edits
SH({
  dur: 257 / 30, value: '48', status: 'WEEKS LATER', sub: 'THE DARK ROOM',
  caption: 'For weeks, you\'ve been<br>making little changes.',
  title: 'THE REAL CONSEQUENCE',
  setup(K) {
    const scene = K.indoor({ mood: 'night' }), cam = K.camera(36);
    const hero = K.person(HERO); hero.position.set(-.6, 0, -1.4); hero.rotation.y = .35; scene.add(hero);
    [[-2.3, 2.1, 0x3a4058], [-.1, 2.1, 0x40384f], [2, 2.1, 0x36404f]].forEach(([x, y, c]) => { const f = photoFrame(1, .75, c); f.position.set(x, y, -3.85); scene.add(f); });
    const tb = K.table({ w: .9, d: .9 }); tb.position.set(2.6, 0, -2.6); scene.add(tb);
    const lamp = K.box(.16, .3, .16, 0xf2dca0, 2.6, .95, -2.6, { emissive: 0xffd98a, emissiveIntensity: 1.6 }); scene.add(lamp);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [.8, 1.9, 3.6], [.1, 1.6, 2.4], [-.4, 1.4, -2.6]);
        K.idle(hero, t * .7);
        lamp.material.emissiveIntensity = 1.5 + Math.sin(t * 13) * .25;
      }
    };
  }
});
// 38. Everything was rewritten
SH({
  dur: 257 / 30, value: '48', status: 'EDITS EVERYWHERE', sub: 'ALL REWRITTEN',
  caption: 'Jobs. Relationships.<br>People\'s memories.',
  setup(K) {
    const scene = K.indoor({ mood: 'night' }), cam = K.camera(36);
    const hero = K.person(HERO); hero.position.set(0, 0, -.8); hero.rotation.y = PI; scene.add(hero);
    const frames = [[-2.3, 'JOB'], [-.1, 'FRIENDS'], [2, 'MEMORIES']].map(([x, w]) => {
      const f = photoFrame(1.1, .8, 0x3a4058); f.position.set(x, 2.1, -3.85); scene.add(f);
      const l = K.label(w, .7, GOLD); l.position.set(x, 3, -3.8); scene.add(l);
      return { f, l, x };
    });
    const q = K.label('→ ?', 1.1, CORAL); q.position.set(-.1, 1.1, -3.8); scene.add(q);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 1.9, 3.2], [0, 1.75, 2.3], [0, 1.9, -3.6]);
        K.idle(hero, t);
        frames.forEach(({ f, l, x }, i) => {
          const u = K.ramp(t, .8 + i * .8, .6);
          f.pic.material.color.setHex(u > .5 ? [0xc7a44a, 0xa44ac7, 0x4a74c7][i] : 0x3a4058);
          l.pop(K.pop(t, .8 + i * .8));
        });
        q.pop(K.pop(t, 4.4));
      }
    };
  }
});
// 39. ×99 — THE COST
SH({
  dur: 257 / 30, value: '99', status: 'THE COST', statusColor: CORAL, sub: '+51 UNTOLD LIES',
  caption: 'And slowly, you notice<br>something <b>disturbing</b>.',
  setup(K) {
    const scene = K.indoor({ mood: 'night' }), cam = K.camera(32);
    const hero = K.person(HERO); hero.position.set(0, 0, -1.4); scene.add(hero);
    [[-2.4, 2.1], [-.1, 2.1], [2.1, 2.1]].forEach(([x, y]) => { const f = photoFrame(1, .75, 0x23273a); f.position.set(x, y, -3.85); scene.add(f); });
    const lamp = K.box(.16, .3, .16, 0xf2dca0, 2.7, .95, -2.7, { emissive: 0xffd98a, emissiveIntensity: 1.4 }); scene.add(lamp);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 1.7, 3.4], [0, 1.5, 1.7], [0, 1.35, -1.4]);
        const look = K.ramp(t, 1.2, 1.1);
        hero.parts.armL.rotation.x = -1.3 * look; hero.parts.armR.rotation.x = -1.3 * look;
        hero.parts.armL.rotation.z = .5 * look; hero.parts.armR.rotation.z = -.5 * look;
        hero.parts.head.rotation.x = .34 * look;
        lamp.material.emissiveIntensity = Math.max(.25, 1.4 - t * .12);
        K.idle(hero, t * .5);
      }
    };
  }
});
// 40. Your best friend doesn't know you
SH({
  dur: 257 / 30, value: '99', status: 'STRANGERS?', statusColor: CORAL, sub: 'THE OLD YOU IS GONE',
  caption: 'Your closest friends no longer know<br>the person you used to be.',
  setup(K) {
    const scene = K.indoor({ mood: 'night' }), cam = K.camera(34);
    const hero = K.person(HERO); hero.position.set(-1.3, 0, -1.6); hero.rotation.y = PI / 2; scene.add(hero);
    const fr = K.person({ shirt: 0x4a6fc2 }); fr.position.set(1.3, 0, -1.6); fr.rotation.y = -PI / 2; scene.add(fr);
    const q = K.label('?', 1.5, CORAL); q.position.set(1.3, 2.6, -1.6); scene.add(q);
    const old = K.label('“WHO WERE YOU AGAIN?”', .8, CORAL); old.position.set(1.3, 3.25, -1.5); scene.add(old);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [.4, 1.7, 2.8], [0, 1.5, 1.9], [0, 1.4, -1.6]);
        K.idle(hero, t); K.idle(fr, t + 2);
        hero.parts.head.rotation.x = .2;
        q.pop(K.pop(t, 1.2)); old.pop(K.pop(t, 3.6));
      }
    };
  }
});
// 41. Holidays that never happened
SH({
  dur: 257 / 30, value: '99', status: 'FALSE MEMORIES', sub: 'REWRITTEN CHILDHOODS',
  caption: 'Your sister remembers holidays you never took.<br>Your mother remembers promises you broke.',
  setup(K) {
    const scene = K.indoor({ mood: 'night' }), cam = K.camera(34);
    const hero = K.person(HERO); hero.position.set(-2.4, 0, -.6); hero.rotation.y = .6; scene.add(hero);
    const f1 = photoFrame(1.35, .95, 0x2a5a6f); f1.position.set(-1.6, 1.95, -3.85); scene.add(f1);
    const f2 = photoFrame(1.35, .95, 0x6f4a2a); f2.position.set(1.6, 1.95, -3.85); scene.add(f2);
    const l1 = K.label('NEVER HAPPENED', .75, CORAL); l1.position.set(-1.6, 2.9, -3.8); scene.add(l1);
    const l2 = K.label('PROMISES BROKEN', .75, CORAL); l2.position.set(1.6, 2.9, -3.8); scene.add(l2);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [-.4, 1.9, 3], [-.2, 1.8, 2.2], [-.1, 1.8, -3.6]);
        K.idle(hero, t * .6);
        const u = K.ramp(t, 2.6, .9);
        f1.pic.material.color.setHex(u > .5 ? 0x87b8c9 : 0x2a5a6f);
        f2.pic.material.color.setHex(u > .5 ? 0xc9a987 : 0x6f4a2a);
        l1.pop(K.pop(t, 1)); l2.pop(K.pop(t, 2));
      }
    };
  }
});
// 42. They love someone who doesn't exist
SH({
  dur: 257 / 30, value: '99', status: 'WHO ARE YOU?', statusColor: CORAL, sub: 'A CREATED PERSON',
  caption: 'Everyone loves the person you\'ve created.<br>Nobody knows the real you.',
  setup(K) {
    const scene = K.indoor({ mood: 'night' }), cam = K.camera(38);
    const hero = K.person(HERO); hero.position.set(0, 0, -2); scene.add(hero);
    const arc = [-1.05, -.52, 0, .52, 1.05].map((a, i) => {
      const p = K.person({ shirt: [0xc25b4a, 0x4a6fc2, 0xd9a441, 0x7a5fb0, 0x4f9a6a][i], longHair: i % 2 === 0 });
      p.position.set(Math.sin(a) * 3.3, 0, -2 + Math.cos(a) * 3.3);
      p.rotation.y = a + PI; scene.add(p); return p;
    });
    const q = K.label('WHO ARE YOU?', 1, CORAL); q.position.set(0, 2.55, -2); scene.add(q);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 2.2, 4.4], [0, 1.9, 3], [0, 1.5, -2]);
        K.idle(hero, t * .5);
        arc.forEach((p, i) => {
          K.idle(p, t + i * .9);
          p.parts.armL.rotation.x = -2.85 + Math.sin(t * 7 + i * 1.3) * .14;
          p.parts.armR.rotation.x = -2.85 + Math.cos(t * 7 + i * 1.3) * .14;
        });
        q.pop(K.pop(t, 1.4));
      }
    };
  }
});
// 43. Merton's self-fulfilling prophecy
SH({
  dur: 258 / 30, value: '99', status: 'MERTON · 1948', sub: 'YOUR POWER, AMPLIFIED',
  caption: 'Robert Merton called it the <i>self-fulfilling prophecy</i>:<br>a false belief creates its own truth.',
  card: t => `<h4>The self-fulfilling prophecy</h4><div style="display:flex;gap:.7em;justify-content:center;align-items:center;font-size:.98em;font-weight:700">` +
    [['FALSE BELIEF', GOLD, .5], '→', ['NEW BEHAVIOUR', GOLD, 1.15], '→', ['BELIEF COMES TRUE', CORAL, 1.8]]
      .map(x => Array.isArray(x)
        ? `<div style="border:.14em solid ${x[1]};border-radius:.35em;padding:.55em .7em;opacity:${K.ramp(t, x[2], .4).toFixed(2)}">${x[0]}</div>`
        : `<div style="opacity:${K.ramp(t, .9, .3).toFixed(2)}">${x}</div>`).join('') +
    `</div><div style="font-size:.78em;opacity:.85;margin-top:.6em">Robert K. Merton — a false expectation changes behaviour, and the behaviour makes it real.</div>`,
  setup(K) {
    const scene = K.indoor({ mood: 'night' }), cam = K.camera(36);
    const tb = K.table({ w: 1.6, d: .9 }); tb.position.set(0, 0, -2.2); scene.add(tb);
    const hero = K.person(HERO); hero.position.set(-1.7, 0, -1.6); hero.rotation.y = .5; scene.add(hero);
    const lamp = K.box(.16, .3, .16, 0xf2dca0, .5, .95, -2.2, { emissive: 0xffd98a, emissiveIntensity: 1.5 }); scene.add(lamp);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [.6, 1.8, 3], [.2, 1.55, 2.2], [-.3, 1.3, -2]);
        K.idle(hero, t * .6);
        lamp.material.emissiveIntensity = 1.4 + Math.sin(t * 11) * .2;
      }
    };
  }
});
// ============ SECTION 8 · 06:20 THE MOST DANGEROUS SENTENCE (shots 44-50) ============
// 44. Taken to the government building
SH({
  dur: 257 / 30, value: '99', status: 'THE SUMMONS', sub: 'DAY 19',
  caption: 'One morning, you\'re taken<br>to a government building.',
  title: 'THE MOST DANGEROUS SENTENCE',
  setup(K) {
    const scene = K.outdoor(), cam = K.camera(38);
    scene.add(K.box(10, 5.5, 6, 0xd9d2c0, 0, 2.75, -9.2));
    for (let i = 0; i < 5; i++) scene.add(K.cyl(.28, .28, 4.6, 0xe8e2d0, -3.6 + i * 1.8, 2.3, -5.9, 8));
    scene.add(K.box(9, .3, 1.6, 0xb9ad98, 0, .15, -4.6), K.box(8, .3, .9, 0xb9ad98, 0, .45, -4.9));
    const gs = K.sign('GOVERNMENT BUILDING', 3.6, .55, { bg: '#1c1c22', color: GOLD, font: '800 30px Inter, Arial, sans-serif' });
    gs.position.set(0, 5.15, -5.85); scene.add(gs);
    scene.add(K.tree(-8.5, 2.5, 1.25, 91), K.tree(8.5, 3, 1.2, 93));
    const g1 = K.person({ shirt: 0x2c2f33, pants: 0x2c2f33 }); g1.position.set(-1.6, 0, -3.9); g1.rotation.y = PI; scene.add(g1);
    const g2 = K.person({ shirt: 0x2c2f33, pants: 0x2c2f33 }); g2.position.set(-.4, 0, -3.9); g2.rotation.y = PI; scene.add(g2);
    const hero = K.person(HERO); hero.position.set(4.5, 0, 1.5); scene.add(hero);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [3.4, 2.8, 8], [2.4, 2.2, 5.5], [.8, 1.6, -4]);
        const arrive = K.clamp(t / 6.4);
        hero.position.x = K.lerp(4.5, 2.2, K.smooth(arrive));
        hero.position.z = K.lerp(1.5, -3.6, K.smooth(arrive));
        hero.rotation.y = K.lerp(PI * .78, PI, K.smooth(arrive));
        if (t < 6.2) K.walk(hero, t * 6.2, .5); else { hero.position.y = 0; K.idle(hero, t); }
        K.idle(g1, t + 1); K.idle(g2, t + 2);
      }
    };
  }
});
// 45. The proposal
SH({
  dur: 257 / 30, value: '99', status: 'THE PROPOSAL', sub: 'A LIVE BROADCAST',
  caption: 'The officials have a proposal.<br>They want you on live television.',
  setup(K) {
    const scene = K.indoor({ mood: 'night' }), cam = K.camera(36);
    const tb = K.table({ w: 3.4, d: 1.2 }); tb.position.set(0, 0, -2.4); scene.add(tb);
    const offs = [-1.2, 0, 1.2].map((x, i) => {
      const o = K.person({ shirt: [0x33404f, 0x5a4a6f, 0x2f3a44][i], longHair: i === 1 });
      o.position.set(x, .13, -2.4); scene.add(o); K.sit(o); return o;
    });
    const hero = K.person(HERO); hero.position.set(0, 0, .3); hero.rotation.y = PI; scene.add(hero);
    const say = K.label('"A LIVE BROADCAST. TONIGHT."', .85, GOLD); say.position.set(0, 2.75, -2.3); scene.add(say);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 2.1, 4.4], [0, 1.8, 3.2], [0, 1.35, -2.2]);
        K.idle(hero, t); offs.forEach((o, i) => K.idle(o, t + i * 1.2));
        say.pop(K.pop(t, 1.6));
      }
    };
  }
});
// 46. The sentence on the teleprompter
SH({
  dur: 257 / 30, value: '99', status: 'THE SENTENCE', statusColor: CORAL, sub: 'MEMORIZE IT',
  caption: 'They want you to say:<br>"<b>There is no danger to anyone<br>in this country.</b>"',
  setup(K) {
    const scene = K.indoor({ mood: 'night' }), cam = K.camera(34);
    const po = podium(); po.position.set(0, 0, -2.6); scene.add(po);
    const hero = K.person(HERO); hero.position.set(0, 0, -3.25); hero.rotation.y = PI; scene.add(hero);
    const pol = K.person({ shirt: 0x33404f }); pol.position.set(1.9, 0, -2.2); pol.rotation.y = -PI / 2; scene.add(pol);
    const s1 = K.sign('THERE IS NO DANGER', 3.1, .55, { bg: '#1c1c22', color: CORAL, font: '800 40px Inter, Arial, sans-serif' }); s1.position.set(0, 2.95, -3.9); scene.add(s1);
    const s2 = K.sign('TO ANYONE IN THIS COUNTRY', 3.1, .55, { bg: '#1c1c22', color: CORAL, font: '800 30px Inter, Arial, sans-serif' }); s2.position.set(0, 2.35, -3.9); scene.add(s2);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [-1.4, 1.9, 2.2], [-.7, 1.75, 1.1], [0, 1.6, -3.2]);
        K.idle(hero, t); K.idle(pol, t + 1);
      }
    };
  }
});
// 47. Pressure
SH({
  dur: 257 / 30, value: '99', status: 'PRESSURE', statusColor: CORAL, sub: 'HELP MILLIONS',
  caption: '"You\'ll help millions," they insist.<br>"One sentence could change the future."',
  alert: { label: 'TONIGHT', value: 'MILLIONS WATCHING' },
  setup(K) {
    const scene = K.indoor({ mood: 'night' }), cam = K.camera(30);
    const po = podium(); po.position.set(0, 0, -2.6); scene.add(po);
    const hero = K.person(HERO); hero.position.set(0, 0, -3.25); hero.rotation.y = PI; scene.add(hero);
    const offs = [[-1.6, -1.7, PI / 2 + .2], [1.6, -1.7, -PI / 2 - .2]].map(([x, z, ry], i) => {
      const o = K.person({ shirt: [0x33404f, 0x5a4a6f][i] }); o.position.set(x, 0, z); o.rotation.y = ry; scene.add(o); return o;
    });
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 1.85, 2.6], [0, 1.7, 1.15], [0, 1.5, -3.25]);
        K.idle(hero, t);
        hero.parts.head.rotation.x = .26 * K.ramp(t, 1.4, 1);
        offs.forEach((o, i) => {
          K.idle(o, t + i);
          o.parts.armR.rotation.x = -1.25 * K.ramp(t, .8 + i * .5, .6);
        });
      }
    };
  }
});
// 48. What one sentence decides (three panels)
SH({
  dur: 257 / 30, value: '99', status: 'THE STAKES', statusColor: CORAL, sub: 'NO SMALL LIES LEFT',
  caption: 'Every lie becomes a decision:',
  card: t => `<h4>One sentence decides…</h4><div style="display:flex;gap:.8em;justify-content:center">` +
    [['WHO DESERVES<br>TO EXIST', CORAL, .5], ['WHO IS ALLOWED<br>TO REMEMBER', GOLD, 1.2], ['WHICH HISTORY<br>SURVIVES', CORAL, 1.9]]
      .map(([s, c, t0]) => `<div style="border:.14em solid ${c};border-radius:.4em;padding:.8em .7em;width:6.2em;font-weight:800;font-size:.95em;line-height:1.45;opacity:${K.ramp(t, t0, .45).toFixed(2)}">${s}</div>`).join('') + `</div>`,
  setup(K) {
    const scene = K.indoor({ mood: 'night' }), cam = K.camera(38);
    const hero = K.person(HERO); hero.position.set(0, 0, -3.4); hero.rotation.y = PI; scene.add(hero);
    const red = K.box(4.6, .12, .12, 0x662020, 0, 2.9, -3.85, { emissive: 0xff2010, emissiveIntensity: .8 }); scene.add(red);
    return { scene, camera: cam, update(t, k) { K.dolly(cam, k, [0, 1.9, 2.2], [0, 1.75, 1.6], [0, 1.55, -3.4]); K.idle(hero, t * .5); } };
  }
});
// 49. LIVE — the lens waits
SH({
  dur: 257 / 30, value: '99', status: 'LIVE · ON AIR', statusColor: CORAL, sub: 'ONE TAKE',
  caption: 'There is no harmless way<br>to control everything.',
  alert: { label: 'BROADCAST', value: 'LIVE' },
  setup(K) {
    const scene = K.indoor({ mood: 'night' }), cam = K.camera(32);
    const po = podium(); po.position.set(0, 0, -2.6); scene.add(po);
    const hero = K.person(HERO); hero.position.set(0, 0, -3.25); hero.rotation.y = PI; scene.add(hero);
    const camB = K.box(.5, .4, .75, 0x1c1e21, 1.7, 1.35, -.5); scene.add(camB);
    const lens = K.cyl(.13, .13, .3, 0x2c2f33, 1.7, 1.32, -1.02, 10); lens.rotation.x = PI / 2; scene.add(lens);
    const glass = K.cyl(.09, .09, .04, 0x88b0c8, 1.7, 1.32, -1.17, 10); glass.rotation.x = PI / 2; scene.add(glass);
    [[-.25, .35], [.25, .35], [0, -.3]].forEach(([x, z]) => { const lg = K.cyl(.035, .035, 1.5, 0x2c2f33, 1.7 + x * .9, .62, -.55 + z * .5, 6); lg.rotation.x = z > 0 ? .3 : -.35; lg.rotation.z = x * .35; scene.add(lg); });
    const tally = new T.Mesh(new T.SphereGeometry(.05, 8, 6), new T.MeshStandardMaterial({ color: 0x330000, emissive: 0xff2010, emissiveIntensity: 3 }));
    tally.position.set(1.95, 1.62, -.5); scene.add(tally);
    const live = K.label('LIVE', .9, CORAL); live.position.set(1.7, 2.35, -.6); scene.add(live);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [-2.6, 1.6, .8], [-1.5, 1.55, -.3], [1.2, 1.4, -2.6]);
        K.idle(hero, t);
        tally.material.emissiveIntensity = Math.sin(t * 8) > 0 ? 3.4 : .4;
        live.material.opacity = Math.sin(t * 8) > 0 ? 1 : .25;
      }
    };
  }
});
// 50. "I don't know how to fix everything." — the truth
SH({
  dur: 258 / 30, value: '99', status: 'TRUTHFUL', statusColor: GREEN, sub: 'NOTHING HAPPENS',
  caption: '"<b>I don\'t know how to fix everything.</b>"<br>For the first time in months — the truth.',
  setup(K) {
    const scene = K.indoor({ mood: 'night' }), cam = K.camera(32);
    const po = podium(); po.position.set(0, 0, -2.6); scene.add(po);
    const hero = K.person(HERO); hero.position.set(0, 0, -3.25); hero.rotation.y = PI; scene.add(hero);
    const offs = [[-1.8, -1.9, PI / 2 + .25], [1.8, -1.9, -PI / 2 - .25]].map(([x, z, ry], i) => {
      const o = K.person({ shirt: [0x33404f, 0x5a4a6f][i] }); o.position.set(x, 0, z); o.rotation.y = ry; scene.add(o); return o;
    });
    const tr = K.label('TRUTH', 1.3, GREEN); tr.position.set(0, 2.7, -3.1); scene.add(tr);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 1.9, 2.2], [0, 1.8, 1.4], [0, 1.5, -3.25]);
        K.idle(hero, t);
        const mo = t > 1.4 && t < 3.6 ? 1 + Math.sin(t * 16) * .7 : 1;
        hero.parts.mouth.scale.y = mo;
        tr.pop(K.pop(t, 3.8, .4));
        offs.forEach((o, i) => {
          K.idle(o, t + i);
          o.parts.armR.rotation.x = t > 4.6 ? -2.1 + Math.sin((t - 4.6) * 9) * .25 : 0;
        });
      }
    };
  }
});
// ============ SECTION 9 · 07:20 YOUR LAST LIE (shots 51-56) ============
// 51. Every lie comes back to you
SH({
  dur: 250 / 30, value: '99', status: 'REMEMBERING', sub: 'EVERY LIE, STILL THERE',
  caption: 'You remember the first lie.',
  title: 'YOUR LAST LIE',
  setup(K) {
    const scene = K.space(), cam = K.camera(36);
    scene.add(K.cyl(2.3, 2.6, .35, 0x1c2030, 0, .175, 0));
    const hero = K.person(HERO); hero.baseY = .35; hero.position.set(0, .35, 0); scene.add(hero);
    const ws = ['THE REPORT', 'THE FREE COFFEE', 'THE MAYOR'];
    const ls = ws.map((w, i) => { const l = K.label(w, .78, GOLD); scene.add(l); return l; });
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 1.9, 7.5], [0, 1.7, 5.8], [0, 1.5, 0]);
        K.idle(hero, t);
        hero.rotation.y = t * .12;
        ls.forEach((l, i) => {
          const a = t * .42 + i * 2.09;
          l.position.set(Math.sin(a) * 2.7, 1.7 + Math.sin(t * .8 + i) * .25, Math.cos(a) * 2.7);
          l.pop(K.pop(t, .9 + i * 1.05));
        });
      }
    };
  }
});
// 52. The trail of consequences
SH({
  dur: 250 / 30, value: '99', status: 'EVERY LIE STAYS', sub: 'NOTHING UNDONE',
  caption: 'The free coffee. The mayor. The bridge.<br>Every consequence is still part of the world.',
  setup(K) {
    const scene = K.space(), cam = K.camera(36);
    scene.add(K.cyl(2.3, 2.6, .35, 0x1c2030, 0, .175, 0));
    const hero = K.person(HERO); hero.baseY = .35; hero.position.set(0, .35, 0); hero.rotation.y = .4; scene.add(hero);
    const ws = ['THE FREE COFFEE', 'THE MAYOR', 'THE BRIDGE', 'CHANGED MEMORIES', 'CHANGED HISTORY'];
    const ls = ws.map((w, i) => { const l = K.label(w, .7, i > 2 ? CORAL : GOLD); scene.add(l); return l; });
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 1.8, 6.4], [0, 2.6, 8.6], [0, 1.9, 0]);
        K.idle(hero, t);
        ls.forEach((l, i) => {
          const a = PI - .9 - i * .62 + Math.sin(t * .5) * .06;
          const r = 2.5 + i * .55;
          l.position.set(Math.sin(a) * r, 1.35 + i * .5, Math.cos(a) * r);
          l.pop(K.pop(t, .8 + i * .75));
        });
      }
    };
  }
});
// 53. The feeling in your chest
SH({
  dur: 250 / 30, value: '99', status: 'THE FEELING', statusColor: GOLD, sub: 'IN YOUR CHEST',
  caption: 'And now you must decide what to do<br>with the thing that started all of this.',
  setup(K) {
    const scene = K.space(), cam = K.camera(32);
    scene.add(K.cyl(2.3, 2.6, .35, 0x1c2030, 0, .175, 0));
    const hero = K.person(HERO); hero.baseY = .35; hero.position.set(0, .35, 0); hero.rotation.y = .25; scene.add(hero);
    const glow = new T.Mesh(new T.SphereGeometry(.1, 12, 10), new T.MeshStandardMaterial({ color: 0x332200, emissive: 0xffd98a, emissiveIntensity: 3 }));
    glow.position.set(0, 1.47, .2); scene.add(glow);
    const pl = new T.PointLight(0xffd98a, 2.2, 6); pl.position.set(0, 1.47, .5); scene.add(pl);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [1.7, 1.7, 3], [1, 1.55, 2.1], [0, 1.5, 0]);
        K.idle(hero, t);
        const p = .85 + Math.sin(t * 5.5) * .22 + Math.sin(t * 13) * .06;
        glow.scale.setScalar(p);
        pl.intensity = 1.6 + Math.sin(t * 5.5) * .8;
      }
    };
  }
});
// 54. "I don't have this power."
SH({
  dur: 250 / 30, value: '100', status: 'THE LAST LIE', statusColor: CORAL, sub: 'LIE #100',
  caption: 'You look into the camera and speak<br>your final lie.<br>"<b>I don\'t have this power.</b>"',
  setup(K) {
    const scene = K.space(), cam = K.camera(30);
    scene.add(K.cyl(2.3, 2.6, .35, 0x1c2030, 0, .175, 0));
    const hero = K.person(HERO); hero.baseY = .35; hero.position.set(0, .35, 0); hero.rotation.y = .1; scene.add(hero);
    const glow = new T.Mesh(new T.SphereGeometry(.1, 12, 10), new T.MeshStandardMaterial({ color: 0x332200, emissive: 0xffd98a, emissiveIntensity: 3 }));
    glow.position.set(0, 1.47, .2); scene.add(glow);
    const pl = new T.PointLight(0xffd98a, 2.2, 6); pl.position.set(0, 1.47, .5); scene.add(pl);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [.55, 1.75, 2.2], [.18, 1.62, 1.15], [0, 1.58, 0]);
        K.idle(hero, t);
        const mo = t > 1.2 && t < 3.4 ? 1 + Math.sin(t * 15) * .75 : 1;
        hero.parts.mouth.scale.y = mo;
        const red = K.ramp(t, 1.2, .5);
        glow.material.emissive.setRGB(1, K.lerp(.85, .35, red), K.lerp(.54, .22, red));
        pl.color.setRGB(1, K.lerp(.85, .35, red), K.lerp(.54, .22, red));
        pl.intensity = 1.8 + Math.sin(t * 9) * 1.1;
      }
    };
  }
});
// 55. One second of nothing
SH({
  dur: 250 / 30, value: '100', status: 'ONE SECOND', sub: 'NOTHING HAPPENS',
  caption: 'For one second, nothing happens.',
  setup(K) {
    const scene = K.space(), cam = K.camera(34);
    scene.add(K.cyl(2.3, 2.6, .35, 0x1c2030, 0, .175, 0));
    const hero = K.person(HERO); hero.baseY = .35; hero.position.set(0, .35, 0); scene.add(hero);
    const glow = new T.Mesh(new T.SphereGeometry(.1, 12, 10), new T.MeshStandardMaterial({ color: 0x331111, emissive: 0xff6a4a, emissiveIntensity: 2.4 }));
    glow.position.set(0, 1.47, .2); scene.add(glow);
    const ring = new T.Mesh(new T.RingGeometry(.42, .5, 48), new T.MeshBasicMaterial({ color: 0xf3ead8, transparent: true, opacity: 0, side: T.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    ring.position.set(0, 1.47, .3); scene.add(ring);
    const one = K.label('1 SECOND', .85, '#f3ead8'); one.position.set(0, 2.6, 0); scene.add(one);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 1.75, 3.6], [0, 1.65, 3.1], [0, 1.5, 0]);
        const u = K.clamp((t - .3) / 1.1);
        ring.scale.setScalar(.6 + u * 3.2);
        ring.material.opacity = Math.max(0, Math.sin(u * PI)) * .8;
        glow.scale.setScalar(Math.max(.001, 1 - u * .25));
        one.pop(K.pop(t, .35, .3));
      }
    };
  }
});
// 56. The power is gone
SH({
  dur: 250 / 30, value: '100', status: 'POWERLESS', statusColor: CORAL, sub: 'GONE',
  caption: 'The feeling disappears. The words stop glowing.<br>Your power is gone.',
  setup(K) {
    const scene = K.space(), cam = K.camera(34);
    scene.add(K.cyl(2.3, 2.6, .35, 0x1c2030, 0, .175, 0));
    const hero = K.person(HERO); hero.baseY = .35; hero.position.set(0, .35, 0); scene.add(hero);
    const glow = new T.Mesh(new T.SphereGeometry(.1, 12, 10), new T.MeshStandardMaterial({ color: 0x331111, emissive: 0xff6a4a, emissiveIntensity: 2.4 }));
    glow.position.set(0, 1.47, .2); scene.add(glow);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [.9, 1.7, 3.2], [.4, 1.6, 4.6], [0, 1.45, 0]);
        const die = K.smooth((t - .8) / 2.6);
        glow.scale.setScalar(Math.max(.001, (1 - die) * (0.9 + Math.sin(t * 7) * .15)));
        glow.material.emissiveIntensity = Math.max(.02, 2.4 * (1 - die));
        const drop = K.ramp(t, 1.2, 2);
        hero.parts.armL.rotation.x = -.55 * (1 - drop); hero.parts.armR.rotation.x = -.55 * (1 - drop);
        K.idle(hero, t * .6);
      }
    };
  }
});
// ============ SECTION 10 · 08:10 THE WORLD THAT NEVER EXISTED (shots 57-60) ============
// 57. An ordinary morning — everyone keeps to their lane
SH({
  dur: 262 / 30, value: '100', status: '8:17 AM', sub: 'NEW MORNING',
  caption: 'The next morning, everything<br>looks ordinary.',
  title: 'THE WORLD THAT NEVER EXISTED',
  setup(K) {
    const scene = K.outdoor(), cam = K.camera(40);
    scene.add(K.road({ along: 'x', z: 0 }));
    scene.add(K.house(-5, -8.5, { wall: 0xdccbb0, roof: 0x8a4b3c }), K.house(0, -9), K.house(5.5, -8.2), K.house(11, -8.6, { wall: 0xcfd6d2, roof: 0x4f5d53 }));
    scene.add(K.tree(-9.5, 6.6, 1.1, 101), K.tree(-2.5, 5.4, 1.05, 103), K.tree(8.5, 3.4, 1.25, 105), K.tree(12, 2.6, 1.15, 107));
    const row = marchRow(5, { z: 4.6, dir: 1, speed: 1.2, seed: 5, x: -5, lead: 0 }); scene.add(row);
    const carA = K.car(0x2f6fb8); carA.rotation.y = PI / 2; scene.add(carA);
    const carB = K.car(0xb8563a); carB.rotation.y = -PI / 2; scene.add(carB);
    const hero = K.person(HERO); hero.baseY = .12; hero.position.set(5.3, .12, -4.6); scene.add(hero);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 2.5, 10.5], [0, 2.1, 8.6], [0, 1.2, -2]);
        row.update(t);
        carA.position.set(-13 + t * 1.15, 0, 1.7);
        carB.position.set(9 - t * 1.15, 0, -1.7);
        K.idle(hero, t);
      }
    };
  }
});
// 58. No witnesses left
SH({
  dur: 263 / 30, value: '100', status: 'NO WITNESSES', statusColor: CORAL, sub: 'ALL REWRITTEN',
  caption: 'The mayor doesn\'t remember. The officials don\'t remember.<br>Your friends remember a life that never happened.',
  setup(K) {
    const scene = K.outdoor(), cam = K.camera(38);
    scene.add(K.road({ along: 'x', z: 0 }));
    scene.add(K.house(-7, -8.5), K.house(7, -8.8, { wall: 0xdccbb0, roof: 0x8a4b3c }));
    scene.add(K.tree(-10, 3, 1.2, 111), K.tree(10, 3.2, 1.2, 113));
    const hero = K.person(HERO); hero.baseY = .12; hero.position.set(0, .12, -4.6); scene.add(hero);
    const who = [[-2.2, 0x33404f, 'THE MAYOR'], [0, 0x5a4a6f, 'THE OFFICIALS'], [2.2, 0xc25b4a, 'YOUR FRIENDS']].map(([x, shirt, w]) => {
      const p = K.person({ shirt, hair: x ? 0x4a3324 : 0x8a8f96 });
      p.baseY = .12; p.position.set(x, .12, 4.6); p.rotation.y = PI; scene.add(p);
      const q = K.label('?', 1.25, CORAL); q.position.set(x, 2.55, 4.6); scene.add(q);
      const l = K.label(w, .68, '#f3ead8'); l.position.set(x, 1.45, 4.6); scene.add(l);
      return { p, q, l, i: x };
    });
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [-2.6, 2.35, 11], [2.6, 2.35, 11], [0, 1.4, .4]);
        K.idle(hero, t);
        who.forEach(({ p, q, l, i }, j) => {
          K.idle(p, t + j * 1.4);
          q.material.opacity = .3 + .7 * Math.max(0, Math.sin(t * 1.7 + j * 1.15));
          l.material.opacity = .85;
        });
      }
    };
  }
});
// 59. The camera pulls away
SH({
  dur: 262 / 30, value: '100', status: 'ALONE', statusColor: CORAL, sub: 'THE ONLY MEMORY',
  caption: 'You didn\'t create a perfect world.<br>You created one that can\'t remember its imperfections.',
  setup(K) {
    const scene = K.outdoor(), cam = K.camera(42);
    scene.add(K.road({ along: 'x', z: 0 }));
    scene.add(K.house(-6, -8.6, { wall: 0xdccbb0, roof: 0x8a4b3c }), K.house(1, -9), K.house(8.5, -8.4));
    scene.add(K.tree(-9.5, 3.1, 1.2, 121), K.tree(9.5, 3, 1.2, 123), K.tree(-3, 3.3, 1.1, 125));
    const row = marchRow(5, { z: 4.6, dir: -1, speed: 1.2, seed: 8, lead: 7 }); scene.add(row);
    const near = [K.person(HERO), K.person({ shirt: 0x4a6fc2 }), K.person({ shirt: 0xd9a441, longHair: true })];
    near.forEach((p, i) => { p.baseY = .12; p.rotation.y = -PI / 2; scene.add(p); });
    const carA = K.car(0x4a6fc2); carA.rotation.y = -PI / 2; scene.add(carA);
    const carB = K.car(0x3a7a4a); carB.rotation.y = PI / 2; scene.add(carB);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 1.9, 7], [1.2, 4.6, 15.5], [-2, 1.1, 0]);
        row.update(t);
        near.forEach((p, i) => { p.position.set(2 - t * 1.2 + i * 1.35, .12 + Math.abs(Math.cos(t * 5.8 + i * 1.7)) * .035, -4.6); K.walk(p, t * 5.8 + i * 1.7); });
        carA.position.set(14 - t * 1.3, 0, -1.7);
        carB.position.set(-14 + t * 1.3, 0, 1.7);
      }
    };
  }
});
// 60. Your move
SH({
  dur: 263 / 30, value: '100', status: 'YOUR MOVE', statusColor: GOLD, sub: 'COMMENT BELOW',
  caption: 'So — would your first lie make you rich,<br>save the world,<br>or destroy it?',
  setup(K) {
    const scene = K.space(), cam = K.camera(34);
    scene.add(K.cyl(2.3, 2.6, .35, 0x1c2030, 0, .175, 0));
    const hero = K.person(HERO); hero.baseY = .35; hero.position.set(0, .35, -1.2); scene.add(hero);
    const big = K.label('WHAT WOULD YOUR FIRST LIE BE?', 1.45, GOLD); big.position.set(0, 3.05, 0); scene.add(big);
    const cm = K.label('COMMENT BELOW', .8, '#f3ead8'); cm.position.set(0, 2.25, 0); scene.add(cm);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [0, 1.9, 7.6], [0, 2, 5.9], [0, 2.2, 0]);
        K.idle(hero, t);
        hero.rotation.y = t * .1;
        big.pop(K.pop(t, .9, .5));
        cm.pop(K.pop(t, 2.2));
      }
    };
  }
});

// ---------- guard ----------
if (n !== 60) throw new Error('shot count ' + n + ' != 60');
const TT = F.reduce((a, b) => a + b, 0);
if (TT !== 15750) throw new Error('frame total ' + TT + ' != 15750');
