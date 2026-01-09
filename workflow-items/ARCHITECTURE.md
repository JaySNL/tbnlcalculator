# TBNL Battery Calculator Architecture

**Last Updated**: 2026-01-08
**Status**: 🚀 Active Development

---

## 🏗️ System Overview
A "Goldilocks" battery capacity calculator designed to be embedded into the `thuisbatterijnederland.nl` WordPress site. It balances user-friendly presets with advanced customizability, wrapped in a premium "SaaS-like" aesthetic.

### Core Philosophy
- **Conversational UX**: Transforming the form into a "Journey" (Steps 1-4).
- **Hybrid Visuals**: Light-mode inputs (max readability) combined with Dark-mode results (premium impact).
- **Zero-Conflict Integration**: Using Iframes to ensure perfect style encapsulation in WordPress.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: **Vite + React 18**.
- **UI library**: **HeroUI (formerly NextUI)**.
- **Styling**: **Tailwind CSS v4** + Custom Glassmorphism.
- **Icons**: **Lucide React** + Emojis for "Journey" feel.
- **Animations**: **Framer Motion** (via HeroUI) for smooth step transitions.

### Integration (WordPress)
- **Method**: **Iframe Embedding**.
- **Reasoning**: Abandoned Shadow DOM due to HeroUI/Tailwind v4 styling conflicts. Iframe provides a stable, isolated environment for complex Tailwind styles.
- **Entry Point**: `index.html` (built from `calculator.html`).

---

## 🎨 Design System

### Hybrid Theme
- **Inputs Section**: **Light Theme**. 
  - White background (`bg-white`).
  - High contrast text (`text-slate-900`/`text-slate-700`).
  - Card borders: `border-2 border-slate-200`.
  - Border Radius: Unified `rounded-3xl` for all interactive elements.
- **Results Section**: **Dark Theme / Glassmorphism**.
  - Deep slate background (`bg-slate-950`).
  - Frosted glass cards (`backdrop-blur-xl bg-white/5`).
  - Gradient accents (Orange/Blue/Purple).

---

## 📂 Project Structure

```
tbnlcalculator/
├── website/             # Main React Application
│   ├── src/
│   │   ├── components/  # Calculator, InputSection, ResultsSection
│   │   ├── utils/       # Calculation Logic (calculate.js)
│   │   └── main.jsx     # Entry point (Standard React mount)
│   ├── public/          # Static assets
│   ├── calculator.html  # Standalone template for iframe
│   └── vite.config.js   # Build config (Relative paths enabled)
├── dist/                # Production build artifacts (Ready for WP)
└── workflow-items/      # Project management & documentation
```

---

## 🔐 Critical Requirements
1. **Relative Paths**: Vite must use `base: './'` so assets load correctly in WordPress folders.
2. **Standard Mount**: Mount to `#root` inside the iframe.
3. **Responsive**: Layout must work within WordPress content column widths.

---

## 🔄 Data Flow
1. **User Input** (Journey Steps 1-4) -> **Local State** (`formData`).
2. **Calculation Engine** (`calculateBatteryConfig`) -> Reactive updates to **Results**.
3. **CTA** -> Redirects parent window to contact page with URL parameters.
