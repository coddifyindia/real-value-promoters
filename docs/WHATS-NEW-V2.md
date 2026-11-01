# What's new in v2

A summary of the premium upgrade, written for the Real Value Promoters team.

## A site that feels premium

| What you'll see | Why it matters |
| --- | --- |
| **Cinematic home page.** Four of your real project photos crossfade with a slow zoom behind the headline, which animates in line by line. Includes a frosted-glass search bar and live numbers (projects, cities, loan support). | First impressions decide whether a buyer keeps scrolling. Your own projects, not stock footage. |
| **Photo city tiles.** "Where we build" is now a photo mosaic with one tile per city, the biggest market largest. | Visitors pick their city in one tap. |
| **Smooth motion everywhere.** Sections fade up as you scroll, cards lift on hover, and a thin gold progress bar under the menu shows how far down the page you are. On a project page the content slides in as it loads, and going back to the list morphs the project photo back into its card. | The polish buyers expect from premium developers' sites. |
| **Built light.** All animation runs in the browser's own engine (CSS scroll-driven animations, View Transitions). No animation library, so the site stays fast on 4G. Anyone who has asked their phone for reduced motion gets a still version. | Speed and accessibility aren't traded for looks. |

## New tools for buyers

| Feature | How it helps sales |
| --- | --- |
| **Shortlist (♥).** Tap the heart on any project to save it. The heart in the menu shows the count. The **Shortlist** page compares saved projects side by side. | Buyers comparing 3–4 projects come back to one place instead of leaving. |
| **One enquiry for the whole shortlist.** The form is pre-filled with every saved project. **Ask on WhatsApp** and **Share with family** send the list in one tap. | More leads with more context, and the family decision-makers are included. |
| **Loan & EMI calculator** on every project with a fixed price. Sliders for down payment, interest rate and tenure; monthly EMI, total interest and a visual split; a **Get loan assistance** button that leads to the enquiry form. | The "can I afford it?" question is answered on the page, with a direct path to your loan support. |

## Measured and tested

| What | Details |
| --- | --- |
| **Visitor analytics** | Vercel Web Analytics: page views, top projects, traffic sources and devices. Cookie-free, so no consent banner is needed. Leads, calls and WhatsApp taps are tracked as conversions (on Vercel Pro). |
| **Automated testing** | 31 unit tests and 138 browser tests (46 checks, each on phone, tablet and desktop sizes), run on every change. They cover: every page loads without errors or sideways scrolling, accessibility checks, touch-target sizes, filters, shortlist, EMI maths, enquiry and newsletter forms saved to the database, a dropped connection, rate limits, security headers, old-link redirects and SEO files. |
| **Accessibility fixes** | The tests found low-contrast text (gold labels, the WhatsApp button, form hints). Colours were adjusted to meet WCAG AA, which is also a Google ranking signal. |

## Round 2: award-level polish and reliability

| Area | What changed |
| --- | --- |
| **Animation** | Headlines rise word by word. The hero photos drift with a parallax effect while the copy fades as you scroll (desktop). Live numbers count up. "How it works" cards stack over each other as you scroll. A giant-type band scrolls across the page. Photos are uncovered with a wipe. Main buttons have a light sheen and lean toward the mouse. All of it is CSS-first and switches off for reduced-motion users. |
| **Sizing audit** | Every button, field and link was measured on phone, tablet and desktop. All are now at least 44px (the touch-target standard). Fields and buttons in a row share one height. Fields keep 16px text on touch screens so iPhones don't zoom in. An automated test enforces this from now on. |
| **Errors** | Designed error and 404 pages, always with a way to reach the team. If the database goes down, pages stay up from cache and enquiries are emailed to the team instead of being lost. A dropped connection keeps the visitor's typing. |
| **Loading** | Shimmer placeholders shaped like the real content (no jumping layout). The menu link and the tapped project card show progress immediately. |
| **Security** | Strict browser security policy (CSP, HSTS and more), locked-down admin, allowlisted admin links, newsletter rate limiting, and a published security contact. |

## Round 3: award-style experience

Modelled on this year's Awwwards real-estate winners (ERA Residence, Belgrade Arbor, Sobha Privy, Likova).

| Area | What changed |
| --- | --- |
| **3D hero** | A live 3D model of a gated layout (plots, roads, park, avenue trees, compound wall, entrance arch) in golden-hour light. On desktop, scrolling tells a three-part story: the layout, available plots lifting and glowing gold, then villas rising. Phones get a lighter version that plays on its own. It loads after the page is usable, pauses when off screen, and visitors who prefer reduced motion see the photo hero instead. |
| **Projects** | A pinned horizontal gallery: scrolling down slides the projects sideways, with large photos and numbering. On phones it's a swipeable row. |
| **Cities** | A large-type index. With a mouse, a photo of each city's projects follows the cursor. |
| **Editorial layout** | "Why us" and reviews are set as typography rather than icon cards, and the footer ends with a giant "Real Value" wordmark. |
| **Feel** | Smooth inertial scrolling and a cursor that labels what you're about to open (mouse only), a short intro reveal on the first visit, and a subtle film grain. |
| **Speed** | First load is unchanged: LCP 0.6s on desktop, 0.8s on a throttled phone, with no layout shift. |
