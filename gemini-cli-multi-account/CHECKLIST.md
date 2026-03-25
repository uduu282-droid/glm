# ✅ Gemini Multi-Account Setup Checklist

## 📋 Pre-Setup Checklist

Before you start adding accounts, make sure you have:

- [ ] **Node.js installed** (v16 or higher)
- [ ] **Cloudflare account** (free tier is fine)
- [ ] **Google accounts ready** (at least 10 for full capacity)
- [ ] **Wrangler CLI installed globally**: `npm install -g wrangler`

---

## 🚀 Setup Steps (Do These in Order)

### Step 1: Install Dependencies ✅
```bash
cd "c:\Users\Ronit\Downloads\test models 2\gemini-cli-multi-account"
npm install
```
- [ ] Dependencies installed successfully
- [ ] No errors in output

### Step 2: Cloudflare Login ✅
```bash
wrangler login
```
- [ ] Browser opens
- [ ] You log in to Cloudflare
- [ ] Authentication successful
- [ ] Back to terminal with success message

### Step 3: Create KV Namespace ✅
```bash
wrangler kv namespace create "GEMINI_TOKEN_CACHE"
```
- [ ] Command runs successfully
- [ ] You see output like: `Created namespace "GEMINI_TOKEN_CACHE" with id "xxxxxxxxxxxxxxxxx"`
- [ ] **IMPORTANT:** Copy the namespace ID!

### Step 4: Update wrangler.toml ✅
Edit `wrangler.toml` file and replace:
```toml
id = "YOUR_KV_NAMESPACE_ID_HERE"
```
With your actual namespace ID from Step 3.

- [ ] Opened `wrangler.toml`
- [ ] Replaced placeholder with actual ID
- [ ] Saved the file

---

## 🔐 Account Authentication (Repeat 10 Times)

### Add Account #1 ✅
```bash
npm run auth:add gemini1
```
Process:
1. [ ] Browser opens automatically
2. [ ] Sign in with Google account #1
3. [ ] Grant permissions to Gemini CLI
4. [ ] Get redirected to `localhost:8085/callback?code=...`
5. [ ] Copy the `code` parameter from URL
6. [ ] Paste code in terminal
7. [ ] See: "🎉 Authentication successful for account gemini1!"
8. [ ] Credentials saved to `.gemini/oauth_creds_gemini1.json`

### Add Account #2 ✅
```bash
npm run auth:add gemini2
```
- [ ] Repeat same process as Account #1
- [ ] Use different Google account if possible

### Add Accounts #3-10 ✅
```bash
npm run auth:add gemini3
npm run auth:add gemini4
npm run auth:add gemini5
npm run auth:add gemini6
npm run auth:add gemini7
npm run auth:add gemini8
npm run auth:add gemini9
npm run auth:add gemini10
```
- [ ] All 10 accounts authenticated
- [ ] Each has its own credentials file

### Verify All Accounts ✅
```bash
npm run auth:list
```
Expected output:
```
Found 10 account(s):

Account ID: gemini1
  Status: ✅ Valid
  Expires: [date/time]

Account ID: gemini2
  Status: ✅ Valid
  ...
  
Account ID: gemini10
  Status: ✅ Valid
```
- [ ] Shows 10 accounts
- [ ] All show "✅ Valid" status
- [ ] Each has expiry date in future

---

## ☁️ Deploy to Cloudflare KV

### Deploy All Accounts ✅
```bash
npm run setup:deploy-all
```
This uploads all 10 account credentials to Cloudflare KV storage.

Watch for:
- [ ] "Deploying all accounts to KV storage..."
- [ ] Lists all 10 accounts
- [ ] Executes wrangler commands for each
- [ ] "✅ Account geminiX deployed to KV storage" (×10)
- [ ] "🎉 All accounts deployed successfully!"

### Verify KV Deployment ✅
```bash
npm run setup:list-kv
```
Expected output:
```json
[
  { "name": "ACCOUNT:gemini1" },
  { "name": "ACCOUNT:gemini2" },
  ...
  { "name": "ACCOUNT:gemini10" }
]
```
- [ ] Shows all 10 accounts in KV
- [ ] No errors

### Health Check ✅
```bash
npm run setup:health
```
Expected output:
```
Total accounts: 10
Valid tokens: 10
Working accounts: 10
```
- [ ] All 10 accounts tested
- [ ] All show as working
- [ ] No errors or warnings

---

## 🔐 Configure Secrets

### Create .env File ✅
```bash
cp .env.example .env
```
- [ ] .env file created
- [ ] Open it in editor

### Edit .env ✅
Add your actual secrets:
```env
OPENAI_API_KEYS=sk-your-actual-secret-key-here
ADMIN_SECRET_KEY=your-admin-secret-here
```
- [ ] Replace `sk-your-actual-secret-key-here` with real key
- [ ] Replace `your-admin-secret-here` with real secret
- [ ] Save the file

### Update Cloudflare Secrets ✅
```bash
npm run secrets:update
```
Watch for:
- [ ] Lists variables to update
- [ ] "Updating OPENAI_API_KEYS..."
- [ ] "✅ OPENAI_API_KEYS updated successfully"
- [ ] "Updating ADMIN_SECRET_KEY..."
- [ ] "✅ ADMIN_SECRET_KEY updated successfully"
- [ ] "🎉 Secret update complete!"

### Verify Secrets ✅
```bash
npm run secrets:list
```
- [ ] Shows both secrets configured
- [ ] Values are masked (security)

---

## 🚀 Deploy Worker

### Deploy to Cloudflare ✅
```bash
npm run deploy
```
Watch for:
- [ ] "Total Upload: XX KB"
- [ ] "Worker Startup Time: XX ms"
- [ ] "Uploaded gemini-cli-multi-account"
- [ ] "Deployed gemini-cli-multi-account triggers"
- [ ] Shows your worker URL: `https://gemini-cli-multi-account.yourname.workers.dev`

**IMPORTANT:** Copy your worker URL!

---

## ✅ Testing Phase

### Test Health Endpoint ✅
```bash
curl https://gemini-cli-multi-account.yourname.workers.dev/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-06T...",
  "service": "gemini-cli-multi-account-proxy"
}
```
- [ ] Returns JSON
- [ ] Status is "ok"
- [ ] No errors

### Test Models Endpoint ✅
```bash
curl https://gemini-cli-multi-account.yourname.workers.dev/v1/models
```
Expected response:
```json
{
  "object": "list",
  "data": [
    {
      "id": "gemini-2.5-pro",
      "name": "Gemini 2.5 Pro",
      ...
    },
    {
      "id": "gemini-2.5-flash",
      "name": "Gemini 2.5 Flash",
      ...
    }
  ]
}
```
- [ ] Lists both models
- [ ] Response format correct

### Test Chat Completion ✅
```bash
curl -X POST https://gemini-cli-multi-account.yourname.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-pro",
    "messages": [{"role": "user", "content": "Say hello in one word"}]
  }'
```
Expected response:
```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Hello!"
    }
  }],
  "usage": {...}
}
```
- [ ] Returns a response
- [ ] Has content in choices
- [ ] Usage statistics included
- [ ] No errors

---

## 🎯 Final Verification

### Capacity Check ✅
- [ ] 10 accounts configured
- [ ] All accounts healthy
- [ ] Total capacity: 10,000 req/day
- [ ] Ready for production use

### Documentation Review ✅
Read these files:
- [ ] [`QUICKSTART.md`](./QUICKSTART.md) - Quick reference
- [ ] [`README.md`](./README.md) - Full documentation
- [ ] [`COMPLETE_SUMMARY.md`](./COMPLETE_SUMMARY.md) - System overview

### Integration Test ✅
Test with your actual application:
- [ ] Update app's base_url to your worker URL
- [ ] Set api_key to your OPENAI_API_KEYS value
- [ ] Send test request
- [ ] Receive valid response
- [ ] Works as expected

---

## 📊 Monitoring Dashboard

### Daily Checks (First Week)
```bash
npm run setup:health
```
- [ ] Day 1: All 10 accounts healthy ✅
- [ ] Day 2: All 10 accounts healthy ✅
- [ ] Day 3: All 10 accounts healthy ✅
- [ ] Day 4: All 10 accounts healthy ✅
- [ ] Day 5: All 10 accounts healthy ✅
- [ ] Day 6: All 10 accounts healthy ✅
- [ ] Day 7: All 10 accounts healthy ✅

### Weekly Checks (Ongoing)
- [ ] Week 1: System stable
- [ ] Week 2: No issues
- [ ] Week 3: Running smoothly
- [ ] Week 4: Fully automated ✅

---

## 🎉 Success Criteria Met!

When all these are true, you're done:

- [ ] ✅ 10 accounts authenticated
- [ ] ✅ 10 accounts deployed to KV
- [ ] ✅ Worker deployed successfully
- [ ] ✅ Health checks passing
- [ ] ✅ Test requests working
- [ ] ✅ Application integrated
- [ ] ✅ Monitoring stable for 1 week
- [ ] ✅ Zero maintenance required

**CONGRATULATIONS!** 🎊

You now have a fully automated, production-ready AI proxy system with:
- **10,000 requests/day capacity**
- **Zero monthly cost**
- **Fully autonomous operation**
- **OpenAI-compatible API**
- **Global Cloudflare deployment**

---

## 🆘 Troubleshooting Common Issues

### Issue: "No accounts found"
**Solution:**
```bash
npm run auth:add gemini1  # Add accounts first
npm run setup:deploy-all  # Then deploy
```

### Issue: "KV namespace not found"
**Solution:**
```bash
# Create namespace
wrangler kv namespace create "GEMINI_TOKEN_CACHE"

# Update wrangler.toml with the ID
# Redeploy
npm run deploy
```

### Issue: "Invalid OAuth code"
**Solution:**
```bash
# Just retry
npm run auth:add gemini1
# Make sure to copy the FULL code from URL
```

### Issue: "Secret not found"
**Solution:**
```bash
# Make sure .env exists
cp .env.example .env

# Edit .env with real values
# Update secrets
npm run secrets:update
```

---

## 📞 Need Help?

If you get stuck:

1. **Check the docs:**
   - [`QUICKSTART.md`](./QUICKSTART.md)
   - [`README.md`](./README.md)
   - [`COMPLETE_SUMMARY.md`](./COMPLETE_SUMMARY.md)

2. **Review error messages carefully**
   - Most issues are obvious from the error text

3. **Try the command again**
   - Many issues are temporary (network, timeouts)

4. **Check Cloudflare dashboard**
   - Worker logs
   - KV storage
   - Secret configuration

---

**Ready to start?** Begin with Step 1 now! 🚀

```bash
npm install
```

Your path to **10,000 free AI requests per day** awaits! ✨
