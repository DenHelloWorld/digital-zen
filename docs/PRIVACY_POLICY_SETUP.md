# Privacy Policy and GitHub Pages Setup - Quick Reference

This document provides a quick reference for the privacy policy and GitHub Pages deployment setup.

## Files Created

### Privacy Policy Pages
- **`docs/privacy-policy.html`** - English version of the privacy policy
- **`docs/privacy-policy-ru.html`** - Russian version of the privacy policy

Both versions include:
- Comprehensive privacy information required for Chrome Web Store
- Details about data collection, storage, and usage
- Explanation of Chrome permissions
- Information about Google OAuth integration
- Contact information
- Language switcher between English and Russian versions

### Documentation
- **`docs/GITHUB_PAGES_DEPLOYMENT.md`** - Complete guide for deploying documentation to GitHub Pages
- **`.github/workflows/deploy-gh-pages.yml`** - GitHub Actions workflow for automated deployment

### Updated Files
- **`README.md`** - Added links to privacy policy and deployment guide

## Privacy Policy URLs

Once GitHub Pages is enabled, the privacy policy will be accessible at:

- **English:** https://denhelloworld.github.io/digital-zen/privacy-policy.html
- **Russian:** https://denhelloworld.github.io/digital-zen/privacy-policy-ru.html

## Next Steps to Enable GitHub Pages

To make the privacy policy publicly accessible, follow these steps:

### 0. Choose Privacy Policy Hosting Strategy

**Important:** The privacy policy must be publicly accessible for Chrome Web Store submission, but you have several options that don't require making your entire repository public:

#### Option 1: Host Privacy Policy on External Service (Recommended for Private Repos)

If you want to keep your code private, host only the privacy policy on a free static hosting service:

- **Netlify Drop** - Drag and drop `privacy-policy.html` to [app.netlify.com/drop](https://app.netlify.com/drop)
- **GitHub Gist** - Create a public gist with your privacy policy: [gist.github.com](https://gist.github.com)
- **Vercel** - Deploy just the `docs/` folder to [vercel.com](https://vercel.com)
- **Cloudflare Pages** - Free static hosting at [pages.cloudflare.com](https://pages.cloudflare.com)
- **GitLab Pages** - Works with private repositories on free tier: [docs.gitlab.com/ee/user/project/pages](https://docs.gitlab.com/ee/user/project/pages)

**Pros:** Keep your source code private, free hosting, simple setup  
**Cons:** Privacy policy hosted separately from main repo

#### Option 2: Create Separate Public Documentation Repository

Create a new public repository (e.g., `digital-zen-docs`) containing only:
- Privacy policy HTML files
- Public documentation
- No source code

Then use GitHub Pages on this separate public repo.

**Pros:** Source code stays private, privacy policy on GitHub Pages, free  
**Cons:** Need to maintain two repositories

#### Option 3: Make Repository Public

Make the entire `digital-zen` repository public to use GitHub Pages.

**Pros:** Everything in one place, automated deployment works  
**Cons:** Source code becomes public

#### Option 4: GitHub Enterprise (Paid)

Upgrade to GitHub Enterprise to use GitHub Pages with private repositories.

**Pros:** Keep code private, use GitHub Pages  
**Cons:** Costs money (~$21/user/month)

> **Recommendation:** If you want to keep your code private, use **Option 1** (external hosting) or **Option 2** (separate public docs repo). Both are free and keep your source code private.

### 1. Merge this PR to main branch
```bash
# After PR review and approval, merge to main
```

### 2. Enable GitHub Pages in repository settings

1. Go to https://github.com/DenHelloWorld/digital-zen/settings/pages
2. Under **Source**, select:
   - **Deploy from a branch**
   - Branch: `gh-pages`
   - Folder: `/ (root)`
3. Click **Save**

### 3. Trigger the workflow

The workflow will automatically run when:
- Changes are pushed to `docs/**` in the `main` branch
- You can also manually trigger it from the Actions tab

To manually trigger:
1. Go to https://github.com/DenHelloWorld/digital-zen/actions
2. Click on "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

### 4. Verify deployment

After a few minutes, visit:
- https://denhelloworld.github.io/digital-zen/privacy-policy.html

## Using the Privacy Policy URL

When submitting Digital Zen to the Chrome Web Store:

1. **Navigate to:** Chrome Web Store Developer Dashboard
2. **Find:** Privacy practices section
3. **Enter URL:** https://denhelloworld.github.io/digital-zen/privacy-policy.html

## Updating the Privacy Policy

To update the privacy policy in the future:

1. Edit `docs/privacy-policy.html` (or `docs/privacy-policy-ru.html` for Russian)
2. Update the "Last Updated" date
3. Commit and push to `main` branch
4. GitHub Actions will automatically deploy the changes

## Troubleshooting

### Cannot enable GitHub Pages (Private repository)
- **Problem:** Message says "Upgrade or make this repository public to enable Pages"
- **Cause:** GitHub Pages requires public repositories on free accounts
- **Solution:** Use alternative hosting (Netlify, Vercel, GitLab Pages) to keep code private - see deployment guide for details
- **Alternative:** Make repository public or upgrade to GitHub Enterprise
- **Note:** Privacy policy must be publicly accessible for Chrome Web Store, but source code can stay private using alternative hosts

### Privacy policy not accessible
- **Check:** GitHub Pages is enabled in repository settings
- **Check:** The workflow completed successfully in Actions tab
- **Wait:** Initial deployment may take 1-2 minutes

### 404 Not Found
- **Verify:** File exists in `docs/` folder
- **Verify:** URL is correct (case-sensitive)
- **Check:** `gh-pages` branch exists and contains the files

### Workflow not running
- **Check:** Workflow file exists in `.github/workflows/`
- **Check:** Changes were pushed to `main` branch
- **Check:** Changes affected files in `docs/**`
- **Manually trigger:** Use workflow_dispatch from Actions tab

## Additional Resources

For detailed information, see:
- [GitHub Pages Deployment Guide](./GITHUB_PAGES_DEPLOYMENT.md) - Complete deployment instructions
- [Chrome Web Store Readiness Report](./chrome-web-store-readiness.md) - Publication requirements

---

**Created:** January 2, 2026  
**Purpose:** Chrome Web Store publication requirement
