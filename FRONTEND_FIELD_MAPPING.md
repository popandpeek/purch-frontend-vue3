# Frontend Field Mapping for Backend Integration

## Overview
This document outlines how the frontend expects data from the backend API and how fields are mapped for display purposes.

## Field Structure

### Core Item Fields
All items should have these two separate fields:
- **`measure`**: Numeric value (string format) - e.g., "5", "2.5", "10"
- **`unit`**: Unit of measurement (string) - e.g., "lb", "kg", "each", "gallon"

### Why Separate Fields?
1. **Calculations**: Frontend can perform math operations on `measure` values
2. **Display Flexibility**: Can show units independently ("per lb", "5x2 / kg")
3. **Data Integrity**: Prevents parsing errors from concatenated strings
4. **Type Safety**: Clear data structure for validation

## API Response Structure

### House Items
```json
{
  "id": 1,
  "name": "Ground Beef",
  "measure": "5",
  "unit": "lb",
  "cur_price": "12.99",
  "active": true
}
```

### Vendor Items
```json
{
  "id": 1,
  "product_name": "Organic Ground Beef",
  "measure": "2.5",
  "unit": "kg",
  "latest_price": "15.99",
  "pack_size": 2,
  "pack_number": 5
}
```

### Order Items (House/Vendor)
```json
{
  "id": 1,
  "quantity": "3",
  "measure": "5",
  "unit": "lb",
  "price": "12.99"
}
```

## Frontend Display Logic

### Product Lists
- **House Items**: "Price: $12.99 per lb" (uses `unit`)
- **Vendor Items**: "5x2 / lb" (uses `unit`)

### Order/Inventory Items
- **Order Items**: Shows unit only ("lb", "kg")
- **Inventory Items**: Shows unit only ("lb", "kg")

### Detail Pages
- **Vendor Item Detail**: "2 / 5lb" (uses `unit`)

## Field Usage Summary

| Component | Field Used | Purpose |
|-----------|------------|---------|
| HouseProductItem | `item.unit` | Display "per lb" |
| VendorProductItem | `item.unit` | Display "5x2 / lb" |
| Order List Items | `item.unit` | Display unit only |
| Inventory Items | `item.unit` | Display unit only |
| Detail Pages | `item.unit` | Display unit in descriptions |

## Backend Requirements

1. **All item types** must return separate `measure` and `unit` fields
2. **No concatenated strings** like "5 lb" in a single field
3. **Consistent field names** across all endpoints
4. **String format** for both fields (even numeric values)

## PUT Request Format

When updating items, frontend sends:
```json
{
  "price": "12.99",
  "measure": "5",
  "unit": "lb",
  "quantity": "3"
}
```

## Migration Notes

- **Old field**: `measure_unit` (concatenated string)
- **New fields**: `measure` + `unit` (separate fields)
- **Frontend**: Updated to use `item.unit` for all displays
- **Backend**: Should return both fields in all item responses
