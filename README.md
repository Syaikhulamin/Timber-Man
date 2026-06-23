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
    constants.js     — konstanta game
    audio.js         — suara (Web Audio API)
    state.js         — state, DOM refs, UI update, fisika
    logic.js         — inti game (chop, timer, pohon, burung, combo)
    renderer.js      — semua fungsi gambar (Canvas 2D)
    main.js          — entry point: event, game loop, init
```

Setiap file JS ≤300 baris agar mudah dikembangkan dan di-debug.

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

Arsitektur modular dengan ES modules (`type="module"`):

| File | Baris | Isi |
|------|-------|-----|
| `index.html` | 139 | Hanya struktur HTML + legend modal |
| `css/style.css` | 511 | CSS & variabel warna, mode buttons, mute, overlay transisi, legend |
| `js/constants.js` | 25 | Semua konstanta game (termasuk power-up & mode) |
| `js/audio.js` | 87 | Suara (Web Audio API), BGM, mute, vibrate |
| `js/state.js` | 241 | State, DOM refs, UI update, partikel (chip, leaf, confetti, popup, fallenLog) |
| `js/logic.js` | 284 | Inti game: chop, timer, pohon, burung, combo, mode, power-up |
| `js/renderer.js` | 282 | Fungsi gambar Canvas 2D (background dinamis, tree, player, shield, slow-mo, stars) |
| `js/effects.js` | 74 | Efek partikel (leaf, confetti, chips, popups, fallen logs) |
| `js/palette.js` | 35 | Sistem palet warna dinamis (pagi/siang/sore/malam) |
| `js/main.js` | 116 | Entry point: event handler, game loop, init, menu, gesture, mute, legend |

**Aturan:** setiap file JS maksimal 300 baris. Jika melebihi, harus dipecah.

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
