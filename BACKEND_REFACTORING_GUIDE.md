# Backend Refactoring Guide for Firebase Authentication

## Overview
This document outlines the changes needed in your FastAPI backend to work with the Vue 3 frontend that uses Firebase authentication.

## Prerequisites
- FastAPI backend running on `http://localhost:8000`
- Vue 3 frontend running on `http://localhost:8081`
- Firebase project with authentication enabled

---

## 1. Install Required Dependencies

Add these packages to your FastAPI backend `requirements.txt`:

```txt
firebase-admin>=6.0.0
python-multipart>=0.0.5
```

Install with:
```bash
pip install firebase-admin python-multipart
```

---

## 2. Download Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`purch-b5e4b`)
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file
6. Save it as `firebase-service-account-key.json` in your backend root directory

**⚠️ Security Note**: Add this file to your `.gitignore` to prevent committing secrets.

---

## 3. Update main.py

Replace your current `main.py` with this configuration:

```python
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth
import os
from typing import Optional

# Initialize FastAPI app
app = FastAPI(
    title="PURCH API",
    description="Purchasing Management System API",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",  # Current frontend port
        "http://localhost:5173",  # Vite default port
        "http://localhost:3000",  # Alternative port
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize Firebase Admin SDK
def initialize_firebase():
    try:
        # Check if Firebase is already initialized
        if not firebase_admin._apps:
            cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-service-account-key.json")
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin SDK initialized successfully")
    except Exception as e:
        print(f"❌ Firebase initialization failed: {e}")
        raise

# Initialize Firebase on startup
initialize_firebase()

# Security scheme
security = HTTPBearer()

# Firebase token verification dependency
async def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify Firebase ID token from Authorization header
    """
    try:
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(credentials.credentials)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=401, 
            detail="Invalid authentication credentials"
        )

# Optional dependency for routes that don't require auth
async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """
    Optional Firebase token verification - returns None if no token provided
    """
    if not credentials:
        return None
    
    try:
        decoded_token = auth.verify_id_token(credentials.credentials)
        return decoded_token
    except Exception:
        return None

# Health check endpoint (no auth required)
@app.get("/")
async def root():
    return {"message": "PURCH API is running", "status": "healthy"}

# Health check for API
@app.get("/api/v1/health")
async def health_check():
    return {"message": "API is healthy", "status": "ok"}

# Your existing routes with authentication
@app.get("/api/v1/house-orders/")
async def get_house_orders(current_user = Depends(verify_firebase_token)):
    # Your existing logic here
    return {"message": "House orders endpoint", "user": current_user.get("uid")}

@app.get("/api/v1/vendors/")
async def get_vendors(current_user = Depends(verify_firebase_token)):
    # Your existing logic here
    return {"message": "Vendors endpoint", "user": current_user.get("uid")}

@app.get("/api/v1/house-items/")
async def get_house_items(current_user = Depends(verify_firebase_token)):
    # Your existing logic here
    return {"message": "House items endpoint", "user": current_user.get("uid")}

@app.get("/api/v1/inventories/")
async def get_inventories(current_user = Depends(verify_firebase_token)):
    # Your existing logic here
    return {"message": "Inventories endpoint", "user": current_user.get("uid")}

# Add all your other protected routes here with the same pattern
# @app.get("/api/v1/your-endpoint/")
# async def your_endpoint(current_user = Depends(verify_firebase_token)):
#     # Your logic here
#     pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 4. Environment Variables

Create a `.env` file in your backend root directory:

```env
# Firebase Configuration
FIREBASE_CREDENTIALS_PATH=./firebase-service-account-key.json

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Database Configuration (if applicable)
DATABASE_URL=your_database_url_here
```

---

## 5. Update .gitignore

Add these lines to your backend `.gitignore`:

```gitignore
# Firebase credentials
firebase-service-account-key.json
*.json

# Environment variables
.env
.env.local
.env.production

# Python
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
```

---

## 6. Testing the Integration

### Start the Backend
```bash
cd your-backend-directory
python main.py
# or
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Test CORS
1. Open your frontend at `http://localhost:8081`
2. Open browser developer tools (F12)
3. Check the Network tab for API requests
4. Verify no CORS errors appear

### Test Authentication
1. Login to your frontend
2. Check that API requests include `Authorization: Bearer <firebase-token>` header
3. Verify backend logs show successful token verification

---

## 7. Common Issues and Solutions

### Issue: CORS Error
**Error**: `Access to XMLHttpRequest at 'http://localhost:8000/api/v1/...' has been blocked by CORS policy`

**Solution**: Ensure CORS middleware is properly configured with the correct frontend URL

### Issue: Firebase Token Verification Fails
**Error**: `Invalid authentication credentials`

**Solution**: 
1. Verify Firebase service account key is correct
2. Check that the token is being sent in the Authorization header
3. Ensure Firebase Admin SDK is properly initialized

### Issue: 401 Unauthorized
**Error**: `401 Unauthorized` on all protected routes

**Solution**:
1. Check that the frontend is sending the Firebase token
2. Verify the token format: `Bearer <token>`
3. Check backend logs for token verification errors

---

## 8. Development Workflow

1. **Start Backend**: `uvicorn main:app --reload`
2. **Start Frontend**: `npm run dev`
3. **Test Login**: Login to frontend and verify API calls work
4. **Check Logs**: Monitor both frontend console and backend logs

---

## 9. Production Considerations

For production deployment:

1. **Environment Variables**: Use proper environment variable management
2. **Firebase Credentials**: Store service account key securely (not in code)
3. **CORS Origins**: Update allowed origins to your production domain
4. **HTTPS**: Ensure all communication uses HTTPS
5. **Token Validation**: Consider implementing token refresh logic

---

## 10. API Documentation

After implementing these changes, your API documentation will be available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

The documentation will show all your endpoints with proper authentication requirements.

---

## Summary

This refactoring enables your FastAPI backend to:
- ✅ Accept requests from your Vue 3 frontend (CORS)
- ✅ Verify Firebase ID tokens for authentication
- ✅ Protect all API endpoints with Firebase authentication
- ✅ Provide proper error handling and logging
- ✅ Support development and production environments

After implementing these changes, your frontend should be able to successfully authenticate and make API calls to your backend.
