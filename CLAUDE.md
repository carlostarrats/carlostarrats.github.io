# Carlos Tarrats Portfolio

## Rules
- **Never commit unless explicitly told to do so**
- **NEVER revert files unless explicitly told to do so** - Do not use git checkout, git restore, or any command that reverts changes. Comparing to git is NOT the same as reverting.
- **For all UI/frontend work, follow SKILL.md** - Contains design principles, visual hierarchy, accessibility requirements, and component patterns
- **NEVER guess** - Do not assume, estimate, or calculate values. Use exact values from Figma MCP or ask for clarification.
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

### Fonts
- **Nyght Serif Light** - h1 headings (local: `fonts/NyghtSerif-Light.woff2`)
- **Instrument Serif** - h2 headings, labels, project titles
- **Roboto Serif** - Body text (weight 200)
- **Cabinet Grotesk** - Base/fallback font

## Current Projects
1. **Control** - Open-source on-device LLM app for iOS
2. **AdaptiveShop** - Modern ecommerce platform with AI features
3. **Defense Digital Service** - DoD digital transformation
4. **Eloquii** - Plus-size fashion e-commerce redesign
5. **Mood Atlas** - 3D music visualization using Thayer Model of Mood

## Repository Structure
```
/                    # Root - main site files
├── index.html       # Homepage
├── styles.css       # Main stylesheet
├── sitemap.xml      # SEO sitemap
├── robots.txt       # Crawler instructions
├── .nojekyll        # Disables Jekyll for GitHub Pages
├── fonts/           # Custom fonts (Nyght Serif)
├── images/          # All image assets
├── mood-atlas/      # Mood Atlas built app (compiled)
│   ├── index.html
│   └── assets/      # JS/CSS bundles
├── mood-atlas-src/  # Mood Atlas source (gitignored, local only)
└── projects/        # Project detail pages
    ├── control.html
    ├── adaptiveshop.html
    ├── dds.html
    └── eloquii.html
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

## Brand Carousel (REMOVED)
**Removed:** 2026-02-05
**Recovery:**
- HTML: `git show HEAD~1:index.html`
- CSS: `git show HEAD~1:styles.css` (or uncomment in current file)

Previously included:
- 3D rotating carousel with perspective effect
- Infinite scroll animation (120s loop)
- JavaScript-based hover detection for reliable interaction on 3D elements
- Hover lifts item 70px, rotates flat, scales 1.1x
- Bounce easing on return animation
- Images in `images/brand/`
- CSS commented out in styles.css (not deleted)

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

### Brand Carousel (`images/brand/`) - REMOVED
(Section removed 2026-02-05, images still exist in `images/brand/`)
- **Target size:** 700×400px (retina-ready for 200px display height)
- **Format:** JPG
- **Command:** `sips -z 400 700 <image.jpg>`

## Video Assets
MP4 videos used in project cards and detail pages.

### Guidelines
- **Target size:** Under 600KB per video
- **Format:** MP4 (H.264)
- **Attributes:** `autoplay loop muted playsinline`
- Hero videos should be ~500KB or less

### Locations
- `images/adaptiveshop/` - AdaptiveShop project videos
- `images/control/` - Control project videos
- `images/eloquii/` - Eloquii project videos

## Skeleton Loading
Loading states shown before images/videos are ready:
- Gradient pulse animation (`skeleton-pulse`)
- Applied via `.is-loaded` class toggle
- JavaScript detects `img.complete` or `video.readyState >= 3`
- Skeleton removed once asset is ready

## Vimeo Embeds (REMOVED with Brand Carousel)
Previously in brand carousel:
- **367486985** - LoCA video
- **367487760** - American Apparel video
- Embedded with `?background=1&muted=1&autoplay=1&loop=1&autopause=0`

## Design Notes (v2)
- Dark background (#252525)
- Mobile responsive with media queries
- Smooth transitions and animations

## Mood Atlas
Interactive 3D music visualization using the Thayer Model of Mood. Live at https://tarrats.xyz/mood-atlas/

### Tech Stack
- React + TypeScript + Vite
- Three.js / React Three Fiber for 3D
- Tailwind CSS
- Deezer API for chart data

### Features
- **Personal Mode** - Visualize your Apple Music library by emotion
- **Discover Mode** - Explore global music charts by country (21 regions)
- **Examine Mode** - Deep dive into emotion clusters
- 3D positioning based on energy (Y-axis) and valence (X-axis)
- Color-coded by Thayer quadrants (Happy=Yellow, Sad=Blue, Frantic=Red, Calm=Cyan)

### Source Code (gitignored - local only)
Location: `mood-atlas-src/`
```
mood-atlas-src/
├── src/
│   ├── components/     # React components
│   ├── data/           # Static data files
│   │   ├── discoverCharts.json  # Pre-fetched Deezer data
│   │   └── cityChartData.ts     # Type definitions
│   └── utils/
│       ├── deezerCharts.ts      # Loads static chart data
│       └── emotionAnalysis.ts   # Thayer model logic
├── scripts/
│   └── fetchDeezerCharts.js     # Monthly data refresh script
└── package.json
```

### Updating Discover Charts
Run monthly to refresh global chart data:
```bash
cd mood-atlas-src
node scripts/fetchDeezerCharts.js
npm run build
```
Data is pre-fetched and bundled (no runtime API calls needed).

### Build & Deploy
```bash
cd mood-atlas-src
npm install          # First time only
npm run build        # Outputs to ../mood-atlas/
```
Then commit the `mood-atlas/` folder changes.

## Recent Commits
- `a8f92af` - Update Eloquii project and site title
- `3f5fcf0` - Add loading spinner to Mood Atlas
- `29faa77` - Remove source code from repo, update Thayer project
- `79f8366` - Add Thayer Model of Mood project to homepage
- `05c4399` - Refactor emotion analysis and improve type safety
- `c7dae8d` - Add Discover mode with live Deezer regional charts
- `2b0c2f7` - Add Examine mode with colored background and UI adaptations
- `d32f2cf` - Add Mood Atlas music visualization project
