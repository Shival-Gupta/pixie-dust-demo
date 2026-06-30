# Pixie Dust Background Demo

A recreation of the beautiful planet/pixie dust background effect from [p5aholic.me](https://p5aholic.me/), built with **React + Three.js + custom GLSL shaders**.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r184-000?logo=three.js)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)

## How It Works

The "planet" is actually a **flat plane** with a custom fragment shader — no 3D sphere involved. The illusion comes from:

1. **Simplex noise** (Ashima Arts) — organic 2D noise function
2. **Fractal Brownian Motion (FBM)** with **domain warping** — creates swirling cloud-like structures
3. **Procedural grain texture** — adds subtle distortion and texture variation
4. **Radial gradient blur texture** — creates the spherical falloff that reads as a "planet"
5. **Time-based animation** — the noise field slowly drifts, giving the floating/rotating feel

Mix between a dark `backColor` and bright `frontColor` based on the noise pattern.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── PixieDustBackground.jsx   # Three.js scene + shader component
├── App.jsx                    # Main app with theme toggle
├── App.css                    # Styles
└── index.css                  # Reset
```

## Shader Parameters

Tweak these in `PixieDustBackground.jsx`:

| Uniform  | Default | Effect |
|----------|---------|--------|
| `param1` | 1.0     | Grain texture scale |
| `param2` | 0.05    | Distortion amount |
| `param3` | 0.2     | Noise frequency |

## Credits

Inspired by [Keita Yamada](https://p5aholic.me/) (p5aholic). Simplex noise by [Ashima Arts](https://github.com/ashima/webgl-noise).

## License

MIT
