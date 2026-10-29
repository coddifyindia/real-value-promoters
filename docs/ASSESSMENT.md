# Assessment of realvaluepromoters.com (29 Oct 2026)

Method: automated audit of the live site at 375 px (phone), 820 px (tablet) and
1440 px (desktop) with a real browser, plus a review of its HTML, network
requests and form handling.

## What was wrong

### Leads: the business-critical gap
| Finding | Impact |
| --- | --- |
| The contact form doesn't send anything. It opens the visitor's own email app (`mailto:`) with the message pre-filled. | On most phones nothing usable happens, and nothing is stored anywhere. **Every web enquiry that didn't get sent manually was lost.** |
| The newsletter box in the footer isn't connected to anything. | Sign-ups were discarded. |
| Property pages have no enquiry form, only phone numbers. | The highest-intent visitors (looking at a specific project) had no low-effort way to enquire. |

### Mobile and tablet
| Finding | Impact |
| --- | --- |
| The top bar (phone + WhatsApp + YouTube buttons) is wider than a phone screen, so pages render 417–620 px wide on a 375 px phone. | Browsers zoom out; text is tiny and the menu button sits off-screen. |
| Property pages are 1800 px wide on every device (map iframe and thumbnail strip overflow). | Sideways scrolling on every project page. |
| Desktop nav links are brown on a dark video. | Barely readable. |

### Speed
| Finding | Impact |
| --- | --- |
| The home page autoplays a **36 MB** stock video from Pexels. | Very slow on mobile data; the home page took ~38 s to finish loading in testing. It also shows someone else's houses, not your projects. |
| Several images are broken (404/400): `grid.svg`, `placeholder.svg`, the Crystal Gateway card photo, Opal Garden photos 32–33, an About-page Google photo. | Broken images look untrustworthy. |
| YouTube and Google Maps iframes load on page open. | ~1–2 MB of extra script per property page. |

### Search (SEO) and sharing
| Finding | Impact |
| --- | --- |
| Every page has the same title, "Real Value Properties" (not even your brand name). | Google can't tell pages apart; property pages don't rank for "plots in Sulur" etc. |
| No `robots.txt`, no `sitemap.xml`, no Open Graph tags, no structured data. | Slower indexing; WhatsApp/Facebook shares show no image. |
| URLs are `/properties/1`, `/properties/2`… | Meaningless to people and search engines. |
| Homepage stats show "0+ Projects, 0+ Families". | Looks broken. |

### Content and housekeeping
- Hot-linked bank logos from third-party sites (they can disappear or be changed without notice).
- Emoji in project names ("💐💐💐") and inconsistent casing.
- Footer credit to a third-party site.

## What the new site does

| Area | Change |
| --- | --- |
| **Lead capture** | Contact form, per-property **Enquire / Book a site visit** form, and newsletter, all saved to **Supabase**. |
| **Email** | Via **Resend**: the team gets an alert with one-tap Call/WhatsApp; the visitor gets a branded confirmation. |
| **WhatsApp** | After submitting, visitors get a **Continue on WhatsApp** button with a pre-filled message naming the project. |
| **Admin** (`/admin`) | Leads inbox with status (New → Contacted → Site visit booked → Closed / Spam), notes, search, CSV export. Property manager: add/edit projects, upload and reorder photos, hide sold-out projects. Changes go live instantly. |
| **Mobile first** | Proper hamburger menu; a sticky **Call · WhatsApp · Enquire** bar on phones; no sideways scrolling at any width (verified at 375/820/1440 px). |
| **Speed** | Real project photos (compressed from 71 MB to 36 MB, served as AVIF/WebP at the right size per device) instead of the video; YouTube loads only when tapped. Pages are prerendered and cached, with server response in single-digit milliseconds. |
| **SEO** | Unique title and description per page; readable URLs (`/properties/crystal-gateway`) with permanent redirects from the old numbered URLs; sitemap, robots.txt, Open Graph images, and `RealEstateListing` structured data. |
| **Spam & safety** | Hidden honeypot field, minimum fill time, 5 enquiries per 10 minutes per connection, database row-level security (visitors can never read leads), and admin access limited to named accounts. |
| **Filters** | Search, city, type and price sort on the Properties page, kept in the URL so filtered links can be shared. |

## Recommended next steps (not built yet)
1. **Google Business Profile + reviews**: link real Google reviews on the site. This is the biggest trust signal for land buyers.
2. **Analytics**: Vercel Web Analytics (one click) or GA4, plus conversion tracking on form submits for ad campaigns.
3. **Real numbers**: if you have verified figures (families served, years in business, acres developed), add them. The old "0+" counters were removed rather than invented.
4. **Tamil language version** of key pages.
5. **Price list / layout PDF download** gated behind the enquiry form.
6. **WhatsApp Business API** auto-reply, if lead volume grows.
