# Compilation Fix Plan

## Problem Summary
The project has a mismatch between:
1. Entity layer: Uses MongoDB with String IDs
2. Service layer: Expects JPA-style Long IDs and DBRef relationships
3. DTOs: Mix of Long and String IDs

## Solution Strategy

### Phase 1: Update Entities (COMPLETED)
✅ Added MongoDB dependencies to pom.xml
✅ Entities already use String IDs

### Phase 2: Update DTOs to String IDs
- ✅ AuthResponse: Long userId → String userId
- ✅ BookingRequest: Long IDs → String IDs
- ✅ BookingResponse: Long IDs → String IDs  
- ✅ PaymentRequest: Long bookingId → String bookingId
- ✅ ServicePackageRequest: Long serviceId → String serviceId
- ✅ CouponRequest: BigDecimal → Double, LocalDate → LocalDateTime

### Phase 3: Update Service Layer
Need to update all service method signatures and implementations:

1. **BookingService**
   - Change all Long parameters to String
   - Update to work with String ID entities (no DBRef)
   
2. **PaymentService**
   - Change Long bookingId to String
   
3. **EmployeeService**
   - Change Long employeeId to String
   
4. **CouponService**
   - Update BigDecimal to Double
   - Update LocalDate to LocalDateTime
   
5. **ServiceManagementService**
   - Change Long serviceId to String

### Phase 4: Update Controllers
Update all controller method parameters from Long to String

### Phase 5: Update Repositories  
- ✅ Already use String IDs

## Current Status
- DTOs: UPDATED
- Entities: READY
- Services: NEEDS UPDATE (100+ method calls)
- Controllers: NEEDS UPDATE (20+ endpoints)

## Next Steps
Due to the extensive changes needed (100+ occurrences), the most efficient approach is to:
1. Create new simplified service implementations
2. Update controller signatures
3. Test compilation
4. Fix remaining issues

Estimated time: 2-3 hours of systematic updates

