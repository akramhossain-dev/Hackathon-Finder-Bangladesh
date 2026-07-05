# Module: organizer

**Phase**: TBD  
**Status**: Scaffold only — no implementation yet.

## Folder structure (to be created in the implementing phase)

```
organizer/
├── organizer.model.ts       ← Mongoose schema + model
├── organizer.routes.ts      ← Express Router
├── organizer.controller.ts  ← thin request/response layer
├── organizer.service.ts     ← business logic
├── organizer.schema.ts      ← Zod validation schemas
└── organizer.types.ts       ← TypeScript interfaces
```

## Notes

See `docs/` for architecture decisions and API contracts for this module.
