---
name: add-api-resource
description: >-
  Adds a full CRUD API resource end-to-end across Laravel and the Alpine frontend.
  Use when creating a new domain entity, apiResource, controller, model, migration,
  seeder, or js module that talks to /api.
---

# Add API Resource

## Checklist

Copy and track:

```
- [ ] Migration + model ($fillable, $casts, scopes, relations)
- [ ] Api controller (index/store/show/update/destroy + JsonResponse)
- [ ] Routes in routes/api.php
- [ ] Confirm api routes registered in bootstrap/app.php
- [ ] Seeder (optional) + DatabaseSeeder entry
- [ ] js/api.js helpers
- [ ] js/<resource>.js module factory
- [ ] Wire module in js/app.js
- [ ] Mirror in root app.js / index.html if UI is still on monolith
- [ ] EN + AR translation keys
```

## Laravel controller skeleton

```php
return response()->json([
    'success' => true,
    'message' => 'Created successfully',
    'data' => $model,
], 201);
```

Index: filters → scopes → `paginate($request->get('per_page', 15))`.

## Frontend module skeleton

```javascript
export function createFooModule(state) {
  return {
    async loadFoos() { /* api.getFoos(); update state */ },
    async saveFoo() { /* create/update via api; refresh */ },
    async deleteFoo(id) { /* api.deleteFoo; refresh */ },
  };
}
```

Register methods by spreading into Alpine `app` in `js/app.js`.

## Stock-affecting resources

If the entity changes inventory levels, create `StockTransaction` rows in the same request/transaction. See the inventory-domain rule.
