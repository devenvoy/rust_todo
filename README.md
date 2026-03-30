
```

## How to Run This Project

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [Rust](https://www.rust-lang.org/tools/install) (Latest stable version)

### Setup & Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Application (Development Mode)**:
   This will start both the frontend (Vite) and the backend (Tauri) together.
   ```bash
   npm run tauri dev
   ```

3. **Run Frontend Only**:
   If you only want to work on the UI without the Rust backend functionalities:
   ```bash
   npm run dev
   ```

### Production Build

To build the project for production:
```bash
npm run build
npm run tauri build
```
rust_todo
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  └─ vite.svg
├─ src
│  ├─ App.tsx
│  ├─ components
│  │  └─ theme_icon.tsx
│  ├─ main.tsx
│  ├─ style.css
│  ├─ typescript.svg
│  └─ vite-env.d.ts
├─ src-tauri
│  ├─ Cargo.lock
│  ├─ Cargo.toml
│  ├─ build.rs
│  ├─ capabilities
│  │  └─ default.json
│  ├─ gen
│  │  └─ schemas
│  │     ├─ acl-manifests.json
│  │     ├─ capabilities.json
│  │     ├─ desktop-schema.json
│  │     └─ macOS-schema.json
│  ├─ icons
│  │  ├─ 128x128.png
│  │  ├─ 128x128@2x.png
│  │  ├─ 32x32.png
│  │  ├─ Square107x107Logo.png
│  │  ├─ Square142x142Logo.png
│  │  ├─ Square150x150Logo.png
│  │  ├─ Square284x284Logo.png
│  │  ├─ Square30x30Logo.png
│  │  ├─ Square310x310Logo.png
│  │  ├─ Square44x44Logo.png
│  │  ├─ Square71x71Logo.png
│  │  ├─ Square89x89Logo.png
│  │  ├─ StoreLogo.png
│  │  ├─ icon.icns
│  │  ├─ icon.ico
│  │  └─ icon.png
│  ├─ src
│  │  ├─ lib.rs
│  │  ├─ main.rs
│  │  ├─ storage
│  │  │  └─ mod.rs
│  │  └─ todo_model
│  │     └─ mod.rs
│  └─ tauri.conf.json
└─ tsconfig.json

```