# Carlos Tarrats Portfolio

## Rules
- **Never commit unless explicitly told to do so**
- **NEVER revert files unless explicitly told to do so** - Do not use git checkout, git restore, or any command that reverts changes. Comparing to git is NOT the same as reverting.
- **For all UI/frontend work, follow SKILL.md** - Contains design principles, visual hierarchy, accessibility requirements, and component patterns
- **NEVER guess** - Do not assume, estimate, or calculate values. Use exact values from Figma MCP or ask for clarification.
- **NEVER summarize** - Do not paraphrase or summarize instructions. Follow them exactly as given.
- **Look at pixels and placement in detail** - Pay close attention to exact pixel values, spacing, and positioning. Do not approximate.

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

## Brand Carousel
- 3D rotating carousel with perspective effect
- Infinite scroll animation (120s loop)
- JavaScript-based hover detection for reliable interaction on 3D elements
- Hover lifts item 70px, rotates flat, scales 1.1x
- Bounce easing on return animation

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

## Design Notes (v2)
- Dark background (#252525)
- 3D brand carousel with hover interactions
- Mobile responsive with media queries
- Smooth transitions and animations
