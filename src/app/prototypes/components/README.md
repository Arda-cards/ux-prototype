# Component Prototypes

Reusable UI components that can be composed across multiple screens and use cases.

## Structure

Each component prototype lives in its own subdirectory:

```
src/app/prototypes/components/
├── README.md           ← you are here
├── sample/
│   └── page.tsx        ← template: copy this to start
├── data-table/
│   └── page.tsx
└── entity-form/
    └── page.tsx
```

## Adding a New Component

1. Create a new directory under `src/app/prototypes/components/`:
   ```bash
   mkdir src/app/prototypes/components/my-component
   ```

2. Add a `page.tsx` file in the new directory. Use the `sample/` folder as a starting template:
   ```bash
   cp src/app/prototypes/components/sample/page.tsx \
      src/app/prototypes/components/my-component/page.tsx
   ```

3. Register the prototype in the gallery by adding an entry to the `components` section items array in `src/app/page.tsx`.

4. Run `make dev` and navigate to `http://localhost:3000/prototypes/components/my-component`.

## Guidelines

- Each component should be **self-contained** — no dependencies on other prototypes.
- Include representative states: empty, loading, populated, error.
- Use Arda design tokens from `globals.css` for consistent styling.
- Components should work in both normal and **wireframe mode** (toggle in header).
