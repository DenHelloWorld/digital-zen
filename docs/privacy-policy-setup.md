# Privacy Policy Setup - Quick Reference

This document provides a quick reference for the privacy policy setup and hosting.

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

- **`docs/privacy-policy-hosting.md`** - Complete guide for hosting the privacy policy

## Privacy Policy URLs

Once you've chosen a hosting service and deployed, the privacy policy will be accessible at URLs like:

- **Vercel:** `https://project-name.vercel.app/privacy-policy.html`
- **GitLab Pages:** `https://username.gitlab.io/project-name/privacy-policy.html`
- **Cloudflare Pages:** `https://project-name.pages.dev/privacy-policy.html`

## Hosting Strategy

### Choose Your Hosting Service

The privacy policy must be publicly accessible for Chrome Web Store submission. You have several free options that keep your source code private:

#### Option 1: Vercel (Recommended)

Best for automatic Git deployments with private repositories.

- **Free tier:** Unlimited projects, 100GB bandwidth/month
- **Pros:** Git integration, automatic deployments, fast CDN, works with private repos
- **Cons:** Requires account
- **Setup time:** ~5 minutes

#### Option 2: GitLab Pages

Unique feature: Works with **private repositories** on free tier.

- **Free tier:** Unlimited projects
- **Pros:** Keep repo completely private, Git-based, automatic deployment
- **Cons:** Need to use GitLab instead of GitHub
- **Setup time:** ~10 minutes

#### Option 3: Cloudflare Pages

Best for unlimited bandwidth and global CDN.

- **Free tier:** Unlimited sites, unlimited bandwidth
- **Pros:** Unlimited bandwidth, fast global CDN, Git integration
- **Cons:** Requires account
- **Setup time:** ~5 minutes

#### Option 4: GitHub Gist

Quick and simple, no additional platforms needed.

- **Free tier:** Unlimited gists
- **Pros:** Very simple, uses GitHub, doesn't affect repo visibility
- **Cons:** Need to update URL when gist changes, raw HTML only
- **Setup time:** ~2 minutes

#### Option 5: Separate Public Docs Repository

Keep main code private, create public docs repo.

- **Free tier:** Unlimited public repos
- **Pros:** Source code stays private, full control
- **Cons:** Two repos to maintain
- **Setup time:** ~10 minutes (+ choosing a hosting service from above)

> **Recommendation:** Use **Vercel** or **GitLab Pages** for the best balance of features and ease of use. Both support automatic deployments and work with private repositories.

## Quick Setup Steps

1. **Choose a hosting service** from the options above
2. **Upload or connect** your `docs/` folder containing the privacy policy files
3. **Get the URL** for your privacy policy (e.g., `https://your-project.vercel.app/privacy-policy.html`)
4. **Test the URL** in an incognito browser to ensure it's publicly accessible
5. **Use this URL** in Chrome Web Store submission

Your source code remains private ✅

## Using the Privacy Policy URL

When submitting Digital Zen to the Chrome Web Store:

1. **Navigate to:** Chrome Web Store Developer Dashboard
2. **Find:** Privacy practices section
3. **Enter URL:** Use the privacy policy URL from your chosen hosting service
   - English: `https://your-hosting-url/privacy-policy.html`
   - Russian (optional): `https://your-hosting-url/privacy-policy-ru.html`

## Updating the Privacy Policy

To update the privacy policy in the future:

### For Git-based hosting (Vercel, GitLab Pages, Cloudflare Pages):

1. Edit `docs/privacy-policy.html` (or `docs/privacy-policy-ru.html` for Russian)
2. Update the "Last Updated" date
3. Commit and push changes
4. Hosting service automatically redeploys within 1-2 minutes

### For GitHub Gist:

1. Edit the gist on GitHub
2. Update the "Last Updated" date
3. Save changes
4. Get the new raw URL (hash changes) and update in Chrome Web Store

## Troubleshooting

### Privacy policy not accessible

- **Wait:** Deployment may take 1-2 minutes
- **Check:** Deployment logs in hosting service dashboard
- **Verify:** URL is correct (case-sensitive)
- **Clear:** Browser cache

### 404 Not Found

- **Verify:** File exists in deployed folder
- **Check:** File name matches exactly (`privacy-policy.html`)
- **Ensure:** Deployment completed successfully
- **Test:** URL in incognito browser

### Changes not showing

- **Confirm:** Changes were pushed to repository
- **Check:** Deployment logs show successful build
- **Clear:** Browser cache
- **Wait:** Hosting service may cache for a few minutes

## Additional Resources

For detailed information, see:

- [Privacy Policy Hosting Guide](./privacy-policy-hosting.md) - Complete hosting instructions
- [Chrome Web Store Readiness Report](./chrome-web-store-readiness.md) - Publication requirements

---

**Created:** January 2, 2026  
**Purpose:** Chrome Web Store publication requirement
