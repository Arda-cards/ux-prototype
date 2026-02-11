# Application Prototypes

Full-application wireframes showing complete navigation, layout, and page structure. One sub-section for each target platform or application variant.

## Structure

Each application lives in its own subdirectory:

```
src/app/prototypes/applications/
├── README.md               ← you are here
├── web/
│   ├── page.tsx            ← landing / dashboard
│   ├── layout.tsx          ← shared app shell (sidebar, nav)
│   ├── items/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
└── mobile/
    ├── page.tsx
    └── layout.tsx
```

Each application may define its own `layout.tsx` to provide a shared navigation shell (sidebar, tab bar, etc.) that wraps all pages within the application.

## Adding a New Application

1. Create a new directory under `src/app/prototypes/applications/`:
   ```bash
   mkdir -p src/app/prototypes/applications/my-app
   ```

2. Add a `page.tsx` as the entry point (e.g., dashboard or landing). Optionally add a `layout.tsx` for the application shell (navigation, sidebar, header).

3. Add sub-routes for additional pages within the application.

4. Register the application in the gallery by adding an entry to the `applications` section items array in `src/app/page.tsx`.

5. Run `make dev` and navigate to `http://localhost:3000/prototypes/applications/my-app`.

## Guidelines

- Define a **layout.tsx** with the application's navigation chrome (sidebar, top bar, breadcrumbs).
- Use realistic page names and navigation structure.
- Include at least a **dashboard/home**, **list view**, and **detail/form** page to demonstrate the full range of layout needs.
- Consider responsive breakpoints — prototype both desktop and mobile viewports where relevant.
