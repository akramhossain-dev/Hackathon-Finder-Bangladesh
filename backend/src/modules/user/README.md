# Module: user

**Phase**: TBD  
**Status**: Scaffold only — no implementation yet.

## Folder structure (to be created in the implementing phase)

```
user/
├── user.model.ts       ← Mongoose schema + model
├── user.routes.ts      ← Express Router
├── user.controller.ts  ← thin request/response layer
├── user.service.ts     ← business logic
├── user.schema.ts      ← Zod validation schemas
└── user.types.ts       ← TypeScript interfaces
```

## Notes

See `docs/` for architecture decisions and API contracts for this module.
