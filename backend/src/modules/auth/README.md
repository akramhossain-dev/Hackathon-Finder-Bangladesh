# Module: auth

**Phase**: TBD  
**Status**: Scaffold only — no implementation yet.

## Folder structure (to be created in the implementing phase)

```
auth/
├── auth.model.ts       ← Mongoose schema + model
├── auth.routes.ts      ← Express Router
├── auth.controller.ts  ← thin request/response layer
├── auth.service.ts     ← business logic
├── auth.schema.ts      ← Zod validation schemas
└── auth.types.ts       ← TypeScript interfaces
```

## Notes

See `docs/` for architecture decisions and API contracts for this module.
