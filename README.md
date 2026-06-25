# Timber-Man

Game menebang pohon berbasis HTML5 Canvas — terinspirasi dari game klasik *Timber*.

## Cara Main

Pemain berdiri di sisi kiri atau kanan batang pohon dan menebang potongan kayu (log) dari bawah ke atas. Setiap log bisa memiliki ranting di sisi kiri, kanan, atau tidak sama sekali.

- **Tekan sisi yang tidak ada ranting** → log berhasil dipotong, skor bertambah.
- **Tekan sisi yang ada ranting** → permainan selesai.

Pemain harus berganti-ganti sisi menebang mengikuti posisi ranting. Makin tinggi skor, makin cepat tekanan waktunya.

## Mode Game

Pilih mode dari layar awal:

| Mode | Timer | Kesulitan | Cocok untuk |
|------|-------|-----------|-------------|
| **Classic** ⏱️ | 10 detik, +time per tebasan | Progresif (standar) — stun kena ranting | Main utama |
| **Endless** ♾️ | Tanpa waktu | Progresif (lebih cepat) | Tantangan tanpa batas |
| **Zen** 🧘 | Tanpa waktu | Tetap, ranting jarang | Santai / latihan |

Skor tertinggi disimpan terpisah per mode.

## Fitur

### Popup Point 🎯
Setiap tebasan muncul angka floating **"+1"** (biasa), **"+2"** (burung), atau **"+3"** (log emas) yang melayang naik dan memudar. Combo bonus tampil sebagai **"COMBO +0.8s"** warna kuning. Shield & slow-mo muncul sebagai ikon.

### Burung 🐦
Burung kadang hinggap di ranting pohon. Tebang log yang ada burungnya untuk dapat **skor double (+2)**. Burung akan terbang setelah beberapa saat — kejar sebelum pergi!

### Combo 🔥
Tebasan beruntun tanpa kena ranting membangun **combo**. Setiap kelipatan **5 combo**, kamu dapat **bonus waktu +0,8 detik** (Classic) atau tetap ditampilkan sebagai pencapaian (Endless/Zen).

### Kesulitan Progresif ⬆️
Makin tinggi skor, makin jarang log tanpa ranting, makin kecil bonus waktu per tebasan, dan makin cepat log jatuh. Permainan makin menantang!

### Log Jatuh 🪵
Setiap tebasan, potongan kayu jatuh ke samping disertai efek rotasi dan gravitasi. Kecepatan jatuh meningkat seiring skor.

### Shield 🛡️
Peluang 6% per tebasan untuk mendapat **shield**. Shield menahan 1 kena ranting lalu hilang. Indikator shield muncul di samping pemain.

### Slow Motion 🐌
Peluang 8% per tebasan untuk mengaktifkan **slow-mo** selama 3 detik. Waktu berjalan setengah kecepatan, memudahkan reaksi.

### Log Emas 🌟
Peluang 10% pada log tanpa ranting. Log emas bernilai **+3 poin**, tanpa power-up.

### Daun Jatuh 🍃
Saat kena ranting, dedaunan hijau beterbangan ke samping.

### Confetti 🎊
Saat mencetak **skor terbaik baru**, konfeti warna-warni turun di layar.

### Siklus Siang-Malam 🌤️🌙
Suasana berubah gradual dari **pagi** (skor 0, hangat), **siang** (skor 20, cerah), **sore** (skor 50, jingga), hingga **malam** (skor 100, gelap berbintang). Semua warna langit, tanah, dan awan berubah mulus.

### Efek Suara 🔊
- Tebasan berhasil → *chop* pendek
- Kena ranting → *thud* berat
- Burung kena tebang → *chirp* nyaring
- Combo bonus → nada naik
- Shield block → *ding* tinggi
- Log emas → *ting* ceria
- Slow-mo → dengung rendah
- Game over → melodi turun
- **Background music** → melodi procedural 8 nada berulang

### Kontrol Gesture 👆
Di perangkat sentuh, **geser kiri/kanan** pada layar untuk menebang.

### Getaran 📳
Di perangkat yang mendukung, getaran halus terasa tiap tebasan (getaran lebih kuat saat kena ranting).

### Mute 🔇
Tombol **🔊/🔇** di HUD untuk mematikan/menghidupkan semua suara termasuk BGM.

### Pause & Menu ⏸️
Tekan **P**, **Escape**, atau tombol **❚❚** di HUD untuk menjeda. Dari layar jeda atau game over, tekan tombol **Menu** atau **M** untuk kembali ke pemilihan mode.

### Papan Skor 🏆
5 skor teratas disimpan di `localStorage` dan ditampilkan saat game over. Konfeti jika skor terbaru menjadi nomor satu!

## Kontrol

| Aksi | Input |
|------|-------|
| Tebang kiri | Tap kiri layar / `←` / `A` |
| Tebang kanan | Tap kanan layar / `→` / `D` |
| Pause / Lanjut | `P` / `Escape` / tombol ❚❚ |
| Menu (dari pause / game over) | Tombol "Menu" atau `M` |

## Aturan

- Log pertama dan kedua tidak pernah bercabang (aman).
- Log berikutnya memiliki ranting secara acak, tidak pernah dua ranting berturut-turut di sisi yang sama.
- Posisi ranting di setiap log agak ke atas (20% dari atas log) agar tidak terlalu tengah.
- **Classic:** Waktu awal 10 detik, +0,55 detik per tebasan (berkurang seiring skor naik, min +0,35). Kena ranting = stun 0,67 detik + kehilangan 1,5 detik waktu (bukan game over langsung).
- **Endless:** Tanpa waktu, ranting makin sering seiring skor naik.
- **Zen:** Tanpa waktu, ranting jarang (probabilitas tetap 0.65).
- Setiap 5 combo: bonus waktu +0,8 detik (Classic) / tetap ditampilkan (Endless/Zen).
- Skor tertinggi (5 besar) disimpan per mode di `localStorage`.

## Struktur Proyek

```
Timber/
  index.html         — markup utama (hanya HTML)
  README.md          — dokumentasi
  css/
    style.css        — semua styling
  js/
    main.js          — entry point: event, game loop, init
    core/            — state & logika game
      constants.js   — semua konstanta game
      state.js       — state, DOM refs, UI update
      logic.js       — inti game (chop, combo, mode, power-up)
      game.js        — reset & tick (game loop logika)
      tree.js        — generate pohon, cabang, kesulitan
      particles.js   — chip, fallenLog, popup, leaf, confetti
    data/
      highscores.js  — skor tertinggi (localStorage), endGame
    audio/
      audio.js       — suara (Web Audio API), BGM, mute
    render/          — semua rendering Canvas 2D
      renderer.js    — hub orchestrator draw()
      background.js  — langit, awan, matahari, bulan, bintang, lumberjack
      treeRender.js  — pohon, cabang, burung, log
      player.js      — player, shield, slow-mo indicator
      effects.js     — gambar partikel (leaf, confetti, chips, popups, fallenLog)
      palette.js     — sistem palet warna dinamis
```

## Teknis

- **Rendering:** Canvas 2D, di-scale dengan `devicePixelRatio` untuk layar Retina.
- **Loop:** `requestAnimationFrame` dengan delta-time, kapasitor 50 ms.
- **Suara:** Web Audio API — oscillator murni, tanpa file audio eksternal.
- **Fisika:** Partikel serpihan kayu & log jatuh dengan gravitasi sederhana.
- **Pohon anchor:** Log[0] selalu di level tanah (`groundY`), tidak ada akumulasi offset.
- **Penyimpanan:** `localStorage` untuk skor tertinggi (top 5).
- **Modular:** ES modules — setiap file ≤300 baris.
- **Tidak ada dependensi eksternal.** Vanilla JavaScript murni.

## Pengembangan

Arsitektur modular dengan ES modules (`type="module"`), dikelompokkan per folder:

### `/js/core/` — State & Logika Game

| File | Baris | Isi |
|------|-------|-----|
| `constants.js` | 30 | Semua konstanta game |
| `state.js` | 113 | State, DOM refs, updateUI |
| `logic.js` | 108 | Inti game: chop, combo, mode, power-up |
| `game.js` | 83 | reset & tick (game loop logika) |
| `tree.js` | 68 | Generate pohon, cabang, burung, kesulitan |
| `particles.js` | 135 | Spawn/update chip, fallenLog, popup, leaf, confetti |

### `/js/data/`

| File | Baris | Isi |
|------|-------|-----|
| `highscores.js` | 74 | Skor tertinggi (localStorage), endGame, submit nama |

### `/js/audio/`

| File | Baris | Isi |
|------|-------|-----|
| `audio.js` | 87 | Suara (Web Audio API), BGM, mute, vibrate |

### `/js/render/` — Semua Rendering Canvas 2D

| File | Baris | Isi |
|------|-------|-----|
| `renderer.js` | 31 | Hub orchestrator draw() |
| `background.js` | 175 | Langit, awan, matahari, bulan, bintang, lumberjack |
| `treeRender.js` | 132 | Pohon, cabang, burung, log |
| `player.js` | 123 | Player, shield, slow-mo indicator |
| `effects.js` | 75 | Gambar partikel (leaf, confetti, chips, popups, fallenLog) |
| `palette.js` | 35 | Sistem palet warna dinamis |

### Root

| File | Baris | Isi |
|------|-------|-----|
| `index.html` | 139 | Struktur HTML + legend modal |
| `css/style.css` | 511 | CSS & variabel warna, mode buttons, overlay, legend |
| `js/main.js` | 131 | Entry point: event handler, game loop, init, menu, mute, legend |

**Aturan:** setiap file JS maksimal 180 baris. Jika melebihi, harus dipecah. Impor cukup lihat path folder untuk tahu kategori file.

Jalankan `index.html` via local server (Live Server, `python -m http.server`).

## Kustomisasi Warna

Semua warna didefinisikan sebagai CSS custom properties di `:root` dalam `css/style.css`:

| Variabel | Default | Kegunaan |
|----------|---------|----------|
| `--sky-top` | `#7EC8E3` | Langit atas |
| `--sky-bottom` | `#E8F4F8` | Langit bawah |
| `--wood-light` | `#A9713F` | Kayu terang |
| `--wood-dark` | `#6F4518` | Kayu gelap |
| `--leaf` | `#4A7C2A` | Daun |
| `--ground` | `#3D5C2F` | Tanah |
| `--player-shirt` | `#D64545` | Baju pemain |
| `--danger` | `#C0392B` | Timer bahaya |
| `--gold` | `#E6B800` | Combo / bonus |

## Lisensi

MIT
