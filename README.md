
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