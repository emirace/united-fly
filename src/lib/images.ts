/**
 * Shared image paths. The files live in `public/assets`, so these are plain
 * URLs rather than the bundler-resolved `import.meta.url` handles the Vite app
 * used — the export shape is kept identical so call sites don't change.
 */
const IMAGES = {
  logo: "/assets/logo.png",
  hero: "/assets/hero.jpg",
  step1: "/assets/step1.svg",
  step2: "/assets/step2.svg",
  step3: "/assets/step3.svg",
  hong_kong: "/assets/hong_kong.jpg",
  maldives: "/assets/maldives.jpg",
  switzerland: "/assets/switzerland.jpg",
  thailand: "/assets/thailand.jpg",
  contact: "/assets/contact.svg",
};

export default IMAGES;
