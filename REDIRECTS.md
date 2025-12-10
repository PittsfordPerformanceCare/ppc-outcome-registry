# Legacy URL Redirect Configuration

This document maps all legacy Lovable app URLs to their unified equivalents in this project.

**Important:** These redirects must be configured on each SOURCE domain (the legacy Lovable projects), not in this codebase. This project can only control routing within its own domain.

## Implementation Instructions

For each legacy project listed below:
1. Open the legacy Lovable project
2. Add a redirect rule (via hosting configuration or index page redirect)
3. Ensure the redirect is HTTP 301 (permanent)
4. Preserve all query parameters exactly as received

---

## Concussion Pillar Redirect

| Legacy URL | Unified Route |
|------------|---------------|
| `https://concussion-clarity-hub.lovable.app` | `/site/concussion` |

**Full redirect URL:** `https://<your-unified-domain>/site/concussion`

---

## Concussion Cluster Article Redirects

| Article Name | Legacy URL | Unified Route |
|--------------|------------|---------------|
| Neuro Speed Reboot | `https://neuro-speed-reboot.lovable.app` | `/site/articles/concussion/post-concussion-performance-decline` |
| Frontal Fog Fixer | `https://frontal-fog-fixer.lovable.app` | `/site/articles/concussion/frontal-system-fog-after-concussion` |
| Neuro Athlete Recovery | `https://neuro-athlete-recovery.lovable.app` | `/site/articles/athlete/neuro-athlete-recovery` |
| Kid Brain Bounce | `https://kid-brain-bounce.lovable.app` | `/site/articles/pediatric/pediatric-concussion-care` |
| Concussion Flow | `https://concussion-flow.lovable.app` | `/site/articles/concussion/autonomic-nervous-system-flow` |
| Cerebellar Timing Quest | `https://cerebellar-timing-quest.lovable.app` | `/site/articles/concussion/cerebellar-timing-and-coordination` |
| Concussion Energy Clarity | `https://concussion-energy-clarity.lovable.app` | `/site/articles/concussion/concussion-energy-crisis-and-recovery` |
| Vision Vestibular Sync | `https://vision-vestibular-sync.lovable.app` | `/site/articles/concussion/visual-vestibular-mismatch` |

---

## Route Verification Status

All destination routes have been verified to exist:

- [x] `/site/concussion` - SiteConcussion component
- [x] `/site/articles/:category/:slug` - SiteArticleDetail dynamic route
- [x] `post-concussion-performance-decline` - Exists in concussionArticles
- [x] `frontal-system-fog-after-concussion` - Exists in concussionArticles
- [x] `neuro-athlete-recovery` - Exists in athleteArticles
- [x] `pediatric-concussion-care` - Exists in pediatricArticles
- [x] `autonomic-nervous-system-flow` - Exists in concussionArticles
- [x] `cerebellar-timing-and-coordination` - Exists in concussionArticles
- [x] `concussion-energy-crisis-and-recovery` - Exists in concussionArticles
- [x] `visual-vestibular-mismatch` - Exists in concussionArticles

---

## Query Parameter Preservation

React Router automatically preserves query parameters during navigation. When implementing redirects on legacy projects, ensure the redirect script appends `window.location.search` to the destination URL.

**Example redirect script for legacy projects:**

```html
<script>
  const destination = 'https://your-unified-domain.com/site/articles/concussion/post-concussion-performance-decline';
  window.location.replace(destination + window.location.search);
</script>
```

---

## JSON Configuration (Machine-Readable)

```json
{
  "redirects": [
    {
      "name": "Concussion Pillar",
      "from": "https://concussion-clarity-hub.lovable.app",
      "to": "/site/concussion"
    },
    {
      "name": "Neuro Speed Reboot",
      "from": "https://neuro-speed-reboot.lovable.app",
      "to": "/site/articles/concussion/post-concussion-performance-decline"
    },
    {
      "name": "Frontal Fog Fixer",
      "from": "https://frontal-fog-fixer.lovable.app",
      "to": "/site/articles/concussion/frontal-system-fog-after-concussion"
    },
    {
      "name": "Neuro Athlete Recovery",
      "from": "https://neuro-athlete-recovery.lovable.app",
      "to": "/site/articles/athlete/neuro-athlete-recovery"
    },
    {
      "name": "Kid Brain Bounce",
      "from": "https://kid-brain-bounce.lovable.app",
      "to": "/site/articles/pediatric/pediatric-concussion-care"
    },
    {
      "name": "Concussion Flow",
      "from": "https://concussion-flow.lovable.app",
      "to": "/site/articles/concussion/autonomic-nervous-system-flow"
    },
    {
      "name": "Cerebellar Timing Quest",
      "from": "https://cerebellar-timing-quest.lovable.app",
      "to": "/site/articles/concussion/cerebellar-timing-and-coordination"
    },
    {
      "name": "Concussion Energy Clarity",
      "from": "https://concussion-energy-clarity.lovable.app",
      "to": "/site/articles/concussion/concussion-energy-crisis-and-recovery"
    },
    {
      "name": "Vision Vestibular Sync",
      "from": "https://vision-vestibular-sync.lovable.app",
      "to": "/site/articles/concussion/visual-vestibular-mismatch"
    }
  ]
}
```

---

## Additional Legacy Redirects (Future)

Add additional mappings here as needed:

| Legacy URL | Unified Route | Notes |
|------------|---------------|-------|
| _TBD_ | `/site/msk` | MSK pillar redirect |
| _TBD_ | `/patient/concierge` | Legacy intake URL |

---

## Notes

- No Registry, Episode, MCID, automation, or schema changes were made
- All redirects are 301 (permanent) for SEO authority preservation
- Query parameters (including UTM tags) must be preserved by the source redirect
- This document serves as the authoritative redirect map for launch preparation
