# Backend Vendor Selection Implementation Guide

## Overview
The frontend vendor selection functionality is currently failing with 404 errors because the required backend API endpoints are not implemented. This document outlines the complete implementation requirements for the backend team, aligned with the existing FastAPI architecture and patterns.

## Critical Note: No Silent Fallbacks
**IMPORTANT**: The frontend has been temporarily configured to handle 404 errors gracefully, but this is NOT the desired behavior. The backend team must implement these endpoints to ensure proper functionality. The frontend fallbacks should be removed once the backend is complete.

## Existing Architecture Context
Based on the current backend structure:
- **Framework**: FastAPI with SQLAlchemy ORM
- **Authentication**: Firebase-based user management
- **Database**: SQLite (development) with existing models
- **API Pattern**: `/api/v1/` prefix with dependency injection
- **Existing Models**: HouseOrder, HouseOrderItem, VendorOrder, VendorOrderBreakdown, VendorItem, Vendor, Settings
- **Existing Service**: OrderConversionService with VendorSelectionConfig

## Required API Endpoints

### 1. Get Vendor Selections for Order
**Endpoint**: `GET /api/v1/house-orders/{order_id}/vendor-selections`

**Purpose**: Retrieve all vendor selections for a specific house order

**Implementation Location**: Add to `app/api/v1/house_orders.py`

**Request**:
- Path parameter: `order_id` (integer)
- Authentication: Required (Firebase token)

**Response**:
```json
[
  {
    "vendor_item": {
      "id": 1,
      "vendor_id": 2,
      "house_item_id": 5,
      "product_name": "Organic Spinach",
      "brand": "Fresh Farms",
      "sku": "FF-SPIN-001",
      "price_per_case": "24.99",
      "case_size": 12,
      "pack_size": 1,
      "pack_unit": "bunch",
      "is_available": true,
      "vendor_name": "Fresh Farms Co."
    },
    "selection_reason": {
      "strategy": "lowest_price",
      "reason": "Selected for lowest cost per unit",
      "confidence_score": 0.95
    },
    "cost_savings": 15.50,
    "alternatives": [
      {
        "vendor_item": { /* alternative vendor item */ },
        "selection_reason": { /* why not selected */ },
        "cost_difference": 2.30
      }
    ]
  }
]
```

### 2. Override Vendor Selection
**Endpoint**: `POST /api/v1/house-orders/items/{order_item_id}/override-vendor-selection`

**Purpose**: Override the automatic vendor selection for a specific order item

**Implementation Location**: Add to `app/api/v1/house_order_items.py` (create if doesn't exist)

**Request**:
- Path parameter: `order_item_id` (integer)
- Authentication: Required (Firebase token)
- Body:
```json
{
  "vendor_item_id": 15
}
```

**Response**:
```json
{
  "success": true,
  "message": "Vendor selection overridden successfully",
  "new_selection": {
    "vendor_item": { /* new selected vendor item */ },
    "selection_reason": {
      "strategy": "manual_override",
      "reason": "Manually overridden by user",
      "confidence_score": 1.0
    }
  }
}
```

### 3. Get Configuration Inheritance
**Endpoint**: `GET /api/v1/house-orders/items/{order_item_id}/config-inheritance`

**Purpose**: Get the hierarchical configuration inheritance for vendor selection

**Implementation Location**: Add to `app/api/v1/house_order_items.py`

**Request**:
- Path parameter: `order_item_id` (integer)
- Authentication: Required (Firebase token)

**Response**:
```json
{
  "system_config": {
    "strategy": "lowest_price",
    "min_order_threshold": 0,
    "delivery_priority": false,
    "quality_preference": "standard",
    "organic_preference": 0.0,
    "preferred_vendor_ids": [],
    "brand_preference": "",
    "max_price_multiplier": 2.0
  },
  "order_config": {
    "strategy": "best_value",
    "min_order_threshold": 50,
    "delivery_priority": true,
    "quality_preference": "premium",
    "organic_preference": 0.8,
    "preferred_vendor_ids": [1, 3],
    "brand_preference": "Organic",
    "max_price_multiplier": 1.5
  },
  "item_config": null,
  "order_item_config": {
    "strategy": "preferred_vendor",
    "min_order_threshold": 0,
    "delivery_priority": false,
    "quality_preference": "premium",
    "organic_preference": 1.0,
    "preferred_vendor_ids": [2],
    "brand_preference": "Local Organic",
    "max_price_multiplier": 1.2
  },
  "resolved_config": {
    "strategy": "preferred_vendor",
    "min_order_threshold": 50,
    "delivery_priority": true,
    "quality_preference": "premium",
    "organic_preference": 1.0,
    "preferred_vendor_ids": [2],
    "brand_preference": "Local Organic",
    "max_price_multiplier": 1.2
  }
}
```

### 4. Update Vendor Selection Configuration
**Endpoint**: `PUT /api/v1/vendor-selection-config/{level}/{id}`

**Purpose**: Update vendor selection configuration at different levels

**Implementation Location**: Create new file `app/api/v1/vendor_selection_config.py`

**Request**:
- Path parameters:
  - `level`: "system" | "order" | "item" | "order_item"
  - `id`: integer (ID of the entity to update)
- Authentication: Required (Firebase token)
- Body: VendorSelectionConfig object

**Response**:
```json
{
  "success": true,
  "message": "Configuration updated successfully",
  "updated_config": { /* updated configuration */ }
}
```

## Data Models Required

### 1. Database Models (SQLAlchemy)
**Location**: Add to `models/` directory

#### VendorSelectionConfig (Database Model)
```python
# models/vendor_selection_config.py
from sqlalchemy import Column, Integer, String, Boolean, Numeric, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class VendorSelectionConfig(Base):
    __tablename__ = "vendor_selection_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    # Configuration level: system, order, item, order_item
    config_level = Column(String, nullable=False)  # system, order, item, order_item
    entity_id = Column(Integer, nullable=True)  # ID of the entity this config applies to
    
    # Configuration fields (stored as JSON for flexibility)
    config_data = Column(JSON, nullable=False)
    
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
```

#### VendorSelection (Database Model)
```python
# models/vendor_selection.py
from sqlalchemy import Column, Integer, String, Numeric, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class VendorSelection(Base):
    __tablename__ = "vendor_selections"
    
    id = Column(Integer, primary_key=True, index=True)
    house_order_item_id = Column(Integer, ForeignKey("house_order_items.id"), nullable=False)
    vendor_item_id = Column(Integer, ForeignKey("vendor_items.id"), nullable=False)
    
    # Selection metadata
    selection_reason = Column(JSON, nullable=False)  # strategy, reason, confidence_score
    cost_savings = Column(Numeric(10, 2), nullable=False, default=0.00)
    alternatives = Column(JSON, nullable=True)  # Array of alternative selections
    
    # Relationships
    house_order_item = relationship("HouseOrderItem", back_populates="vendor_selections")
    vendor_item = relationship("VendorItem")
    
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### 2. Pydantic Schemas (API)
**Location**: Add to `schemas/` directory

#### VendorSelectionConfig (Pydantic Schema)
```python
# schemas/vendor_selection_config.py
from pydantic import BaseModel
from typing import List, Literal, Optional
from decimal import Decimal

class VendorSelectionConfigSchema(BaseModel):
    strategy: Literal["lowest_price", "best_value", "preferred_vendor", "delivery_optimization"]
    min_order_threshold: float
    delivery_priority: bool
    quality_preference: Literal["premium", "standard", "budget"]
    organic_preference: float  # 0.0 to 1.0
    preferred_vendor_ids: List[int]
    brand_preference: str
    max_price_multiplier: float
    
    class Config:
        from_attributes = True
```

#### VendorSelection (Pydantic Schema)
```python
# schemas/vendor_selection.py
from pydantic import BaseModel
from typing import List, Optional
from schemas.vendor_item import VendorItemSchema

class SelectionReasonSchema(BaseModel):
    strategy: str
    reason: str
    confidence_score: float  # 0.0 to 1.0

class VendorSelectionSchema(BaseModel):
    vendor_item: VendorItemSchema
    selection_reason: SelectionReasonSchema
    cost_savings: float
    alternatives: Optional[List['VendorSelectionSchema']] = None
    
    class Config:
        from_attributes = True

class ConfigInheritanceSchema(BaseModel):
    system_config: VendorSelectionConfigSchema
    order_config: Optional[VendorSelectionConfigSchema] = None
    item_config: Optional[VendorSelectionConfigSchema] = None
    order_item_config: Optional[VendorSelectionConfigSchema] = None
    resolved_config: VendorSelectionConfigSchema
```

## Business Logic Requirements

### 1. Integration with Existing OrderConversionService
**Location**: Extend `app/services/order_conversion_service.py`

The existing `OrderConversionService` already has:
- `VendorSelectionConfig` class with selection strategies
- `convert_house_order_to_vendor_orders()` method
- Configuration merging logic

**Required Extensions**:
- Add methods to retrieve vendor selections for display
- Add methods to override existing selections
- Add configuration inheritance resolution
- Add cost savings calculation

### 2. Vendor Selection Algorithm
**Location**: Extend existing `OrderConversionService`

The existing service already implements:
- **lowest_price**: Select vendor with lowest cost per unit
- **best_value**: Consider price, quality, and delivery factors
- **preferred_vendor**: Prioritize vendors in preferred_vendor_ids list
- **delivery_optimization**: Optimize for delivery efficiency and timing

**Required Additions**:
- Store selection reasoning in database
- Calculate cost savings vs alternatives
- Generate alternative options for comparison

### 3. Configuration Inheritance
**Location**: Extend existing configuration system

The existing system already has:
- System-level configuration in `Settings` model
- Order-level configuration in `HouseOrder.vendor_selection_config`
- Configuration merging in `OrderConversionService`

**Required Extensions**:
- Add item-level configuration support
- Add order-item-level configuration support
- Create API endpoints for configuration management
- Implement configuration inheritance resolution

### 4. Cost Calculation
**Location**: Extend existing cost calculation logic

**Required Additions**:
- Calculate cost savings compared to highest-priced alternative
- Include delivery costs in total cost calculations
- Apply quality and organic preference multipliers
- Store cost analysis in `VendorSelection` model

## Frontend Integration Flows

### 1. Order Details with Vendor Selection
**Flow**: User views order → Sees vendor selection results → Can override selections

**API Calls**:
1. `GET /house-orders/{id}/vendor-selections` - Load selections
2. `GET /house-orders/items/{item_id}/config-inheritance` - Load config
3. `POST /house-orders/items/{item_id}/override-vendor-selection` - Override selection

### 2. Configuration Management
**Flow**: User configures vendor selection preferences at different levels

**API Calls**:
1. `PUT /vendor-selection-config/order/{order_id}` - Update order config
2. `PUT /vendor-selection-config/item/{item_id}` - Update item config
3. `PUT /vendor-selection-config/order_item/{order_item_id}` - Update order item config

### 3. Vendor Comparison
**Flow**: User compares vendor options side-by-side

**API Calls**:
1. `GET /house-orders/{id}/vendor-selections` - Load current selections
2. `POST /house-orders/items/{item_id}/override-vendor-selection` - Change selection

## Error Handling Requirements

### 1. Validation Errors
- Return 400 with detailed validation messages
- Include field-specific error details

### 2. Not Found Errors
- Return 404 for non-existent orders/items
- Include helpful error messages

### 3. Business Logic Errors
- Return 422 for invalid business operations
- Include explanation of why operation failed

## Testing Requirements

### 1. Unit Tests
- Test each selection strategy algorithm
- Test configuration inheritance logic
- Test cost calculation methods

### 2. Integration Tests
- Test complete vendor selection flow
- Test configuration override scenarios
- Test error handling paths

### 3. Performance Tests
- Test with large numbers of vendor items
- Test configuration inheritance performance
- Test concurrent selection operations

## Implementation Priority

### Phase 1 (Critical - Remove 404 Errors)
**Goal**: Make frontend functional with basic vendor selection

1. **Database Migration**: Add new tables for vendor selections and configs
2. **Basic Vendor Selection Endpoint**: `GET /api/v1/house-orders/{id}/vendor-selections`
3. **Configuration Inheritance Endpoint**: `GET /api/v1/house-orders/items/{id}/config-inheritance`
4. **Override Selection Endpoint**: `POST /api/v1/house-orders/items/{id}/override-vendor-selection`
5. **Configuration Update Endpoint**: `PUT /api/v1/vendor-selection-config/{level}/{id}`

### Phase 2 (Enhanced Functionality)
**Goal**: Full vendor selection capabilities with cost analysis

1. **Extend OrderConversionService**: Add vendor selection retrieval methods
2. **Cost Analysis**: Implement cost savings calculations
3. **Alternative Options**: Generate alternative vendor selections
4. **Configuration Management**: Full hierarchical configuration support
5. **Performance Optimization**: Optimize database queries and selection algorithms

### Phase 3 (Advanced Features)
**Goal**: Advanced analytics and optimization

1. **Historical Analysis**: Track vendor selection performance over time
2. **Machine Learning**: Implement ML-based vendor recommendations
3. **Advanced Reporting**: Cost analysis and vendor performance reports
4. **Real-time Updates**: Live vendor selection updates

## Existing Backend Patterns to Follow

### 1. API Endpoint Structure
```python
# Follow existing pattern from house_orders.py
@router.get("/{order_id}/vendor-selections", response_model=List[VendorSelectionSchema])
async def get_vendor_selections(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Implementation here
```

### 2. Error Handling
```python
# Follow existing error handling pattern
try:
    # Business logic
    return result
except HTTPException:
    raise
except Exception as e:
    print(f"Error in function_name: {e}")
    db.rollback()
    raise HTTPException(status_code=500, detail="Internal server error")
```

### 3. Database Relationships
```python
# Follow existing relationship patterns
# Add to existing models:
class HouseOrderItem(Base):
    # ... existing fields ...
    vendor_selections = relationship("VendorSelection", back_populates="house_order_item")
```

### 4. Service Layer Integration
```python
# Extend existing OrderConversionService
class OrderConversionService:
    # ... existing methods ...
    
    def get_vendor_selections_for_order(self, house_order_id: int) -> List[VendorSelection]:
        # New method implementation
    
    def override_vendor_selection(self, order_item_id: int, vendor_item_id: int) -> VendorSelection:
        # New method implementation
```

## Frontend Changes Required After Backend Implementation

Once the backend endpoints are implemented, the following frontend changes must be made:

1. **Remove 404 Error Handling**: Remove the temporary 404 handling in `house-orders.ts`
2. **Restore Error Throwing**: Restore proper error throwing for failed API calls
3. **Add Loading States**: Implement proper loading states for all vendor selection operations
4. **Add Error Notifications**: Show user-friendly error messages for failed operations

## Existing Test Data Context

The backend already has comprehensive test data that supports vendor selection:

### Test Scenarios Available
1. **No Filters (Pure Price Optimization)**: Salmon Fillet - 20lb case
2. **Brand Preference Only**: Ketchup with Heinz brand preference
3. **Vendor Preference Only**: Organic Apples with preferred vendors
4. **Both Vendor and Brand Preferences**: Whole Milk with Organic Valley brand

### Test Data Structure
- **8 specialized vendors** with different pricing strategies
- **50 house items** including 10 specific test scenario items
- **62 vendor items** with realistic substitution scenarios
- **12 house orders** with 57 order items
- **18 vendor orders** with detailed breakdowns

### Vendor Selection Test Cases
The existing test data provides realistic scenarios for testing:
- Price optimization across different vendors
- Brand preference filtering
- Vendor relationship management
- Quality and organic preference handling
- Delivery optimization scenarios

## Current Frontend Status

The frontend is currently functional but with limited vendor selection capabilities:
- ✅ **UI Complete**: All vendor selection components implemented
- ✅ **Data Models**: Complete TypeScript interfaces defined
- ✅ **Integration**: Components properly connected
- ✅ **Test Data Ready**: Backend has comprehensive test scenarios
- ⚠️ **Temporary Fix**: 404 errors handled gracefully (to be removed)
- ⚠️ **Backend Missing**: APIs return 404 (needs implementation)

## Implementation Checklist

### Backend Team
- [ ] Create database migration for new tables
- [ ] Add VendorSelection and VendorSelectionConfig models
- [ ] Extend OrderConversionService with new methods
- [ ] Implement 4 required API endpoints
- [ ] Add comprehensive error handling
- [ ] Test with existing test data scenarios

### Frontend Team
- [ ] Remove temporary 404 error handling
- [ ] Test vendor selection functionality
- [ ] Verify configuration inheritance works
- [ ] Test override functionality
- [ ] Update error handling for real API responses

## Next Steps

1. **Backend Team**: Implement the required API endpoints as outlined above
2. **Frontend Team**: Remove temporary 404 handling once backend is ready
3. **Testing**: Use existing test data to verify vendor selection functionality
4. **Documentation**: Update API documentation with the new endpoints

## Contact

For questions about this implementation, please refer to:
- **Frontend Components**: `src/components/vendor-selection/`
- **Frontend Store**: `src/stores/house-orders.ts` (vendor selection methods)
- **Main Component**: `src/components/orders/OrderDetailsWithVendorSelection.vue`
- **Backend Service**: `app/services/order_conversion_service.py`
- **Backend Models**: `models/` directory
- **Test Data**: `seeds/development_seeder.py`
