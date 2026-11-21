# Giri Kondisetty

Personal portfolio. A scroll story with a 3D particle scene behind it, in light and dark themes: about, work experience, personal projects, background, skills and contact.

## Stack

- React 19 and Vite
- three.js for the particle scene (custom shaders, loaded as a separate chunk after first paint)
- GSAP for the counters
- Instrument Serif, Inter Tight and JetBrains Mono, self-hosted through Fontsource

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
npm run lint
```

## Layout

```
index.html          page shell, social tags, and the theme script that runs before first paint
public/             hero photograph, portrait, social preview image, favicon
src/data.js         all content: profile, work experience, projects, story screens, education, skills
src/App.jsx         theme, reduced-motion and WebGL checks
src/views/          StoryView: the screens, scrolling and navigation
src/story/          the screen layout used by the project screens, and the story styles
src/gl/             the particle scene, its shapes and the shared particle shader
src/sections/       hero, about, experience, projects, background, skills, contact
src/components/     navigation, side rail, project icons, the rotating portrait and small UI helpers
src/styles.css      design tokens for both themes and the shared layout
.github/workflows/  build and deploy to GitHub Pages
```

## Editing content

Everything shown on the page comes from `src/data.js`. Each entry in `screens` is one screen of the story, and its `group` decides which header item it belongs to. Its `g` value picks the shape the 3D scene is in, and the shapes are listed in `STAGES` in `src/gl/StoryScene.js`.

To show a Résumé button in the navigation and on the contact screen, put a PDF in `public/` and set `resume` in `src/data.js` to its file name. With `resume: null` the buttons are not rendered.

## Deploying

The workflow in `.github/workflows/deploy.yml` lints, builds and publishes `dist/` to GitHub Pages on every push to `main`. In the repository settings, set Pages to use GitHub Actions as its source.

The social preview tags in `index.html` assume the site lives at `https://giri-kondisetty.github.io/`. If it is served from another address, update `canonical`, `og:url` and `og:image` there.

## Behaviour

- Light is the default theme. The choice is remembered in the browser.
- On wide screens each scroll gesture moves one screen, and the arrow keys, Page Up, Page Down and Space do the same. A screen taller than the window scrolls normally.
- On phones and narrow windows the screens stack and scroll natively, and the 3D scene is a faint backdrop with fewer points.
- With `prefers-reduced-motion`, scrolling is native, the 3D scene is not started, and the reveal animations are off.
- If WebGL is not available the scene is skipped and the page still shows all of its content.
- Printing hides the scene and navigation and shows all content.
