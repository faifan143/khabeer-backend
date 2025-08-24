# Offers Debugging Guide

## Issue Description

A provider has an offer, but it's not visible to users in the "Get Active Offers" endpoint (`/offers/active`).

## Root Cause Analysis

The `getActiveOffers` method in `OffersService` has very strict filtering criteria that might be excluding valid offers:

### Current Filtering Criteria

1. **`isActive: true`** - The offer must be marked as active
2. **`startDate: { lte: new Date() }`** - The offer start date must be in the past or today
3. **`endDate: { gt: new Date() }`** - The offer end date must be in the future
4. **`provider.isVerified: true`** - The provider must be verified
5. **`provider.isActive: true`** - The provider must be active

### Potential Issues

- **Provider Verification**: Provider might not be verified (`isVerified: false`)
- **Provider Status**: Provider account might be inactive (`isActive: false`)
- **Date Filtering**: Timezone issues or date comparison problems
- **Offer Status**: Offer might be marked as inactive

## Debugging Endpoints Added

### 1. Debug All Offers (`/offers/debug/all`)

- Shows all offers with detailed filtering information
- Requires ADMIN role
- Helps identify which offers exist and their current status

### 2. Debug Active Offers Criteria (`/offers/debug/active-criteria`)

- Shows offers that fail each filtering criteria
- Requires ADMIN role
- Helps identify the specific reason offers are being filtered out

### 3. Debug Specific Offer (`/offers/debug/offer/:id`)

- Debug a specific offer by ID
- Requires ADMIN role
- Shows detailed information about why an offer might not be visible

### 4. Flexible Active Offers (`/offers/debug/flexible`)

- Shows offers with less strict filtering (ADMIN only)
- Only checks if offer is active and not expired
- Helps identify if the issue is with provider verification/status

### 5. Available Offers (`/offers/available`)

- Public endpoint with less strict filtering
- Shows offers that are active and not expired
- Still requires verified providers for safety

## How to Debug

### Step 1: Check Console Logs

The `getActiveOffers` method now includes detailed console logging:

- Total offers in database
- All offers with their status
- Filtered results
- Date comparisons

### Step 2: Use Debug Endpoints

1. **Check all offers**: `GET /offers/debug/all`
2. **Check filtering criteria**: `GET /offers/debug/active-criteria`
3. **Check specific offer**: `GET /offers/debug/offer/{offerId}`

### Step 3: Compare Endpoints

1. **Strict filtering**: `GET /offers/active` (original behavior)
2. **Less strict**: `GET /offers/available` (new public endpoint)
3. **Very flexible**: `GET /offers/debug/flexible` (ADMIN only)

## Common Issues and Solutions

### Issue 1: Provider Not Verified

**Symptoms**: Offer exists but provider `isVerified: false`
**Solution**: Admin needs to approve provider verification

### Issue 2: Provider Account Inactive

**Symptoms**: Offer exists but provider `isActive: false`
**Solution**: Provider needs to activate their account or admin needs to activate it

### Issue 3: Date Filtering Issues

**Symptoms**: Offer dates look correct but still not showing
**Solution**: Check for timezone issues or use the new `/offers/available` endpoint

### Issue 4: Offer Marked Inactive

**Symptoms**: Offer `isActive: false`
**Solution**: Check if offer was manually deactivated or expired

## Recommended Actions

### For Immediate Fix

1. Use the new `/offers/available` endpoint for users (less strict filtering)
2. Keep the original `/offers/active` endpoint for strict filtering when needed

### For Long-term Solution

1. Review the filtering criteria based on business requirements
2. Consider adding configuration options for different filtering levels
3. Implement proper timezone handling if needed
4. Add monitoring for offers that fail filtering criteria

## Testing the Fix

### Test 1: Check Debug Endpoints

```bash
# Check all offers
GET /offers/debug/all

# Check specific offer (replace {id} with actual offer ID)
GET /offers/debug/offer/{id}

# Check filtering criteria
GET /offers/debug/active-criteria
```

### Test 2: Compare Endpoints

```bash
# Original strict filtering
GET /offers/active

# New less strict filtering
GET /offers/available

# Very flexible (ADMIN only)
GET /offers/debug/flexible
```

### Test 3: Check Console Logs

Look for the detailed logging in your application console when calling these endpoints.

## Files Modified

- `src/offers/offers.service.ts` - Added debugging methods and improved logging
- `src/offers/offers.controller.ts` - Added new debug endpoints
- `OFFERS_DEBUGGING_GUIDE.md` - This documentation file

## Next Steps

1. Test the new debug endpoints to identify the specific issue
2. Use the `/offers/available` endpoint for users if the strict filtering is too restrictive
3. Review business requirements for offer filtering
4. Consider implementing configurable filtering levels
