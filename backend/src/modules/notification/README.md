# Module: notification

**Phase**: TBD  
**Status**: Scaffold only — no implementation yet.

## Folder structure (to be created in the implementing phase)

```
notification/
├── notification.model.ts       ← Mongoose schema + model
├── notification.routes.ts      ← Express Router
├── notification.controller.ts  ← thin request/response layer
├── notification.service.ts     ← business logic
├── notification.schema.ts      ← Zod validation schemas
└── notification.types.ts       ← TypeScript interfaces
```

## Notes

See `docs/` for architecture decisions and API contracts for this module.
