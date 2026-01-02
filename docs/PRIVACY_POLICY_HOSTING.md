# Privacy Policy Hosting Guide

This guide provides instructions for hosting the Digital Zen privacy policy on free static hosting services while keeping your source code private.

## Table of Contents

- [Overview](#overview)
- [Hosting Options](#hosting-options)
  - [Option 1: Vercel (Recommended)](#option-1-vercel-recommended)
  - [Option 2: GitLab Pages](#option-2-gitlab-pages)
  - [Option 3: Cloudflare Pages](#option-3-cloudflare-pages)
  - [Option 4: GitHub Gist](#option-4-github-gist)
  - [Option 5: Separate Public Repository](#option-5-separate-public-repository)
- [Updating the Privacy Policy](#updating-the-privacy-policy)
- [Troubleshooting](#troubleshooting)

---

## Overview

The privacy policy must be publicly accessible for Chrome Web Store publication, but you can keep your source code private by hosting only the privacy policy on a free static hosting service.

**Privacy Policy Files:**

- `docs/privacy-policy.html` - English version
- `docs/privacy-policy-ru.html` - Russian version

---

## Hosting Options

### Option 1: Vercel (Recommended)

**Free tier:** Unlimited projects, 100GB bandwidth/month

Vercel offers free static hosting with automatic deployments from Git repositories, including private ones.

#### Steps:

1. Create account at [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Choose deployment method:
   - **Upload `docs/` folder** as a ZIP file
   - **OR** Connect your GitHub repository (can be private) and configure:
     - Root Directory: `docs`
     - Build Command: (leave empty)
     - Output Directory: `.` (current directory)
4. Deploy and get URL like: `https://digital-zen-docs.vercel.app/privacy-policy.html`
5. Optional: Add custom domain in project settings

**Pros:** Free, automatic deployments with Git, fast CDN, works with private repos  
**Cons:** Requires account

**Privacy Policy URL for Chrome Web Store:**

- English: `https://your-project.vercel.app/privacy-policy.html`
- Russian: `https://your-project.vercel.app/privacy-policy-ru.html`

---

### Option 2: GitLab Pages

**GitLab Pages works with private repositories on the free tier!**

This is unique among free hosting providers - you can keep your repository private while hosting public pages.

#### Steps:

1. Create GitLab account at [gitlab.com](https://gitlab.com)
2. Create new **private** project (e.g., `digital-zen-docs`)
3. Add your privacy policy files (`privacy-policy.html` and `privacy-policy-ru.html`) to the repository root
4. Create `.gitlab-ci.yml` in the repository root:
   ```yaml
   pages:
     stage: deploy
     script:
       # Copy HTML files to public directory for GitLab Pages
       - mkdir public
       - cp *.html public/
     artifacts:
       paths:
         - public
     rules:
       - if: $CI_COMMIT_BRANCH == "main"
   ```
5. Push to GitLab - CI/CD will automatically deploy
6. Privacy policy will be at: `https://username.gitlab.io/project-name/privacy-policy.html`

**Pros:** Free with private repos, Git-based, automatic deployment, similar to GitHub  
**Cons:** Need to use GitLab instead of GitHub

**Privacy Policy URL for Chrome Web Store:**

- English: `https://username.gitlab.io/project-name/privacy-policy.html`
- Russian: `https://username.gitlab.io/project-name/privacy-policy-ru.html`

---

### Option 3: Cloudflare Pages

**Free tier:** Unlimited sites, unlimited bandwidth

Cloudflare Pages offers free static hosting with fast global CDN.

#### Steps:

1. Create account at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Click "Create a project"
3. Choose deployment method:
   - **Direct Upload:** Upload your `docs/` folder as a ZIP file
   - **Git Integration:** Connect your GitHub/GitLab repo (can be private)
4. Configure build settings:
   - Build output directory: `/` (if uploading just docs folder)
   - No build command needed for static HTML
5. Deploy and get URL like: `https://digital-zen.pages.dev/privacy-policy.html`
6. Optional: Add custom domain in project settings

**Pros:** Free, unlimited bandwidth, fast global CDN, auto-deploys with Git  
**Cons:** Requires account

**Privacy Policy URL for Chrome Web Store:**

- English: `https://digital-zen.pages.dev/privacy-policy.html`
- Russian: `https://digital-zen.pages.dev/privacy-policy-ru.html`

---

### Option 4: GitHub Gist

Quick and simple option using GitHub's Gist service. Gists are separate from repositories, so a public gist doesn't affect your repository's privacy.

#### Steps:

1. Go to [gist.github.com](https://gist.github.com)
2. Create new **public** gist
3. Paste privacy policy HTML content
4. Name file `privacy-policy.html`
5. Click "Create public gist"
6. Click "Raw" button to get the raw URL
   - URL pattern: `https://gist.githubusercontent.com/username/gist-id/raw/[hash]/privacy-policy.html`
   - The hash is stable for this version, bookmark this URL for Chrome Web Store
   - If you update the gist, the hash changes (get new raw URL after updates)

**Pros:** Very simple, uses GitHub, public gists don't affect repo visibility
**Cons:** Need to update URL in Chrome Web Store when gist is updated, raw HTML only (no preview)

**Note:** You'll need to create separate gists for English and Russian versions.

---

### Option 5: Separate Public Repository

Create a separate public repository for documentation only, keeping your main source code private.

#### Steps:

1. Create new **public** repository: `digital-zen-docs` (or similar name)
2. Copy only your `docs/` folder contents to this repository:
   - `privacy-policy.html`
   - `privacy-policy-ru.html`
3. Use one of the hosting options above (Vercel, Cloudflare Pages, etc.) with this public repo
4. Main source code stays in your private `digital-zen` repository

**Pros:** Source code stays private, documentation is public and easily accessible
**Cons:** Two repos to maintain, need to sync privacy policy updates manually

---

## Recommended Approach

**Best option:** Use **Vercel** or **GitLab Pages**

- **Vercel** - If you prefer automatic Git deployments and don't mind using a non-GitHub platform
- **GitLab Pages** - If you want to keep the repository completely private (unique feature)

Both are free, support automatic deployments, and work with private repositories.

### Quick Setup:

1. Choose Vercel or GitLab Pages
2. Upload your `docs/` folder or connect your repository
3. Get the privacy policy URL (e.g., `https://your-project.vercel.app/privacy-policy.html`)
4. Use this URL in Chrome Web Store submission
5. Your source code remains private ✅

---

## Updating the Privacy Policy

When you need to update the privacy policy:

### For Vercel/Cloudflare/GitLab (Git-based):

1. Edit `docs/privacy-policy.html` or `docs/privacy-policy-ru.html` locally
2. Update the "Last Updated" date
3. Commit and push changes to your repository
4. The hosting service will automatically redeploy
5. Changes are live within 1-2 minutes

### For GitHub Gist:

1. Go to your gist on [gist.github.com](https://gist.github.com)
2. Click "Edit"
3. Update the privacy policy content
4. Update the "Last Updated" date
5. Click "Update public gist"
6. **Important:** Get the new raw URL (the hash changes) and update it in Chrome Web Store

### For Separate Public Repo:

1. Clone your public docs repository
2. Edit the privacy policy files
3. Commit and push changes
4. The hosting service will automatically redeploy

---

## Troubleshooting

### Issue: Privacy policy not accessible after deployment

**Solution:**

- Wait 1-2 minutes for deployment to complete
- Check deployment logs in your hosting service dashboard
- Verify the URL is correct (case-sensitive)
- Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Changes not showing after update

**Solution:**

- Confirm changes were committed and pushed to repository
- Check deployment logs to ensure build succeeded
- Clear browser cache
- For Gist: Make sure you're using the updated raw URL with new hash

### Issue: File not found (404 error)

**Possible causes and solutions:**

1. **Incorrect file path:**
   - Ensure HTML files are in the root of deployed folder
   - Verify file names match exactly: `privacy-policy.html` and `privacy-policy-ru.html`

2. **Deployment not complete:**
   - Check hosting service dashboard for deployment status
   - Wait for deployment to finish (usually 1-2 minutes)

3. **Wrong URL:**
   - Verify you're using the correct domain from your hosting service
   - Ensure file extension `.html` is included in URL

### Issue: GitLab CI/CD pipeline failing

**Solution:**

- Check `.gitlab-ci.yml` syntax is correct
- Verify file paths in the script match your repository structure
- Check GitLab CI/CD logs for specific error messages
- Ensure `public` directory is created and files are copied to it

---

## For Chrome Web Store Submission

When submitting Digital Zen to the Chrome Web Store:

1. **Navigate to:** Chrome Web Store Developer Dashboard
2. **Find:** Privacy practices section
3. **Enter Privacy Policy URL:** Use the URL from your chosen hosting service
   - Example: `https://digital-zen-docs.vercel.app/privacy-policy.html`

**Important:** The privacy policy must be publicly accessible. Test the URL in an incognito browser window before submitting to Chrome Web Store.

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [GitLab Pages Documentation](https://docs.gitlab.com/ee/user/project/pages/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Chrome Web Store Privacy Policy Requirements](https://developer.chrome.com/docs/webstore/program-policies/)

---

**Last Updated:** January 2, 2026
