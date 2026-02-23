# Lumberjack Playable Ad Prototype

A 3D playable ad prototype built with `Three.js + Tween.js + TypeScript`.

The player chops trees with a rotating axe, collects wood, brings it to a drop-off zone, and converts it into money. The prototype includes a timer, money goal, HUD, and `win/lose` overlays.

## Features Implemented

- 3D scene (`Three.js`)
- GLTF models: character, tree, axe
- Virtual joystick
- Rotating axe using `tween.js`
- Forest generation (random placement + minimum distance between trees)
- Tree chopping (axe radius hit test)
- Chop feedback FX: fall + shrink via `tween.js`
- Wood inventory (`wood`)
- Drop-off/base zone
- Wood-to-money conversion over time
- HUD (time / goal / wood / money) with pop animations
- `Win / Lose` overlay + CTA buttons
- Theme music + SFX

## Tech Stack

- `three`
- `@tweenjs/tween.js`
- `typescript`
- `vite`

## Local Development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Controls

- Virtual joystick at the bottom center of the screen
- Timer starts on the first joystick interaction
- Move near a tree to chop it with the rotating axe
- Move into the base circle to convert wood into money

## Notes

- iPhone / Safari may block autoplay audio. Theme/SFX should be started after the first user interaction.

## Next Improvements (TODO)

- Add onboarding / first-time hint
- Improve drop-off feedback (flying log/coin into base)
- Balance economy and timer
- Improve iOS/WebView audio reliability

## Project Goal

This is a production-like learning prototype for practicing `Three.js`, `Tween.js`, and core-loop design for playable ads.

