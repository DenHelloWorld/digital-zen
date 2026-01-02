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

### 0. Ensure Repository is Public

**Important:** GitHub Pages requires a public repository on free GitHub accounts. If your repository is private:

- **Option 1 (Recommended):** Make the repository public
  1. Go to Settings → General
  2. Scroll to "Danger Zone"
  3. Click "Change visibility" → "Make public"
  
- **Option 2:** Upgrade to GitHub Enterprise for private repository hosting
  - GitHub Enterprise allows private GitHub Pages sites
  - [Learn more about GitHub Enterprise](https://docs.github.com/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site)

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
- **Solution:** Make repository public (Settings → General → Danger Zone → Change visibility) or upgrade to GitHub Enterprise
- **Note:** Privacy policy must be publicly accessible for Chrome Web Store anyway

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
