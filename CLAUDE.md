# Carlos Tarrats Portfolio

## Rules
- **Never commit unless explicitly told to do so**
- **NEVER revert files unless explicitly told to do so** - Do not use git checkout, git restore, or any command that reverts changes. Comparing to git is NOT the same as reverting.
- **For all UI/frontend work, follow SKILL.md** - Contains design principles, visual hierarchy, accessibility requirements, and component patterns
- **NEVER guess** - Do not assume, estimate, or calculate values. Use exact values from the design source, or ask for clarification. (The Figma MCP plugin is currently disabled — if a design needs Figma values, ask the user to re-enable it.)
- **NEVER summarize** - Do not paraphrase or summarize instructions. Follow them exactly as given.
- **Look at pixels and placement in detail** - Pay close attention to exact pixel values, spacing, and positioning. Do not approximate.

## Browser Testing Tools
Three browser automation options available. Use in this order of preference:

### 1. Agent Browser (PREFERRED)
Vercel's agent-browser CLI at `/opt/homebrew/bin/agent-browser`. Fast, headless browser automation.
```bash
agent-browser open <url>           # Navigate to URL
agent-browser snapshot             # Get page structure (for AI)
agent-browser snapshot -i          # Interactive elements only
agent-browser click "text=Button"  # Click by text
agent-browser find text Discover click  # Find and click
agent-browser wait 2000            # Wait ms
agent-browser screenshot           # Take screenshot
agent-browser close                # Close browser
```
GitHub: https://github.com/vercel-labs/agent-browser

### 2. Claude in Chrome
MCP tools (`mcp__claude-in-chrome__*`) for direct browser control. Requires Chrome extension.

### 3. Playwright
For automated testing scripts.

## About
Personal design portfolio for Carlos Tarrats, a Product Designer focused on simplifying complex systems. Site is hosted on GitHub Pages at https://carlostarrats.github.io

## Owner
- **Name:** Carlos Tarrats
- **Role:** Product Designer
- **Focus:** 0-1 product development, enterprise systems, complex system simplification
- **LinkedIn:** https://www.linkedin.com/in/carlos-t-b869016

## Archive Reference
The previous portfolio (v1) is preserved in the `archive/v1` branch. Reference it for:
- Project content and descriptions
- Image assets (in `images/` folder)
- Previous design approach and styling

### Projects from v1:
1. **DDS (Defense Digital Service)** - DoD product & service design (CUI/Secret)
2. **LoCA** - 0-1 art marketplace with QR-based purchasing
3. **Kikoff** - Financial education marketplace discovery
4. **Sourceability** - RFQ platform for electronics sourcing
5. **ELOQUII (Walmart)** - Plus-size fashion e-commerce
6. **Control** - Open source LLM interface (personal project)
7. **RankBee AI** - 0-1 SaaS for AI SEO
8. **Experiments** - Web experiments including Mood Atlas

## Tech Stack (v2 - Current)
- Static HTML/CSS/JS
- GitHub Pages hosting
- No build process (vanilla)

### Fonts (all self-hosted in `fonts/`)
- **Nyght Serif Light** - h1 headings (`NyghtSerif-Light.woff2`)
- **Instrument Serif** - h2 headings, labels, project titles (`InstrumentSerif-Regular.woff2`, `InstrumentSerif-Italic.woff2`)
- **Baskervville** - Chat panel, see-more tags (`Baskervville-Regular.woff2`)
- **Geist Pixel** - Preloader animation (`GeistPixel-Triangle.woff2`, `GeistPixel-Line.woff2`, `GeistPixel-Circle.woff2`)
- All fonts are preloaded via `<link rel="preload">` on every page
- No external font dependencies (Google Fonts removed)

## Current Projects (Homepage)
1. **AdaptiveShop** - Modern ecommerce platform with AI features
2. **Defense Digital Service** - DoD digital transformation and high-security government systems
3. **Control** - Local-first on-device LLM app for iPhone
4. **RankBee** - AI visibility tooling for ChatGPT, Gemini, content quality, and generative search
5. **Frank** - Local-first collaboration layer for feedback on URLs, files, or canvases

## More Section (Homepage)
1. **LoCA** - Discovering local art through physical spaces
2. **Eloquii** - Flexible commerce systems for fashion retail
3. **Photography** - Exhibited film photography
4. **Flip** - Visual diff tooling for Git commits
5. **Mood Atlas** - Apple Music visualization through Thayer's mood model
6. **Muse** - Visual-first media library exploration (disabled link)
7. **AA Gallery** - Creative and brand work for American Apparel
8. **Spirit Ivory** - Atmospheric exploration game (disabled link)

## Repository Structure
```
/                    # Root - main site files
├── index.html       # Homepage
├── styles.css       # Main stylesheet
├── sitemap.xml      # SEO sitemap
├── robots.txt       # Crawler instructions
├── llms.txt         # LLM-readable site summary
├── .nojekyll        # Disables Jekyll for GitHub Pages
├── carlos-chat-proxy/ # Vercel serverless proxy for chat API
├── fonts/           # All self-hosted fonts (Nyght Serif, Baskervville, Instrument Serif, Geist Pixel)
├── images/          # All image assets
├── mood-atlas/      # Mood Atlas built app (compiled)
│   ├── index.html
│   └── assets/      # JS/CSS bundles
├── mood-atlas-src/  # Mood Atlas source (gitignored, local only)
└── projects/        # Project detail pages
    ├── adaptiveshop.html
    ├── control.html
    ├── dds.html
    ├── eloquii.html
    ├── frank.html
    ├── kikoff.html
    ├── loca.html
    └── rankbee.html
```

## SEO & Accessibility
All pages include:
- Meta descriptions
- Canonical URLs
- Open Graph tags (og:type, og:title, og:description, og:url)
- Twitter card tags
- Skip navigation link for keyboard users
- Aria labels on interactive elements
- Alt text on images

Homepage also has:
- JSON-LD structured data (Person schema)
- Favicon (favicon.svg)
- Share image (og:image, twitter:image)

## Removed Features
- **Brand Carousel** (removed 2026-02-05): 3D rotating carousel with infinite scroll. CSS still commented out in `styles.css`; images in `images/brand/`. Full history in git.
- **Vimeo Embeds** (removed with Brand Carousel): IDs `367486985` (LoCA), `367487760` (American Apparel).

## Deployment
- Push to `main` branch auto-deploys to GitHub Pages
- No build step required for static files
- `.nojekyll` file must remain for proper asset loading

## Commands
```bash
# View archived v1 files
git show archive/v1:<filename>

# Example: view old index.html
git show archive/v1:index.html

# List all files in archive
git ls-tree --name-only archive/v1
```

## Hero Flicker
- Cycles through images behind the hero text
- 1.5 second interval between images
- Crossfade transition with opacity
- Images stored in `images/hero-flicker/`

## Image Optimization
Images must be resized before adding to the site:

### Hero Flicker (`images/hero-flicker/`)
- **Target size:** 700×394px (retina-ready for 350px display)
- **Format:** JPG
- **Command:** `sips -z 394 700 <image.jpg>`

## Video Assets
MP4 videos used in project cards and detail pages.

### Guidelines
- **Target size:** Under 600KB per video where possible
- **Format:** MP4 (H.264)
- **Fast start:** Run `ffmpeg -i input.mp4 -c copy -movflags +faststart output.mp4` before committing new MP4s. This moves the MP4 `moov` atom to the front without re-encoding or changing quality.
- **Homepage card attributes:** `loop muted playsinline class="deferred-video" data-src="..."`
- **Project inline video attributes:** `muted loop playsinline preload="metadata"`; do not add `autoplay`
- Hero videos should be ~500KB or less

### Locations
- `images/adaptiveshop/` - AdaptiveShop project videos
- `images/control/` - Control project videos
- `images/eloquii/` - Eloquii project videos
- `images/frank/` - Frank project videos

### Loading Behavior
- Homepage videos are deferred with `data-src`; JavaScript attaches the `<source>` only when the card is near the viewport.
- Project page videos are managed with `IntersectionObserver`; they play near the viewport and pause when offscreen.
- Manual/controlled videos, such as the DDS video, keep `controls preload="metadata"` and are not autoplay-managed.
- Lightbox videos still autoplay after the user opens the lightbox.

## Skeleton Loading
Loading states shown before images/videos are ready:
- Gradient pulse animation (`skeleton-pulse`)
- Applied via `.is-loaded` class toggle
- JavaScript detects `img.complete` or `video.readyState >= 3`
- Skeleton removed once asset is ready

## Design Notes (v2)
- Dark background (#252525)
- Mobile responsive with media queries
- Smooth transitions and animations

## Mood Atlas
Interactive 3D music visualization (React + Three.js + Vite). Live at https://tarrats.xyz/mood-atlas/ and https://mood-atlas.tarrats.xyz/

**Detailed docs live in `mood-atlas-src/CLAUDE.md`** (gitignored, local-only) — covering the emotion-analysis pipeline (`enrich.js` → `blend.js`), data refresh, and the two-target build/deploy (Vercel primary + GitHub Pages bundled copy). Read that file before working on Mood Atlas.

## Carlos LLM Chat
- Side tray chat panel powered by proxy at `carlos-chat-proxy.vercel.app`
- Proxy only works from live domain (not localhost)
- Starter question buttons for common topics
- Supports multi-turn conversation history
- Chat panel cannot be tested locally — test on live site after deploy

## Preloader
- "Thinking" screen with animated card stack
- Currently disabled (`if (true || ...)` bypass in index.html)
- Can be re-enabled by removing `true || ` from the preloader script
- Waits for fonts + 4s minimum display time when enabled
