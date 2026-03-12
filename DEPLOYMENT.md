# 🚀 Deploy to GitHub Pages - Step by Step Guide

## Prerequisites
- GitHub account (free)
- Git installed on your computer
- Your recipe project files

---

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `recipes-app` (or any name you prefer)
   - **Description**: "Hebrew Recipe Manager with Voice Reader"
   - **Visibility**: Choose **Public** (required for free GitHub Pages)
   - **DO NOT** check "Add a README file"
5. Click **"Create repository"**

---

## Step 2: Prepare Your Project

1. Open your project folder in terminal/command prompt:
   ```bash
   cd "c:\Users\WIN11\Desktop\מיכל\לימודים\יד\AI\מתכונים"
   ```

2. Initialize Git (if not already done):
   ```bash
   git init
   ```

3. Create a `.gitignore` file to exclude unnecessary files:
   ```bash
   echo "node_modules/" > .gitignore
   echo ".DS_Store" >> .gitignore
   echo "Thumbs.db" >> .gitignore
   ```

---

## Step 3: Add Files to Git

1. Add all your files:
   ```bash
   git add .
   ```

2. Create your first commit:
   ```bash
   git commit -m "Initial commit: Recipe Manager App"
   ```

---

## Step 4: Connect to GitHub

1. Copy the repository URL from GitHub (it looks like: `https://github.com/YOUR-USERNAME/recipes-app.git`)

2. Add the remote repository:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/recipes-app.git
   ```

3. Push your code to GitHub:
   ```bash
   git branch -M main
   git push -u origin main
   ```

---

## Step 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **"Settings"** tab (top right)
3. Scroll down and click **"Pages"** in the left sidebar
4. Under **"Source"**, select:
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **"Save"**

---

## Step 6: Wait for Deployment

1. GitHub will start building your site (takes 1-3 minutes)
2. Refresh the Settings > Pages page
3. You'll see a message: **"Your site is live at https://YOUR-USERNAME.github.io/recipes-app/"**
4. Click the link to view your deployed site!

---

## Step 7: Set Up Landing Page (Optional)

Since your app starts with `login.html`, you have two options:

### Option A: Rename login.html to index.html
```bash
# In your project folder
mv login.html index.html
```

Then update all links in other HTML files that reference `login.html` to `index.html`.

### Option B: Create a redirect index.html
Create a new `index.html` file:
```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=login.html">
    <title>Redirecting...</title>
</head>
<body>
    <p>Redirecting to login page...</p>
</body>
</html>
```

After making changes:
```bash
git add .
git commit -m "Add landing page"
git push
```

---

## 🎉 Your Site is Live!

Your recipe app is now accessible at:
```
https://YOUR-USERNAME.github.io/recipes-app/
```

---

## Updating Your Site

Whenever you make changes:

1. Save your files
2. Add changes to git:
   ```bash
   git add .
   ```
3. Commit changes:
   ```bash
   git commit -m "Description of changes"
   ```
4. Push to GitHub:
   ```bash
   git push
   ```
5. Wait 1-2 minutes for GitHub Pages to rebuild

---

## Troubleshooting

### Site not loading?
- Wait 5 minutes after first deployment
- Check Settings > Pages for any error messages
- Ensure repository is **Public**

### CSS/JS not loading?
- Check that file paths are relative (no leading `/`)
- Verify all files are committed and pushed
- Check browser console for errors (F12)

### Hebrew text not displaying correctly?
- Ensure all HTML files have `<meta charset="UTF-8">`
- Files should be saved with UTF-8 encoding

---

## Custom Domain (Optional)

To use your own domain:

1. Buy a domain from any registrar (Namecheap, GoDaddy, etc.)
2. In GitHub Settings > Pages, add your custom domain
3. In your domain registrar, add these DNS records:
   ```
   Type: A
   Host: @
   Value: 185.199.108.153
   
   Type: A
   Host: @
   Value: 185.199.109.153
   
   Type: A
   Host: @
   Value: 185.199.110.153
   
   Type: A
   Host: @
   Value: 185.199.111.153
   
   Type: CNAME
   Host: www
   Value: YOUR-USERNAME.github.io
   ```
4. Wait 24-48 hours for DNS propagation

---

## Security Notes

⚠️ **Important**: This app stores data in browser localStorage:
- Data is stored locally on each user's device
- No server-side database
- Users on different devices won't share data
- Clearing browser data will delete all recipes

For a production app with shared data, consider:
- Firebase (free tier available)
- Supabase (free tier available)
- Backend API with database

---

## Free Alternatives to GitHub Pages

If you need more features:

1. **Netlify** (netlify.com)
   - Drag & drop deployment
   - Automatic HTTPS
   - Form handling

2. **Vercel** (vercel.com)
   - Fast deployment
   - Automatic previews
   - Serverless functions

3. **Cloudflare Pages** (pages.cloudflare.com)
   - Unlimited bandwidth
   - Fast CDN
   - Free SSL

---

## Need Help?

- GitHub Pages Documentation: https://docs.github.com/pages
- Git Tutorial: https://git-scm.com/docs/gittutorial
- GitHub Support: https://support.github.com

---

**Congratulations! Your recipe app is now live and accessible to anyone with the URL! 🎊**
