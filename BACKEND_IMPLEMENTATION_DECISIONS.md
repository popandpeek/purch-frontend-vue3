# Backend Implementation Decisions & Clarifications

## Overview
This document addresses the clarifying questions from the backend team regarding the vendor selection implementation. It provides detailed answers and recommendations based on the existing architecture and best practices.

## 1. Data Model Questions

### Vendor Selection Storage
**Question**: Where should we store the actual vendor selections? Should we:
- Store them in the VendorOrderBreakdown table?
- Create a new VendorSelection table?
- Store them as JSON in HouseOrderItem?

**Answer**: **Create a new `VendorSelection` table**

**Rationale:**
- The existing `VendorOrderBreakdown` table is designed for post-submission analysis
- Vendor selections need to be calculated and stored before order submission
- We need to track selection reasoning, alternatives, and cost analysis
- A dedicated table provides better query performance and data integrity

**Implementation:**
```python
# models/vendor_selection.py
class VendorSelection(Base):
    __tablename__ = "vendor_selections"
    
    id = Column(Integer, primary_key=True, index=True)
    house_order_item_id = Column(Integer, ForeignKey("house_order_items.id"), nullable=False)
    vendor_item_id = Column(Integer, ForeignKey("vendor_items.id"), nullable=False)
    
    # Selection metadata
    selection_reason = Column(JSON, nullable=False)
    cost_savings = Column(Numeric(10, 2), nullable=False, default=0.00)
    alternatives = Column(JSON, nullable=True)  # Top 3-5 alternatives
    
    # Relationships
    house_order_item = relationship("HouseOrderItem", back_populates="vendor_selections")
    vendor_item = relationship("VendorItem")
    
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### Configuration Storage
**Question**: The document mentions storing configs at different levels, but I see:
- HouseOrder.vendor_selection_config (JSON field) - for order-level config
- No item-level or order-item-level config fields in current models
- Should we add these fields or create a separate VendorSelectionConfig table?

**Answer**: **Create a separate `VendorSelectionConfig` table**

**Rationale:**
- JSON fields are hard to query and validate
- Separate table allows for better indexing and performance
- Easier to implement configuration inheritance
- More maintainable and extensible

**Implementation:**
```python
# models/vendor_selection_config.py
class VendorSelectionConfig(Base):
    __tablename__ = "vendor_selection_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    config_level = Column(String, nullable=False)  # system, order, item, order_item
    entity_id = Column(Integer, nullable=True)  # ID of the entity this config applies to
    
    # Configuration fields
    strategy = Column(String, nullable=False, default="lowest_price")
    min_order_threshold = Column(Numeric(10, 2), nullable=False, default=0.00)
    delivery_priority = Column(Boolean, nullable=False, default=False)
    quality_preference = Column(String, nullable=False, default="standard")
    organic_preference = Column(Numeric(3, 2), nullable=False, default=0.00)
    preferred_vendor_ids = Column(JSON, nullable=True)  # Array of vendor IDs
    brand_preference = Column(String, nullable=True)
    max_price_multiplier = Column(Numeric(3, 2), nullable=False, default=2.00)
    
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
```

## 2. API Design Questions

### Response Format
**Question**: The document shows complex nested responses with alternatives arrays. Should we:
- Calculate alternatives on-the-fly (performance impact)?
- Pre-calculate and store alternatives?
- Limit alternatives to top N options?

**Answer**: **Pre-calculate and store alternatives (Top 3-5 options)**

**Rationale:**
- On-the-fly calculation would be too slow for complex scenarios
- Pre-calculating allows for better performance and consistency
- Top 3-5 alternatives provide sufficient choice without overwhelming users
- Can be recalculated when configurations change

**Implementation:**
```python
# Store alternatives in VendorSelection.alternatives JSON field
alternatives = [
    {
        "vendor_item_id": 15,
        "cost_difference": 2.30,
        "reason": "Higher price per unit"
    },
    {
        "vendor_item_id": 23,
        "cost_difference": 5.10,
        "reason": "Lower quality rating"
    }
]
```

### Configuration Inheritance
**Question**: The document shows a complex inheritance structure. Should we:
- Calculate this on-the-fly for each request?
- Cache resolved configurations?
- Store resolved configs in the database?

**Answer**: **Calculate on-the-fly with caching**

**Rationale:**
- Configuration inheritance is relatively lightweight to calculate
- Caching prevents repeated calculations
- On-the-fly calculation ensures real-time accuracy
- Can invalidate cache when configurations change

**Implementation:**
```python
# Service method with caching
@lru_cache(maxsize=1000)
def get_resolved_config(self, order_item_id: int) -> VendorSelectionConfig:
    # Calculate inheritance hierarchy
    # Return resolved configuration
```

## 3. Business Logic Questions

### Selection Timing
**Question**: When should vendor selections be calculated?
- On-demand when API is called?
- When house order is submitted?
- When house order is created?

**Answer**: **On-demand when API is called**

**Rationale:**
- Allows for real-time configuration changes
- Reduces database storage requirements
- Provides flexibility for different use cases
- Can be optimized with caching

**Implementation Flow:**
1. User requests vendor selections
2. Check if selections exist and are current
3. If not, calculate new selections
4. Store results for future requests
5. Return selections to frontend

### Override Persistence
**Question**: When a user overrides a vendor selection:
- Should it persist across order resubmissions?
- Should it only apply to the current submission?
- Should it create a new configuration at the order-item level?

**Answer**: **Persist across order resubmissions**

**Rationale:**
- User overrides represent intentional business decisions
- Should be preserved unless explicitly changed
- Creates order-item-level configuration
- Maintains audit trail of decisions

**Implementation:**
```python
# When user overrides selection:
# 1. Create/update order-item-level configuration
# 2. Mark selection as manually overridden
# 3. Persist across resubmissions
```

## 4. Performance Questions

### Large Datasets
**Question**: The document mentions testing with large numbers of vendor items. What are the expected scales?
- How many vendor items per house item?
- How many house items per order?
- How many concurrent users?

**Answer**: **Based on existing test data and typical usage:**

- **Vendor items per house item**: 5-15 (realistic range)
- **House items per order**: 10-50 (typical order size)
- **Concurrent users**: 10-50 (small to medium business)
- **Total vendor items**: 100-500 (current test data has 62)

### Caching Strategy
**Question**: Should we implement caching for:
- Vendor item lookups?
- Configuration inheritance?
- Selection results?

**Answer**: **Multi-level caching**

**Implementation:**
```python
# 1. In-memory caching for frequently accessed data
@lru_cache(maxsize=1000)
def get_vendor_items_for_house_item(self, house_item_id: int):
    # Cache vendor item lookups

# 2. Redis caching for configuration inheritance
def get_resolved_config_cached(self, order_item_id: int):
    cache_key = f"config:{order_item_id}"
    # Check Redis cache first
    
# 3. Database indexing for performance
# Add indexes on frequently queried fields
```

## Updated Implementation Plan

### Phase 1: Core Implementation
1. **Database Migration**: Add new tables with proper indexes
2. **Basic API Endpoints**: Implement 4 required endpoints
3. **Simple Caching**: In-memory caching for vendor items
4. **Basic Selection Logic**: Extend existing OrderConversionService

### Phase 2: Performance Optimization
1. **Redis Integration**: Add Redis for configuration caching
2. **Database Optimization**: Add indexes and query optimization
3. **Alternative Calculation**: Implement pre-calculation of alternatives
4. **Load Testing**: Test with realistic data volumes

### Phase 3: Advanced Features
1. **Real-time Updates**: WebSocket support for live updates
2. **Advanced Analytics**: Historical performance tracking
3. **Machine Learning**: ML-based vendor recommendations
4. **Monitoring**: Performance monitoring and alerting

## Database Schema Updates

### New Tables
```sql
-- Vendor selections table
CREATE TABLE vendor_selections (
    id INTEGER PRIMARY KEY,
    house_order_item_id INTEGER NOT NULL,
    vendor_item_id INTEGER NOT NULL,
    selection_reason JSON NOT NULL,
    cost_savings DECIMAL(10,2) DEFAULT 0.00,
    alternatives JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (house_order_item_id) REFERENCES house_order_items(id),
    FOREIGN KEY (vendor_item_id) REFERENCES vendor_items(id)
);

-- Vendor selection configs table
CREATE TABLE vendor_selection_configs (
    id INTEGER PRIMARY KEY,
    config_level VARCHAR(20) NOT NULL,  -- system, order, item, order_item
    entity_id INTEGER,  -- ID of the entity this config applies to
    strategy VARCHAR(30) DEFAULT 'lowest_price',
    min_order_threshold DECIMAL(10,2) DEFAULT 0.00,
    delivery_priority BOOLEAN DEFAULT FALSE,
    quality_preference VARCHAR(20) DEFAULT 'standard',
    organic_preference DECIMAL(3,2) DEFAULT 0.00,
    preferred_vendor_ids JSON,
    brand_preference VARCHAR(100),
    max_price_multiplier DECIMAL(3,2) DEFAULT 2.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_vendor_selections_order_item ON vendor_selections(house_order_item_id);
CREATE INDEX idx_vendor_selections_vendor_item ON vendor_selections(vendor_item_id);
CREATE INDEX idx_vendor_configs_level_entity ON vendor_selection_configs(config_level, entity_id);
```

### Model Updates
```python
# Add to existing HouseOrderItem model
class HouseOrderItem(Base):
    # ... existing fields ...
    vendor_selections = relationship("VendorSelection", back_populates="house_order_item")
    vendor_selection_config = relationship("VendorSelectionConfig", 
                                         foreign_keys="[VendorSelectionConfig.entity_id]",
                                         primaryjoin="and_(HouseOrderItem.id == foreign(VendorSelectionConfig.entity_id), VendorSelectionConfig.config_level == 'order_item')")
```

## Configuration Inheritance Logic

### Hierarchy Resolution
```python
def resolve_config_inheritance(self, order_item_id: int) -> VendorSelectionConfig:
    """
    Resolve configuration inheritance in order:
    1. System default config
    2. Order-level config (if exists)
    3. Item-level config (if exists)
    4. Order-item-level config (if exists)
    """
    # Get order item
    order_item = self.db.query(HouseOrderItem).filter(HouseOrderItem.id == order_item_id).first()
    
    # Start with system default
    system_config = self.get_system_config()
    
    # Override with order config
    order_config = self.get_order_config(order_item.house_order_id)
    if order_config:
        system_config = self.merge_configs(system_config, order_config)
    
    # Override with item config
    item_config = self.get_item_config(order_item.house_item_id)
    if item_config:
        system_config = self.merge_configs(system_config, item_config)
    
    # Override with order-item config
    order_item_config = self.get_order_item_config(order_item_id)
    if order_item_config:
        system_config = self.merge_configs(system_config, order_item_config)
    
    return system_config
```

## Performance Considerations

### Database Indexes
```sql
-- Additional indexes for performance
CREATE INDEX idx_vendor_items_house_item ON vendor_items(house_item_id);
CREATE INDEX idx_vendor_items_vendor ON vendor_items(vendor_id);
CREATE INDEX idx_vendor_items_available ON vendor_items(is_available);
CREATE INDEX idx_vendor_selections_created ON vendor_selections(created_at);
```

### Caching Strategy
```python
# Redis cache keys
CACHE_KEYS = {
    'vendor_items': 'vendor_items:house_item:{house_item_id}',
    'config_inheritance': 'config:order_item:{order_item_id}',
    'vendor_selections': 'selections:order_item:{order_item_id}',
    'alternatives': 'alternatives:selection:{selection_id}'
}

# Cache TTL (Time To Live)
CACHE_TTL = {
    'vendor_items': 3600,  # 1 hour
    'config_inheritance': 1800,  # 30 minutes
    'vendor_selections': 900,  # 15 minutes
    'alternatives': 1800  # 30 minutes
}
```

## Error Handling Strategy

### API Error Responses
```python
# Standard error response format
{
    "error": {
        "code": "VENDOR_SELECTION_ERROR",
        "message": "Failed to calculate vendor selections",
        "details": {
            "order_item_id": 123,
            "reason": "No available vendor items found"
        }
    }
}
```

### Common Error Scenarios
1. **No vendor items available**: Return empty array with explanation
2. **Configuration conflicts**: Log warning and use fallback
3. **Database connection issues**: Return 503 with retry suggestion
4. **Invalid configuration**: Return 400 with validation details

## Testing Strategy

### Unit Tests
- Test configuration inheritance logic
- Test vendor selection algorithms
- Test cost calculation methods
- Test caching mechanisms

### Integration Tests
- Test complete API endpoints
- Test database operations
- Test error handling scenarios
- Test performance with realistic data

### Load Tests
- Test with maximum expected concurrent users
- Test with large datasets
- Test cache performance
- Test database query performance

## Monitoring and Logging

### Key Metrics to Track
- Vendor selection calculation time
- Cache hit/miss rates
- Database query performance
- API response times
- Error rates by endpoint

### Logging Strategy
```python
import logging

logger = logging.getLogger(__name__)

# Log vendor selection decisions
logger.info(f"Vendor selection calculated for order_item {order_item_id}: "
           f"selected vendor_item {vendor_item_id}, "
           f"cost_savings: ${cost_savings}")

# Log configuration inheritance
logger.debug(f"Configuration resolved for order_item {order_item_id}: "
            f"strategy={strategy}, vendors={preferred_vendor_ids}")

# Log performance metrics
logger.info(f"Vendor selection calculation took {duration}ms for {item_count} items")
```

This approach provides a solid foundation that can scale with the application while maintaining good performance and data integrity.
