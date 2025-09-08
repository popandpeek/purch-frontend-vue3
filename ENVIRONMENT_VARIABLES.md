# Environment Variables Reference

## Required Environment Variables for Firebase Authentication

Add these to your `.env` file in the root of the frontend project:

```env
# API Configuration
VUE_APP_API_URL=http://0.0.0.0:8085/

# Firebase Configuration
VUE_APP_FIREBASE_API_KEY=AIzaSyCM7wer3S87OKzZx_tOxNQILBb1XJ6fsvU
VUE_APP_FIREBASE_AUTH_DOMAIN=purch-b5e4b.firebaseapp.com
VUE_APP_FIREBASE_PROJECT_ID=purch-b5e4b
VUE_APP_FIREBASE_STORAGE_BUCKET=purch-b5e4b.firebasestorage.app
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=554502908624
VUE_APP_FIREBASE_APP_ID=1:554502908624:web:4346e28647de29ecafccd5
```

## Current Status

- ✅ Firebase config is currently using `config-secure.js` file
- ⚠️ API URL is hardcoded in `src/http-common.ts` as `http://0.0.0.0:8085/`
- ✅ `src/http-common.ts` now uses `VUE_APP_API_URL` directly

## Files That Need Environment Variable Updates

1. **src/http-common.ts** - Currently hardcoded API URL
2. **src/firebase.js** - Currently using config-secure.js (can keep as is or switch to .env)

## Next Steps

1. Create `.env` file with the variables above
2. ✅ `src/http-common.ts` now uses `VUE_APP_API_URL` directly
3. Optionally update `src/firebase.js` to use environment variables instead of config-secure.js
