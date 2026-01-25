# Pale Kreyol

A modern React application built with **Vite**, styled with **Tailwind CSS**, and deployed on **Vercel**. This project is structured to be clean, simple, and stable so builds do not fail on deployment.

---

## 🚀 Tech Stack

* **React 18**
* **Vite 7**
* **Tailwind CSS**
* **PostCSS & Autoprefixer**
* **Firebase** (optional, for future use)
* **Vercel** for deployment

---

## 📦 Requirements

Make sure you are using:

* **Node.js 18.x** (important)
* **npm 9+**

If you are on Windows, use **PowerShell** or **Git Bash**.

Check versions:

```bash
node -v
npm -v
```

---

## 📁 Correct Project Structure

Use this exact structure to avoid Vercel build errors:

```
pale-kreyol/
├─ public/
│  └─ favicon.svg
│
├─ src/
│  ├─ assets/
│  ├─ components/
│  ├─ pages/
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css
│
├─ index.html
├─ postcss.config.js
├─ tailwind.config.js
├─ vite.config.js
├─ package.json
├─ package-lock.json
├─ .gitignore
└─ README.md
```

---

## 📄 package.json (Important Notes)

* **Do not add engine restrictions unless needed**
* Vercel uses Node 18 by default
* `baseline-browser-mapping` warning is safe and does NOT break builds

---

## ▶️ Install Dependencies

```bash
npm install
```

If you want a clean install on Windows:

```powershell
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

## 🧪 Run Locally

```bash
npm run dev
```

Then open:

```
http://localhost:5173
```

---

## 🏗️ Build for Production

```bash
npm run build
```

This creates a `dist/` folder used by Vercel.

---

## 🌐 Deploy to Vercel

### Vercel Settings

* **Framework Preset:** Vite
* **Build Command:**

  ```
  npm run build
  ```
* **Output Directory:**

  ```
  dist
  ```
* **Node Version:** 18.x

No custom configuration needed.

---

## ⚠️ Common Warnings Explained

### baseline-browser-mapping warning

```
[baseline-browser-mapping] The data in this module is over two months old
```

✅ This is **only a warning**
✅ It does **not fail builds**

Optional fix:

```bash
npm i baseline-browser-mapping@latest -D
```

---

## 🧯 If Vercel Build Fails

1. Make sure **Node 18** is used
2. Make sure `index.html` is in the root
3. Make sure `vite.config.js` exists
4. Do NOT delete `package-lock.json`
5. Redeploy without cache

---

## 📜 Scripts

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

---

## 📌 Notes

* This project is ready for scaling
* Folder structure follows best practices
* Safe for Vercel, Netlify, and Cloudflare Pages

---

## 👤 Author

**LordwXdev**

---

## 📄 License

This project is private for now. License can be added later.
