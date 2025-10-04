# Bulk Creation Endpoints

## Categories Bulk Creation

### POST `/categories/bulk`

Create categories for multiple states at once.

**Authentication:** Required (ADMIN only)  
**Content-Type:** `multipart/form-data`

#### Request Body

```json
{
  "titleAr": "خدمة الصيانة",
  "titleEn": "Maintenance Service",
  "states": ["Muscat", "Salalah", "Sohar"]
}
```

#### Form Data

- `image` (optional): Image file for the category

#### Response

```json
[
  {
    "id": 1,
    "titleAr": "خدمة الصيانة",
    "titleEn": "Maintenance Service",
    "state": "Muscat",
    "image": "https://example.com/image1.jpg"
  },
  {
    "id": 2,
    "titleAr": "خدمة الصيانة",
    "titleEn": "Maintenance Service",
    "state": "Salalah",
    "image": "https://example.com/image1.jpg"
  },
  {
    "id": 3,
    "titleAr": "خدمة الصيانة",
    "titleEn": "Maintenance Service",
    "state": "Sohar",
    "image": "https://example.com/image1.jpg"
  }
]
```

---

## Services Bulk Creation

### POST `/services/bulk`

Create services for multiple categories at once.

**Authentication:** Required (ADMIN only)  
**Content-Type:** `multipart/form-data`

#### Request Body

```json
{
  "titleAr": "خدمة الصيانة",
  "titleEn": "Maintenance Service",
  "description": "Professional maintenance services",
  "commission": 10,
  "serviceType": "NORMAL",
  "categoryIds": ["1", "2", "3"]
}
```

#### Form Data

- `image` (optional): Image file for the service

#### Response

```json
[
  {
    "id": 1,
    "titleAr": "خدمة الصيانة",
    "titleEn": "Maintenance Service",
    "description": "Professional maintenance services",
    "commission": 10,
    "serviceType": "NORMAL",
    "image": "https://example.com/image1.jpg",
    "category": {
      "id": 1,
      "titleAr": "Category 1",
      "titleEn": "Category 1",
      "state": "Muscat"
    }
  },
  {
    "id": 2,
    "titleAr": "خدمة الصيانة",
    "titleEn": "Maintenance Service",
    "description": "Professional maintenance services",
    "commission": 10,
    "serviceType": "NORMAL",
    "image": "https://example.com/image1.jpg",
    "category": {
      "id": 2,
      "titleAr": "Category 2",
      "titleEn": "Category 2",
      "state": "Salalah"
    }
  }
]
```

---

## Notes

- Both endpoints require ADMIN role
- All fields except `image` are required
- `states` array must contain valid Omani state names
- `categoryIds` array must contain valid category IDs (can be strings or numbers)
- If image is provided, it will be used for all created items
- All operations are atomic (all succeed or all fail)
