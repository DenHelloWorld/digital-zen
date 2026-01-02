# GitHub Pages Deployment Guide

This guide provides instructions for deploying the Digital Zen documentation and privacy policy to GitHub Pages.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Deployment Methods](#deployment-methods)
  - [Method 1: Automated Deployment (Recommended)](#method-1-automated-deployment-recommended)
  - [Method 2: Manual Deployment](#method-2-manual-deployment)
- [Enabling GitHub Pages](#enabling-github-pages)
- [Accessing Deployed Content](#accessing-deployed-content)
- [Updating the Privacy Policy](#updating-the-privacy-policy)
- [Troubleshooting](#troubleshooting)

---

## Overview

GitHub Pages allows us to host static documentation and the privacy policy directly from our repository. This is particularly important for the privacy policy, which is required for Chrome Web Store publication.

**What gets deployed:**
- Privacy Policy (`docs/privacy-policy.html`)
- Chrome Web Store readiness documentation
- Publication checklist
- Any other documentation in the `docs/` folder

**Deployment URL:** `https://denhelloworld.github.io/digital-zen/`

---

## Prerequisites

Before deploying to GitHub Pages, ensure you have:

1. **Hosting decision:** Choose how to host your privacy policy (see "Alternative Hosting Options" section below if you want to keep your repository private)
2. **Repository access:** Write permissions to the `DenHelloWorld/digital-zen` repository
3. **Git installed:** For manual deployment method
4. **GitHub Actions enabled:** For automated deployment (should be enabled by default)

> **Important for Private Repositories:** GitHub Pages requires public repositories on free GitHub accounts. If you want to keep your source code private, see the "Alternative Hosting Options for Private Repositories" section below for other ways to host your privacy policy.

---

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

We have configured a GitHub Actions workflow that automatically deploys the `docs/` folder to GitHub Pages whenever changes are pushed to the `main` branch.

#### How it works:

1. Make changes to any file in the `docs/` folder
2. Commit and push to the `main` branch:
   ```bash
   git add docs/
   git commit -m "Update documentation"
   git push origin main
   ```
3. GitHub Actions automatically builds and deploys to the `gh-pages` branch
4. Changes are live at `https://denhelloworld.github.io/digital-zen/` within a few minutes

#### Workflow file location:

The workflow is defined in `.github/workflows/deploy-gh-pages.yml`

---

### Method 2: Manual Deployment

If you need to deploy manually or the automated workflow is not working, follow these steps:

#### Step 1: Clone the repository (if not already done)

```bash
git clone https://github.com/DenHelloWorld/digital-zen.git
cd digital-zen
```

#### Step 2: Install gh-pages (if using npm method)

```bash
npm install --save-dev gh-pages
```

#### Step 3: Deploy to gh-pages branch

Using the `gh-pages` npm package:

```bash
npx gh-pages -d docs
```

Or using Git directly:

```bash
# Create and checkout a new gh-pages branch
git checkout --orphan gh-pages

# Remove all files except docs
git rm -rf .
git checkout main -- docs/

# Move docs contents to root
mv docs/* .
rm -rf docs

# Create a .nojekyll file to bypass Jekyll processing
touch .nojekyll

# Commit and push
git add .
git commit -m "Deploy documentation to GitHub Pages"
git push origin gh-pages --force

# Switch back to main branch
git checkout main
```

---

## Alternative Hosting Options for Private Repositories

If you want to keep your source code private but need a publicly accessible privacy policy, consider these alternatives to GitHub Pages:

### Option 1: Netlify Drop (Easiest)

**Free tier:** Unlimited static sites, 100GB bandwidth/month

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop your `docs/privacy-policy.html` file
3. Get instant URL like: `https://unique-name.netlify.app/privacy-policy.html`
4. Optional: Configure custom domain

**Pros:** No account needed for basic hosting, instant deployment, free SSL  
**Cons:** Need to manually update by re-uploading file

### Option 2: Vercel (Free, Git-based)

**Free tier:** Unlimited projects, 100GB bandwidth/month

1. Create account at [vercel.com](https://vercel.com)
2. Create a new project
3. Upload only your `docs/` folder (or connect a separate public repo)
4. Get URL like: `https://digital-zen-docs.vercel.app/privacy-policy.html`
5. Auto-deploys on changes if connected to Git

**Pros:** Free, automatic deployments, fast CDN  
**Cons:** Requires account

### Option 3: GitLab Pages (Free with Private Repos)

**GitLab Pages works with private repositories on free tier!**

1. Create GitLab account at [gitlab.com](https://gitlab.com)
2. Create new private project
3. Add your privacy policy files
4. Create `.gitlab-ci.yml`:
   ```yaml
   pages:
     stage: deploy
     script:
       - mkdir .public
       - cp -r docs/* .public
       - mv .public public
     artifacts:
       paths:
         - public
     only:
       - main
   ```
5. Privacy policy will be at: `https://username.gitlab.io/project-name/privacy-policy.html`

**Pros:** Free with private repos, Git-based, similar to GitHub  
**Cons:** Need to use GitLab instead of GitHub

### Option 4: Cloudflare Pages (Free)

**Free tier:** Unlimited sites, unlimited bandwidth

1. Create account at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Create new project
3. Upload docs folder or connect Git repo
4. Get URL like: `https://digital-zen.pages.dev/privacy-policy.html`

**Pros:** Free, unlimited bandwidth, fast global CDN  
**Cons:** Requires account

### Option 5: GitHub Gist (Quick & Simple)

1. Go to [gist.github.com](https://gist.github.com)
2. Create new **public** gist
3. Paste privacy policy HTML content
4. Name file `privacy-policy.html`
5. Get URL like: `https://gist.githubusercontent.com/username/gist-id/raw/privacy-policy.html`

**Pros:** Very simple, uses GitHub, public gists don't affect repo visibility  
**Cons:** Not ideal for styled HTML, URL is long

### Option 6: Separate Public Documentation Repository

1. Create new public repo: `digital-zen-docs`
2. Copy only `docs/` folder contents to this repo
3. Enable GitHub Pages on the public docs repo
4. Main source code stays in private repo

**Pros:** Keep code private, use GitHub Pages, free  
**Cons:** Two repos to maintain, need to sync privacy policy updates

### Recommended Approach for Private Repositories

**Best option:** Use **Netlify** or **Vercel** for quick, free hosting without making your code public.

**Steps:**
1. Export your `docs/privacy-policy.html` file
2. Upload to Netlify Drop or Vercel
3. Use the provided URL in Chrome Web Store submission
4. Update by re-uploading when privacy policy changes

This way, your source code remains private while meeting Chrome Web Store requirements.

---

## Enabling GitHub Pages

After deploying content to the `gh-pages` branch, you need to enable GitHub Pages in the repository settings:

### Step-by-Step Instructions:

1. **Navigate to repository settings:**
   - Go to https://github.com/DenHelloWorld/digital-zen
   - Click on **Settings** (gear icon in the top menu)

2. **Access Pages settings:**
   - In the left sidebar, scroll down to **Code and automation**
   - Click on **Pages**

3. **Configure source:**
   - Under **Source**, select **Deploy from a branch**
   - Under **Branch**, select:
     - Branch: `gh-pages`
     - Folder: `/ (root)`
   - Click **Save**

4. **Wait for deployment:**
   - GitHub will display a message: "Your site is ready to be published at `https://denhelloworld.github.io/digital-zen/`"
   - Initial deployment may take 1-2 minutes
   - Once complete, the message will change to: "Your site is live at..."

5. **Verify deployment:**
   - Visit https://denhelloworld.github.io/digital-zen/privacy-policy.html
   - You should see the privacy policy page

---

## Accessing Deployed Content

Once GitHub Pages is enabled and deployed, you can access the content at:

- **Privacy Policy:** https://denhelloworld.github.io/digital-zen/privacy-policy.html
- **Chrome Web Store Readiness:** https://denhelloworld.github.io/digital-zen/chrome-web-store-readiness.html
- **Publication Checklist:** https://denhelloworld.github.io/digital-zen/publication-checklist.html
- **Russian Readiness Report:** https://denhelloworld.github.io/digital-zen/chrome-web-store-readiness-ru.html

### Important Notes:

- **URLs are case-sensitive:** Ensure you use the correct file names
- **HTML extension required:** GitHub Pages serves files with their extensions (`.html`, `.md`)
- **Markdown rendering:** GitHub Pages will automatically render `.md` files as HTML

---

## Updating the Privacy Policy

When you need to update the privacy policy:

### Using Automated Workflow:

1. Edit `docs/privacy-policy.html`
2. Update the "Last Updated" date in the file
3. Commit and push to `main`:
   ```bash
   git add docs/privacy-policy.html
   git commit -m "Update privacy policy"
   git push origin main
   ```
4. GitHub Actions will automatically deploy the changes

### Manual Update:

1. Edit `docs/privacy-policy.html`
2. Update the "Last Updated" date
3. Run the deployment command:
   ```bash
   npx gh-pages -d docs
   ```

---

## Troubleshooting

### Issue: Cannot enable GitHub Pages - "Upgrade or make this repository public"

**Problem:** When trying to enable GitHub Pages, you see a message: "Upgrade or make this repository public to enable Pages"

**Cause:** GitHub Pages is only available for public repositories on free GitHub accounts.

**Solutions:**

1. **Use alternative hosting to keep code private (Recommended):**
   - See "Alternative Hosting Options for Private Repositories" section above
   - Netlify, Vercel, GitLab Pages, or Cloudflare Pages all work with private source code
   - These options are free and don't require making your repository public

2. **Make repository public (for open-source projects):**
   - Go to Settings → General
   - Scroll to "Danger Zone"
   - Click "Change visibility" → "Make public"
   - Confirm the change
   - Return to Settings → Pages to enable GitHub Pages

3. **Upgrade to GitHub Enterprise (paid option):**
   - GitHub Enterprise allows private GitHub Pages sites
   - [Learn more about GitHub Enterprise](https://docs.github.com/enterprise-cloud@latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site)
   - Costs approximately $21/user/month

> **Recommendation:** If you want to keep your source code private, use alternative hosting (Option 1) instead of making the repository public.

### Issue: GitHub Pages not showing updated content

**Solution:**
- Wait 1-2 minutes for GitHub Pages to rebuild
- Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check the Actions tab to ensure the workflow completed successfully

### Issue: 404 Not Found error

**Possible causes and solutions:**

1. **File not in docs folder:**
   - Ensure the file exists in the `docs/` folder
   - Check that the file was committed and pushed

2. **Incorrect URL:**
   - Verify the file name matches exactly (case-sensitive)
   - Ensure you're including the `.html` extension

3. **gh-pages branch not configured:**
   - Follow the "Enabling GitHub Pages" section above
   - Verify the branch exists: `git branch -a | grep gh-pages`

### Issue: GitHub Actions workflow failing

**Steps to debug:**

1. Go to the **Actions** tab in GitHub
2. Click on the failed workflow run
3. Review the error logs
4. Common issues:
   - **Permissions error:** Ensure GitHub Actions has write permissions in repository settings
   - **Branch protection:** Ensure `gh-pages` branch is not protected or allow Actions to push

### Issue: Privacy policy styling not loading

**Solution:**
- Ensure the HTML file contains inline styles (our privacy policy does)
- Check browser console for any errors
- Verify the file was deployed correctly by viewing source

---

## For Chrome Web Store Submission

When submitting Digital Zen to the Chrome Web Store, you will need to provide the privacy policy URL:

**Privacy Policy URL:** https://denhelloworld.github.io/digital-zen/privacy-policy.html

This URL should be entered in:
1. Chrome Web Store Developer Dashboard
2. Privacy practices section
3. Privacy policy field

---

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [gh-pages npm package](https://www.npmjs.com/package/gh-pages)
- [Chrome Web Store Privacy Policy Requirements](https://developer.chrome.com/docs/webstore/program-policies/)

---

## Maintenance

**Regular maintenance tasks:**

1. **Review privacy policy:** At least annually or when extension permissions change
2. **Update documentation:** Keep deployment docs in sync with actual process
3. **Monitor deployments:** Check Actions tab occasionally to ensure automated deployments work
4. **Test links:** Periodically verify all documentation links work correctly

---

**Last Updated:** January 2, 2026
