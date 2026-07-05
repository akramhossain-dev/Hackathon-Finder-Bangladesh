# Module: admin

**Phase**: Phase 7  
**Status**: Scaffold only — no implementation yet.

## Sub-modules (per ARCHITECTURE.md)

```
admin/
├── hackathon.admin.routes.ts
├── organizer.admin.routes.ts
├── category.admin.routes.ts
├── submission.admin.routes.ts
└── job.admin.routes.ts
```

## Notes

All admin routes require `authenticate` + `authorize(["admin"])`.
See `docs/ADMIN_PANEL.md` for full admin capabilities.
