# Parallax Storytelling Engine
**Remotion + React Three Fiber** — Cinematic parallax video renderer

---

## Cài đặt

```bash
npx create-video@latest my-parallax --template three
cd my-parallax

# Xóa code mẫu của Remotion, copy toàn bộ src/ từ project này vào

npm install @react-three/postprocessing postprocessing @react-three/drei maath
npm install
npm start   # mở Remotion Studio
```

---

## Cấu trúc Project

```
src/
├── types/index.ts              ← Toàn bộ TypeScript types
├── utils/
│   ├── easing.ts               ← 12 easing functions + speed ramp
│   ├── noise.ts                ← Multi-octave noise + 16 shake presets
│   └── depthFade.ts            ← Depth fade + auto-focus calculator
├── components/
│   ├── CameraController.tsx    ← Camera movement, shake, look-at
│   ├── ParallaxLayer.tsx       ← Single layer với depth fade
│   ├── ParallaxScene.tsx       ← Main scene orchestrator + post-processing
│   └── SceneManager.tsx        ← Multi-scene với cross-dissolve transitions
├── config/scenes/
│   └── defaultScene.json       ← JSON-driven scene config
└── Root.tsx                    ← Remotion compositions
```

---

## JSON Scene Config — Giải thích đầy đủ

```json
{
  "camera": {
    "startX": -12,    // Camera bắt đầu ở X=-12
    "endX": 12,       // Camera kết thúc ở X=12 (tạo pan)
    "z": 8,           // Khoảng cách camera đến scene
    "fov": 50         // Field of view (degrees). Nhỏ hơn = telephoto
  },

  "shake": {
    "preset": "handheld",  // Xem danh sách 16 presets bên dưới
    "amplitude": 0,        // 0 = dùng default của preset. >0 = override (0–100)
    "frequency": 0,        // 0 = dùng default. >0 = override Hz (0–100)
    "seed": 42,            // Seed để reproducible (thay đổi = shake pattern khác)
    "axes": { "x": true, "y": true, "z": true }  // z = roll
  },

  "dof": {
    "enabled": true,
    "focusDistance": 0.025,   // 0–1, nhỏ = gần camera
    "focalLength": 0.12,      // Focal length normalized
    "bokehScale": 5,          // Kích thước bokeh ball (1–10)
    "autoFocus": {
      "enabled": false,       // true = camera luôn focus vào layerId
      "layerId": "mid"        // ID của layer cần auto-focus
    }
  },

  "speedRamp": {
    "enabled": false,
    "minSpeed": 0.4,          // Tốc độ tối thiểu (0.1 = 10% speed)
    "easeIn": true,           // Bắt đầu chậm
    "easeOut": true,          // Kết thúc chậm
    "easeType": "easeInOutCubic"
  },

  "depthFade": {
    "enabled": true,
    "nearZ": -5,              // Layer gần hơn Z=-5 = full opacity
    "farZ": -30,              // Layer xa hơn Z=-30 = minOpacity
    "minOpacity": 0.3         // Opacity tối thiểu của layer xa nhất
  },

  "layers": [
    {
      "id": "bg",
      "url": "/assets/bg.png",    // PNG với transparent background
      "z": -28,                   // Âm càng nhiều = càng xa
      "scale": 32,                // Kích thước trong world space
      "parallaxFactor": 0.15,     // 0=static, 1=camera-speed, >1=over-travel
      "xOffset": 0,               // Điều chỉnh vị trí ban đầu
      "yOffset": 0,
      "opacity": 1,               // Base opacity (depthFade sẽ modulate)
      "depthFade": true           // Có apply depth fade không
    }
  ]
}
```

---

## 16 Shake Presets — Chi tiết kỹ thuật

| Preset | Freq | Amp | Đặc điểm kỹ thuật |
|--------|------|-----|-------------------|
| `sinusoidal` | 4Hz | 0.04 | 1 octave sine thuần, đều đặn |
| `earthquake` | 18Hz | 0.35 | 5 octaves, amplitude cao, multi-axis |
| `handheld` | 7Hz | 0.06 | 3 octaves, Y-dominant (thở/nhịp tay) |
| `wind` | 2.5Hz | 0.05 | 4 octaves sine, X-dominant, chậm |
| `vehicle` | 22Hz | 0.08 | 2 octaves, Y-dominant, engine rhythm |
| `explosion` | 30Hz | 0.60 | 6 octaves + burst spikes, toàn trục |
| `circular` | 5Hz | 0.08 | X/Y 90° phase offset = orbit tròn |
| `random` | 12Hz | 0.10 | 4 octaves + 50% burst chance |
| `oldFilm` | 24Hz | 0.12 | Stepped noise (frame-rate jitter), X+roll |
| `precise` | 3Hz | 0.01 | 2 octaves, rất nhỏ, Y-dominant |
| `drone` | 1.8Hz | 0.035 | 3 octaves sine, drift chậm |
| `motorcycle` | 28Hz | 0.09 | 2 octaves, Y-dominant, engine vibes |
| `helicopter` | 14Hz | 0.07 | 2 octaves, roll-dominant (rotor blade) |
| `subway` | 16Hz | 0.14 | 3 octaves, X-dominant (lateral sway) |
| `heartbeat` | 1.3Hz | 0.09 | Custom waveform: lub-dub pulse |
| `glitch` | 24Hz | 0.22 | Stepped + 85% burst chance, roll mạnh |

---

## Easing Functions

```
linear, easeIn, easeOut, easeInOut, easeInOutCubic,
easeOutExpo, easeInExpo, easeOutBounce,
easeInBack, easeOutBack, easeInOutBack, spring
```

---

## Render Commands

```bash
# Preview trong browser
npm start

# Render MP4 (H.264)
npx remotion render ParallaxStory out/video.mp4

# Render ProRes (chất lượng cao nhất, dùng trong FCP/Premiere)
npx remotion render ParallaxStory out/video.mov --codec=prores

# Render 4K (scale=2 → 2x resolution)
npx remotion render ParallaxStory out/video_4k.mp4 --scale=2

# Render một frame cụ thể để test
npx remotion still ParallaxStory out/frame.png --frame=150
```

---

## Chuẩn bị Assets

- Sử dụng PNG với **transparent background** (alpha channel)
- Đặt trong `public/assets/`
- Recommended sizes:
  - Background (z=-28): 4096×2304px (cho phép pan mà không thấy edge)
  - Midground (z=-14): 2400×1350px
  - Foreground (z=-4): 1920×1080px minimum
- Export từ Photoshop: PNG-24 với transparency

---

## Multi-Scene với Transitions

```tsx
// src/Root.tsx
import { SceneManager } from './components/SceneManager';
import scene1 from './config/scenes/scene1.json';
import scene2 from './config/scenes/scene2.json';

const scenes = [
  { config: scene1, startFrame: 0, transitionOut: 30 },
  { config: scene2, startFrame: 420, transitionIn: 30 },
];

// Trong composition:
<SceneManager scenes={scenes} />
```

---

## Roadmap

- [x] JSON-driven scene config
- [x] 16 camera shake presets với full math
- [x] Multi-octave noise (fBm)
- [x] Depth fade (opacity by Z-depth)
- [x] Auto-focus (DOF tracks target layer)
- [x] Speed ramp với easing
- [x] Cross-dissolve scene transitions
- [ ] Rack focus (Focus A → B animated transition)
- [ ] On-screen control handles trong Remotion Studio
- [ ] 3D Trace (camera follows motion path of layer)
- [ ] Motion blur integration
- [ ] Export keyframe data as JSON (cho FCP/Premiere import)
