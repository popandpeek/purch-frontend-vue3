# Frontend Migration Guide for FastAPI Backend

## 🔄 **API Endpoint Changes**

### **Base URL Change**
- **Old Flask Backend**: `http://localhost:8085`
- **New FastAPI Backend**: `http://localhost:8000`

### **Endpoint Path Changes**

| Frontend Store | Old Endpoint | New FastAPI Endpoint |
|----------------|--------------|---------------------|
| `house-items.ts` | `GET /house_items/` | `GET /api/v1/house-items/` |
| `house-orders.ts` | `GET /house_orders/` | `GET /api/v1/house-orders/` |
| `vendors.ts` | `GET /vendors/` | `GET /api/v1/vendors/` |
| `inventories.ts` | `GET /inventory/` | `GET /api/v1/inventories/` |

## 🔐 **Authentication Changes**

### **Old System (Firebase)**
```typescript
// Old Firebase authentication
import { signInWithEmailAndPassword } from 'firebase/auth'
const user = await signInWithEmailAndPassword(auth, email, password)
```

### **New System (JWT)**
```typescript
// New JWT authentication
const response = await fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    username: email,
    password: password
  })
})
const { access_token } = await response.json()
```

## 📝 **Required Frontend Updates**

### 1. **Update API Base URL**
In your frontend configuration, change:
```typescript
// Old
const API_BASE_URL = 'http://localhost:8085'

// New
const API_BASE_URL = 'http://localhost:8000/api/v1'
```

### 2. **Update Store Files**

#### **house-items.ts**
```typescript
// Change from:
const response = await axios.get(`${API_BASE_URL}/house_items/`)

// To:
const response = await axios.get(`${API_BASE_URL}/house-items/`)
```

#### **vendors.ts**
```typescript
// Change from:
const response = await axios.get(`${API_BASE_URL}/vendors/`)

// To:
const response = await axios.get(`${API_BASE_URL}/vendors/`)
```

### 3. **Add JWT Authentication Headers**
For all authenticated requests, add the JWT token:
```typescript
const token = localStorage.getItem('access_token')
const response = await axios.get(`${API_BASE_URL}/house-items/`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### 4. **Update Authentication Service**
Replace Firebase auth with JWT auth:
```typescript
// auth.service.ts
export const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username: email,
      password: password
    })
  })
  
  if (!response.ok) {
    throw new Error('Login failed')
  }
  
  const data = await response.json()
  localStorage.setItem('access_token', data.access_token)
  localStorage.setItem('refresh_token', data.refresh_token)
  return data
}
```

## 🚀 **Quick Start**

1. **Update your frontend API configuration** to point to `http://localhost:8000/api/v1`
2. **Replace Firebase authentication** with JWT authentication
3. **Update all store files** to use the new endpoint paths
4. **Add JWT token headers** to all authenticated requests

## 📋 **Available FastAPI Endpoints**

### **Authentication**
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

### **Vendors**
- `GET /api/v1/vendors/` - List all vendors
- `POST /api/v1/vendors/` - Create vendor
- `GET /api/v1/vendors/{id}` - Get vendor by ID
- `PUT /api/v1/vendors/{id}` - Update vendor
- `DELETE /api/v1/vendors/{id}` - Delete vendor

### **House Items**
- `GET /api/v1/house-items/` - List all house items
- `GET /api/v1/house-items/order-items` - List active house items for ordering
- `POST /api/v1/house-items/` - Create house item
- `GET /api/v1/house-items/{id}` - Get house item by ID
- `PUT /api/v1/house-items/{id}` - Update house item
- `DELETE /api/v1/house-items/{id}` - Delete house item
- `PUT /api/v1/house-items/{id}/set-default-vendor` - Set default vendor item

### **Vendor Items**
- `GET /api/v1/vendor-items/` - List all vendor items
- `GET /api/v1/vendor-items/vendor/{vendor_id}` - Get vendor items by vendor
- `POST /api/v1/vendor-items/` - Create vendor item
- `GET /api/v1/vendor-items/{id}` - Get vendor item by ID
- `PUT /api/v1/vendor-items/{id}` - Update vendor item
- `PUT /api/v1/vendor-items/{id}/price` - Update vendor item price
- `DELETE /api/v1/vendor-items/{id}` - Delete vendor item

## 🔧 **Testing the New API**

You can test the new API using the interactive documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## ⚠️ **Important Notes**

1. **All endpoints require authentication** except login/register
2. **Use JWT tokens** instead of Firebase tokens
3. **Include Authorization header** in all requests: `Bearer <token>`
4. **New endpoint paths** use kebab-case instead of snake_case
5. **Response format** is consistent JSON with proper HTTP status codes
