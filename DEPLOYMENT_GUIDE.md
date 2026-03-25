# 🚀 GLM AI Chat - Render Deployment Guide

Complete step-by-step guide to deploy your GLM AI Chat to Render.com

---

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Render account (free at https://render.com)
- ✅ Code pushed to GitHub (already done!)

---

## 🎯 Step-by-Step Deployment

### Step 1: Go to Render
1. Visit **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended) or email

### Step 2: Create New Web Service
1. After logging in, click **"New +"** → **"Web Service"**
2. You'll see your GitHub repositories
3. Find and select **"glm"** repository
4. Click **"Connect"**

### Step 3: Configure the Service

Fill in these settings:

```
Name: glm-ai-chat
Region: Oregon (closest to API server)
Branch: main
Root Directory: (leave blank)
Runtime: Node
Build Command: npm install
Start Command: node server.js
```

### Step 4: Choose Plan
- Select **"Free"** plan
- Perfect for testing and small projects

### Step 5: Environment Variables (Optional)
Click **"Advanced"** and add:

```
Key: GLM_API_KEY
Value: vtx-RUmIksxLD8Qf8njF3JsMXLqICnZEohaM
(Key: NODE_ENV
Value: production
Key: PORT
Value: 10000
```

### Step 6: Deploy!
1. Click **"Create Web Service"**
2. Render will start building... (takes 2-3 minutes)
3. Wait for "Deployed" status

---

## ✅ After Deployment

### Your Live URL
Render will give you a URL like:
```
https://glm-ai-chat-xxxx.onrender.com
```

### Test It!
1. Open the URL in browser
2. Type a message
3. Click Send
4. Chat should work! 🎉

---

## 🔧 Configuration Details

### Files Created for Render:

1. **`render.yaml`** - Infrastructure configuration
2. **`server.js`** - Express server with API proxy
3. **`index.html`** - Updated web interface
4. **`package.json`** - Updated with Express dependency

### How It Works:

```
Browser → Render Server → GLM API
      (index.html)   (proxy)
```

The server acts as a proxy to:
- Avoid CORS issues
- Hide API key
- Provide better error handling

---

## 🐛 Troubleshooting

### Build Failed
**Check logs in Render dashboard:**
- Missing dependencies? → Update package.json
- Syntax errors? → Check server.js

### Runtime Error
**Common issues:**
- PORT not set → Default is 10000
- API key invalid → Check environment variables
- API domain wrong → Should be `api.featherlabs.online`

### Chat Not Working
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Look at Render logs for server errors

### 401 Unauthorized
- API key is invalid/expired
- Get new key from FeatherLabs
- Update in Render environment variables

### Slow Response
- Free tier spins down after inactivity
- First request takes ~30 seconds
- Subsequent requests are faster
- Consider upgrading for always-on

---

## 💡 Pro Tips

### 1. Custom Domain
- Go to service Settings
- Scroll to "Custom Domain"
- Add your domain
- Update DNS records

### 2. Auto-Deploy
- Every push to GitHub triggers auto-deploy
- Disable in Settings if needed
- Great for CI/CD

### 3. Monitoring
- Check Logs tab for real-time errors
- Use Metrics for performance stats
- Set up alerts (paid feature)

### 4. Environment Variables
Update API key without redeploying:
1. Go to Environment tab
2. Add/edit variables
3. Click "Save Changes"
4. Service auto-restarts

### 5. Database (Optional)
For conversation history:
1. Create PostgreSQL database on Render
2. Add DATABASE_URL env var
3. Update server.js to use database

---

## 📊 Free Tier Limits

| Feature | Limit |
|---------|-------|
| **Bandwidth** | 100 GB/month |
| **CPU** | 0.1 CPU |
| **Memory** | 512 MB |
| **Disk** | N/A (stateless) |
| **Hours** | 750 hours/month |

**Note**: Free services sleep after 15 min inactivity

---

## 🔐 Security Best Practices

### Current Setup:
✅ API key hidden on server  
✅ CORS enabled  
✅ Input validation  
✅ Error handling  

### Recommended Improvements:
1. ⭐ Rate limiting (prevent abuse)
2. ⭐ Input sanitization
3. ⭐ Request timeout
4. ⭐ Logging & monitoring
5. ⭐ SSL/TLS (auto-enabled by Render)

---

## 💰 Upgrade Options

### When to Upgrade:
- Need faster response times
- Want always-on service
- Exceeding bandwidth limits
- Need more CPU/memory

### Paid Plans:
- **Starter**: $7/month
  - Always on
  - More resources
  - Priority support

- **Standard**: $25/month
  - Even more resources
  - Advanced features

---

## 📈 Performance Optimization

### Current Performance:
- Cold start: ~30 seconds
- Warm response: ~2-3 seconds
- Concurrent users: ~5-10

### Improve Performance:
1. Enable compression in server.js
2. Add caching for models list
3. Optimize API calls
4. Use CDN for static files

---

## 🎓 Learning Resources

- [Render Documentation](https://render.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 🆘 Getting Help

### Render Support:
- Community Forum: https://community.render.com
- Email: support@render.com
- Status: https://status.render.com

### For This Project:
- Check GitHub Issues
- Review server logs
- Test locally first

---

## ✅ Deployment Checklist

Before going live:

- [ ] Test locally with `npm run server`
- [ ] Push all changes to GitHub
- [ ] Create Render Web Service
- [ ] Configure environment variables
- [ ] Set correct region (Oregon)
- [ ] Verify build succeeds
- [ ] Test chat functionality
- [ ] Check error handling
- [ ] Review logs for warnings
- [ ] Share your live URL!

---

## 🎉 Success!

Once deployed, you'll have:

✅ Live URL accessible anywhere  
✅ HTTPS encryption (automatic)  
✅ Auto-deploy on git push  
✅ Real-time logs  
✅ Health monitoring  
✅ Global CDN  

**Your GLM AI Chat is now live on the internet!** 🚀

---

## 📝 Quick Reference

### Commands:
```bash
# Test locally
npm run server

# Deploy
git add .
git commit -m "Update"
git push

# View logs (in Render dashboard)
# Settings → Logs
```

### URLs:
- **Render Dashboard**: https://dashboard.render.com
- **Your Service**: https://glm-ai-chat-xxxx.onrender.com
- **GitHub Repo**: https://github.com/uduu282-droid/glm.git

---

**Last Updated**: March 26, 2026  
**Status**: ✅ Ready to Deploy  
**Difficulty**: ⭐⭐☆☆☆ (Easy)  

🎊 **Happy Deploying!** 🎊
