# Use Case Prototypes

Targeted prototypes that demonstrate specific user flows and scenarios end-to-end. Each sub-section focuses on a single use case.

## Structure

Each use case lives in its own subdirectory:

```
src/app/prototypes/use-cases/
├── README.md               ← you are here
├── item-onboarding/
│   └── page.tsx
├── supplier-lookup/
│   ├── page.tsx
│   └── results/
│       └── page.tsx
└── order-checkout/
    └── page.tsx
```

A use case may contain **multiple pages** (sub-routes) if the flow involves sequential steps or branching paths.

## Adding a New Use Case

1. Create a new directory under `src/app/prototypes/use-cases/`:
   ```bash
   mkdir src/app/prototypes/use-cases/my-use-case
   ```

2. Add a `page.tsx` for the main entry point of the flow. Add nested directories for additional steps if needed (e.g., `my-use-case/step-2/page.tsx`).

3. Register the use case in the gallery by adding an entry to the `use-cases` section items array in `src/app/page.tsx`.

4. Run `make dev` and navigate to `http://localhost:3000/prototypes/use-cases/my-use-case`.

## Guidelines

- Start each use case with a clear **scenario description** as introductory text.
- Show the **happy path** first, then add error and edge-case states.
- Use breadcrumbs and navigation to connect multi-step flows.
- Link back to individual **Component Prototypes** when reusing them in context.
