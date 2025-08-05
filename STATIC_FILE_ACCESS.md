# 🖼️ Static File Access Guide

This guide explains how to test and use the static file serving functionality in your Khabeer backend.

## ✅ What's Configured

Your backend now has enhanced static file serving with:

- **Uploads Directory**: Files served from `/uploads/` URL prefix
- **Public Directory**: Test files served from root URL
- **CORS Headers**: Proper cross-origin access
- **Cache Headers**: Optimized caching for images
- **Global Prefix Exclusion**: `/uploads` excluded from API prefix

## 🧪 Testing Static File Access

### 1. Start Your Backend Server

```bash
cd khabeer-backend
npm run start:dev
```

### 2. Test with Node.js Script

```bash
node test-static.js
```

This will test:

- Server health
- Available images in uploads directory
- Direct image access
- Browser-like requests

### 3. Test in Browser

Open your browser and go to:

```
http://localhost:3001/test-images.html
```

This will show a visual test of all your images with loading status.

### 4. Direct Image URLs

You can access any image directly via:

```
http://localhost:3001/uploads/[filename]
```

**Examples:**

- `http://localhost:3001/uploads/1754252654623-779371817.png`
- `http://localhost:3001/uploads/1754252594401-804470253.png`

## 📁 Current Images Available

Your uploads directory contains these images:

- `1754252654623-779371817.png` (2.4MB)
- `1754252594401-804470253.png` (2.4MB)
- `1754235594963-463636795.png` (2.9MB)
- `1754235541737-681823104.png` (2.4MB)
- `1754235062242-276692221.png` (2.4MB)
- `1754235061206-792022907.png` (2.4MB)
- `1754234787168-351214059.png` (2.9MB)
- `1754234785341-217718138.png` (2.9MB)

## 🔧 Configuration Details

### Static File Serving Setup

```typescript
// Serve static files from uploads directory
app.useStaticAssets(uploadsPath, {
  prefix: '/uploads/',
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
  },
});
```

### Global Prefix Exclusion

```typescript
app.setGlobalPrefix('api', {
  exclude: ['/health', '/docs', '/uploads'],
});
```

## 🎯 Frontend Integration

### HTML

```html
<img
  src="http://localhost:3001/uploads/1754252654623-779371817.png"
  alt="Service Image"
/>
```

### React/Next.js

```jsx
<img
  src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/1754252654623-779371817.png`}
  alt="Service Image"
/>
```

### JavaScript

```javascript
const imageUrl = 'http://localhost:3001/uploads/1754252654623-779371817.png';
const img = new Image();
img.src = imageUrl;
```

## 🔍 Troubleshooting

### Images Not Loading

1. **Check server is running**: `curl http://localhost:3001/health`
2. **Verify file exists**: Check `uploads/` directory
3. **Test direct access**: Try the URL in browser
4. **Check CORS**: Ensure frontend domain is allowed

### Common Issues

- **404 Error**: File doesn't exist in uploads directory
- **CORS Error**: Frontend domain not in CORS_ORIGIN
- **Server not running**: Start with `npm run start:dev`

## 📊 Expected Results

When working correctly, you should see:

- ✅ All images load in browser test page
- ✅ Direct URLs return images with proper headers
- ✅ CORS headers present in response
- ✅ Cache headers configured
- ✅ No authentication required for image access

## 🚀 Next Steps

1. **Test the setup**: Run `node test-static.js`
2. **View in browser**: Open `http://localhost:3000/test-images.html`
3. **Integrate with frontend**: Use the image URLs in your app
4. **Upload new images**: Use the file upload API endpoints

---

**Status**: ✅ Static file serving is configured and ready to use!
