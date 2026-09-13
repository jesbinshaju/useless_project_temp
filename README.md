# A10 METER 📐

> *"How many A10s tall is that?"*  
> Measure real-world objects using a person or object of known height in the same photo, converted directly into standard units and **A10 units** (Mohanlal reference height).

---

## 🚀 Features

- **Zero-Backend / Local Only**: All calculations and image handling happen directly in the browser. Zero image uploads to any server.
- **Camera API & Gallery Upload**: Uses `navigator.mediaDevices.getUserMedia` for live mobile/desktop capture, with `<input type="file" capture="environment">` fallback for any device.
- **Canvas Scaling**: Accurately maps screen touch/click coordinates to the image's native bitmap resolution.
- **Dedicated `MeasurementEngine`**: Zero UI dependencies, pure mathematical engine.
- **Configurable Celebrity Height**: Centrally configured in `src/data/config.ts`.
- **Responsive Dark Design**: Optimized for smartphones with large touch targets and clear instructions.

---

## 📐 How the Measurement Formula Works

Location: [`src/measurement/MeasurementEngine.ts`](file:///d:/useless_project_temp/src/measurement/MeasurementEngine.ts)

1. **Euclidean Pixel Distance**:
   $$\text{distance} = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$
2. **Proportional Height**:
   $$\text{objectHeightMeters} = \text{referenceHeightMeters} \times \left( \frac{\text{objectPixelHeight}}{\text{referencePixelHeight}} \right)$$
3. **A10 Multiplier**:
   $$\text{a10Multiplier} = \frac{\text{objectHeightMeters}}{\text{A10\_HEIGHT\_METERS}}$$
4. **Imperial Conversion**:
   $$\text{objectHeightFeet} = \text{objectHeightMeters} \times 3.28084$$

---

## ⚙️ Where A10 Height is Configured

Location: [`src/data/config.ts`](file:///d:/useless_project_temp/src/data/config.ts)

```typescript
export const A10_HEIGHT_METERS = 1.72; // Configurable Mohanlal reference height in meters
export const A10_NAME = "Mohanlal";
export const A10_UNIT_LABEL = "A10";
```

To change the reference celebrity height, simply edit `A10_HEIGHT_METERS` in that single file.

---

## 💻 Local Development & Build

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Dev Server
```bash
npm run dev
```
Open your browser at the URL shown (typically `http://localhost:5173`).

### 3. Build for Production
```bash
npm run build
```
This runs `tsc -b` and `vite build`, generating the static bundle in `dist/`.

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🌐 Deployment Instructions

### Deploy to Vercel

#### Method A: Via Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Run from the project root:
   ```bash
   vercel
   ```
3. When prompted, use standard Vite settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Method B: Via Vercel Dashboard (GitHub / Git)
1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel automatically detects Vite:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Click **Deploy**.

---

### Deploy to Netlify

#### Method A: Via Netlify CLI
1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```
2. Deploy directly:
   ```bash
   netlify deploy --prod --dir=dist
   ```

#### Method B: Drag and Drop (No Git required)
1. Run `npm run build` locally.
2. Open [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop the `dist` folder directly onto the page. Your site will be live in seconds!

#### Method C: Via Netlify Dashboard (Git)
1. Connect your repository in Netlify.
2. Settings:
   - **Base directory**: (leave blank or `/`)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Click **Deploy Site**.

---

## ⚠️ Accuracy Disclaimer

This measurement uses the known physical height of a reference object in the photograph. Accuracy depends on perspective, camera angle, and keeping the reference and measured object at approximately the same distance and ground level.
