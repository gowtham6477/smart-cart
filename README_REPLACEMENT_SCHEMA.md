# Replacement Flow – DB Schema

This document describes the MongoDB collections used for the replacement flow.

## Collections

### `replacement_policies`
```json
{
  "_id": "string",
  "active": true,
  "allowedCategories": ["Dairy", "Grocery"],
  "maxPriceDiffPercent": 10,
  "maxPriceDiffAmount": 50,
  "timeWindowHours": 24,
  "requireApproval": false,
  "bufferEnabled": false,
  "bufferQuantity": 0,
  "createdAt": "2026-03-21T10:15:00Z",
  "updatedAt": "2026-03-21T10:20:00Z"
}
```

### `replacement_requests`
```json
{
  "_id": "string",
  "orderId": "string",
  "orderNumber": "ORD12345",
  "employeeId": "string",
  "employeeName": "Alex",
  "originalItem": {
    "itemId": "ITEM-AB12CD34",
    "productId": "P001",
    "productName": "Milk 1L",
    "category": "Dairy",
    "price": 45,
    "quantity": 1,
    "imageUrl": "https://..."
  },
  "replacementItem": {
    "itemId": "REPL-12AB34CD",
    "productId": "P009",
    "productName": "Milk 1L (Alt)",
    "category": "Dairy",
    "price": 48,
    "quantity": 1,
    "imageUrl": "https://..."
  },
  "reason": "Bottle damaged after fall",
  "priceDifference": 3,
  "priceDifferencePercent": 6.66,
  "approvalRequired": false,
  "status": "APPROVED",
  "reviewedBy": "adminId",
  "reviewedAt": "2026-03-21T11:00:00Z",
  "reviewNote": "OK",
  "approvedBy": "adminId",
  "approvedAt": "2026-03-21T11:00:00Z",
  "createdAt": "2026-03-21T10:30:00Z",
  "updatedAt": "2026-03-21T11:00:00Z"
}
```

### `orders` (replacement-specific fields)
`Order.items[]` includes:
```json
{
  "itemId": "ITEM-AB12CD34",
  "productId": "P001",
  "productName": "Milk 1L",
  "category": "Dairy",
  "price": 45,
  "quantity": 1,
  "imageUrl": "https://...",
  "replaced": true,
  "replacementRequestId": "string",
  "replacedAt": "2026-03-21T11:05:00Z"
}
```

---

If you want, I can also add sample MongoDB indexes or export JSON schemas for validation.
