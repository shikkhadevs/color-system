# Shikkha Color System

A professional, high-performance UI design system and color palette management tool. Shikkha Color System provides a curated set of harmonious color scales designed for modern web applications.

## 🚀 Features

- **Static Performance**: Entire palette is rendered statically to eliminate layout shifts (CLS).
- **Modern Tech Stack**: Built with Tailwind CSS v4 and Vite for lightning-fast development and optimized production builds.
- **Single-Click Copy**: Click any swatch to instantly copy its color value to clipboard.
- **Format Toggle**: Switch between **HEX**, **RGB**, **HSL**, and **Tailwind** class formats with one click.
- **Copy All**: Export an entire palette row (e.g., all Brand Blue shades) at once.
- **Keyboard Navigation**: Use arrow keys to navigate swatches, Enter/Space to copy, Escape to blur.
- **Scroll Spy Navigation**: Active section highlighting in the nav bar as you scroll.
- **Scroll Animations**: Smooth fade-in reveals with staggered children for a premium feel.
- **Back-to-Top**: Floating button that appears after scrolling past the first section.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewports.
- **Accessibility**: Reduced-motion support and ARIA labels for assistive tech.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- Yarn or NPM

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:shikkhadevs/color-system.git
   cd color-system
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start development server:
   ```bash
   yarn dev
   ```

4. Build for production:
   ```bash
   yarn build
   ```

## 📂 Project Structure

- `index.html`: Main entry point with static palette implementation.
- `src/main.js`: All interactivity — copy, format toggle, scroll spy, keyboard nav, back-to-top.
- `src/style.css`: Tailwind configuration, custom theme, animations, and micro-interactions.
- `public/`: Static assets (favicon, OG image).

## 📝 License

© 2026 [Shikkha.dev](https://shikkha.dev). All rights reserved.
