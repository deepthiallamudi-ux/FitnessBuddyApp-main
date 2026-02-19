# Netlify Deployment Guide - FitnessBuddy Frontend

This guide provides step-by-step instructions to deploy your FitnessBuddy React frontend to Netlify.

## Prerequisites

- **Node.js** installed (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** installed (comes with Node.js)
- **Git** installed - [Download](https://git-scm.com/)
- **GitHub account** with your FitnessBuddy repo (recommended for continuous deployment)
- **Netlify account** - [Create free account](https://netlify.com)
- Supabase project with API keys and environment variables ready

---

## Step 1: Prepare Environment Variables

Before deploying, you need to set up your environment variables. These connect your frontend to your Supabase backend.

### Local Setup (for testing)

1. Navigate to your FrontEnd directory:
   ```bash
   cd FrontEnd
   ```

2. Create a `.env.local` file in the FrontEnd folder:
   ```bash
   touch .env.local
   ```

3. Add your Supabase credentials to `.env.local`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   > **Where to find these?**
   > - Go to your Supabase project dashboard
   > - Click **Settings** → **API**
   > - Copy your project URL and `anon` public key
   > - These are safe to share (they're public keys)

4. **Important:** Add `.env.local` to your `.gitignore` to prevent committing sensitive data:
   ```bash
   echo ".env.local" >> .gitignore
   ```

---

## Step 2: Test Build Locally

Before deploying, ensure your project builds correctly:

```bash
# Install dependencies (if not already done)
npm install

# Run development server (optional - to test locally)
npm run dev

# Build for production
npm run build
```

**Expected output:**
- A `dist` folder is created with optimized build files
- No errors in the terminal

---

## Step 3: Deployment Method A - GitHub Integration (Recommended)

### 3A: Connect GitHub to Netlify

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Sign in to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click **Sign up** or **Log in**
   - Choose **Sign up with GitHub** for easier integration

3. **Connect your repository:**
   - Click **New site from Git**
   - Select **GitHub** as your Git provider
   - Authorize Netlify to access your GitHub account
   - Select your `FitnessBuddyApp-main` repository
   - Choose the `main` branch

4. **Configure build settings:**
   
   In the Netlify interface, set:
   - **Base directory:** `FrontEnd`
   - **Build command:** `npm run build`
   - **Publish directory:** `FrontEnd/dist`

5. **Set environment variables:**
   
   - Click **Environment** → **Environment variables**
   - Add the following (without the `VITE_` prefix in Netlify):
     - Key: `VITE_SUPABASE_URL` | Value: `https://your-project.supabase.co`
     - Key: `VITE_SUPABASE_ANON_KEY` | Value: `your-anon-key`
   
   > Netlify automatically passes `VITE_*` prefixed variables to Vite

6. **Deploy:**
   - Click **Deploy site**
   - Netlify will build and deploy automatically
   - Your site will be live at a URL like `https://your-site-name.netlify.app`

---

## Step 3B - Alternative: Deploy via Netlify CLI

### Setup Netlify CLI:

```bash
npm install -g netlify-cli
```

### Deploy from command line:

1. **Login to Netlify:**
   ```bash
   netlify login
   ```
   (This opens a browser to authorize)

2. **Initialize your site:**
   ```bash
   cd FrontEnd
   netlify init
   ```
   
   When prompted:
   - Select **Create & configure a new site**
   - Choose your Netlify team
   - Name your site (e.g., `fitnesbuddy-app`)

3. **Set environment variables:**
   ```bash
   netlify env:set VITE_SUPABASE_URL https://your-project.supabase.co
   netlify env:set VITE_SUPABASE_ANON_KEY your-anon-key
   ```

4. **Build and deploy:**
   ```bash
   netlify deploy --prod
   ```

   Your site will be online at the URL shown in the output.

---

## Step 4: Verify Deployment

After deployment, test your application:

### Checklist:
- [ ] Website loads without errors
- [ ] Login page displays correctly
- [ ] Can log in with test credentials
- [ ] Dashboard loads and displays user data
- [ ] Workout logging works
- [ ] Can navigate between pages
- [ ] Browser console has no critical errors (F12 → Console tab)

### Check console for errors:
1. Open your deployed site
2. Press **F12** to open Developer Tools
3. Click **Console** tab
4. Look for red error messages

**Common issues:**
- **"Cannot find supabase"** → Missing environment variables
- **CORS errors** → Backend server not running or misconfigured
- **"Cannot read property of undefined"** → Missing API response

---

## Step 5: Custom Domain (Optional)

To use your own domain (e.g., `fitnesbuddyapp.com`):

1. **In Netlify Dashboard:**
   - Go to your site settings
   - Click **Domain management**
   - Click **Add custom domain**
   - Enter your domain name

2. **Update DNS settings:**
   - Log in to your domain registrar (GoDaddy, Namecheap, etc.)
   - Find DNS settings
   - Add Netlify's nameservers:
     ```
     dns1.p01.nsone.net
     dns2.p01.nsone.net
     dns3.p01.nsone.net
     dns4.p01.nsone.net
     ```
   - Wait 24-48 hours for DNS propagation

3. **Enable HTTPS:**
   - Netlify automatically provisions free SSL certificate
   - Wait 5-10 minutes for certificate to be issued

---

## Step 6: Continuous Deployment (Auto-Deploy on Push)

Once connected to GitHub, Netlify automatically deploys when you push to your branch:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Netlify automatically builds and deploys
# Check deployment status on Netlify Dashboard
```

To view build logs:
- Go to Netlify Dashboard
- Click your site
- Click **Deploys**
- Click the deployment to see logs

---

## Environment Variables Reference

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key | Yes |

**Never share:**
- Service role key (private key)
- Database passwords
- Private API keys

---

## Troubleshooting

### Build Failed
```
Error: Cannot find module 'react'
```
**Solution:** Add build command: `npm install && npm run build`

### Blank page after deployment
**Possible causes:**
1. Build directory is incorrect (should be `FrontEnd/dist`)
2. Base path issue - check if using `/FitnessBuddy/` somewhere
3. Check browser console (F12) for errors

### Environment variables not loading
1. Verify variable names start with `VITE_`
2. Redeploy after adding environment variables
3. Check that variable values don't have extra spaces

### Connection errors to Supabase
```
Error: Failed to fetch from supabase
```
**Solutions:**
1. Verify Supabase URL is correct
2. Check anon key is valid
3. Verify Supabase project is running
4. Check browser console for CORS errors

### Slow loading
- Enable Netlify Edge caching
- Optimize images in assets folder
- Check Network tab in DevTools to identify slow requests

---

## Performance Tips

### Optimize for Faster Loads:

1. **Enable compression:**
   - Netlify does this automatically
   - Check: Site settings → Build & Deploy → Post-processing

2. **Add to `netlify.toml`** (in FrontEnd folder):
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [build.environment]
     NODE_VERSION = "18"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Caching:**
   ```toml
   [[headers]]
     for = "/*"
     [headers.values]
       Cache-Control = "max-age=3600"
   ```

---

## Monitor Your Site

### Netlify Analytics:
- Go to **Analytics** tab in Dashboard
- View bandwidth usage
- See visitor statistics

### Real-time logs:
```bash
netlify logs
```

---

## Rollback to Previous Version

If deployment breaks:

1. **In Netlify Dashboard:**
   - Click **Deploys**
   - Find previous working version
   - Click **...** → **Restore**

2. **Via CLI:**
   ```bash
   netlify deploy --prod --alias=previous
   netlify deploy --prod --restore
   ```

---

## Backend Deployment

> Note: This guide covers frontend only. Your Supabase backend is cloud-hosted and doesn't need separate deployment.

If you have a custom Node.js backend server, see [Backend Deployment Guide](./BACKEND_DEPLOYMENT_GUIDE.md)

---

## Support & Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [React Deployment](https://react.dev/learn/deployment)
- [Supabase Documentation](https://supabase.com/docs)

---

## Quick Checklist - Deployment Flow

- [ ] Environment variables set locally (.env.local)
- [ ] `npm run build` succeeds locally
- [ ] Code pushed to GitHub main branch
- [ ] Netlify site created and connected
- [ ] Build settings configured (base: FrontEnd, publish: FrontEnd/dist)
- [ ] Environment variables added to Netlify
- [ ] First deployment succeeds
- [ ] All pages load and work correctly
- [ ] No console errors in production
- [ ] Custom domain configured (optional)

---

**Deployed successfully! 🎉**

Your FitnessBuddy app is now live and ready for users. Monitor your Netlify dashboard for performance and any issues.

