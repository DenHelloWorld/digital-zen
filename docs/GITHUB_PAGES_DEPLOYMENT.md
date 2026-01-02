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

1. **Repository access:** Write permissions to the `DenHelloWorld/digital-zen` repository
2. **Git installed:** For manual deployment method
3. **GitHub Actions enabled:** For automated deployment (should be enabled by default)

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
