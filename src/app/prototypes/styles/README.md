# Styles

Representative pages and components rendered in different visual styles — light/dark modes, color palettes, brand variations, and typography experiments.

## Structure

Each style variant lives in its own subdirectory:

```
src/app/prototypes/styles/
├── README.md           ← you are here
├── dark-mode/
│   └── page.tsx
├── high-contrast/
│   └── page.tsx
└── brand-warm/
    └── page.tsx
```

## Adding a New Style

1. Create a new directory under `src/app/prototypes/styles/`:
   ```bash
   mkdir src/app/prototypes/styles/my-style
   ```

2. Add a `page.tsx` that showcases representative components (forms, tables, cards, navigation) rendered in the target style. Override CSS variables or apply custom classes as needed.

3. Register the style in the gallery by adding an entry to the `styles` section items array in `src/app/page.tsx`.

4. Run `make dev` and navigate to `http://localhost:3000/prototypes/styles/my-style`.

## Guidelines

- Each style should apply to a **consistent set of reference components** so that the visual impact is comparable across styles.
- Override CSS variables (from `globals.css`) in a scoped wrapper rather than creating separate stylesheets.
- Consider including both a light and dark variant in the same prototype for comparison.
- Document the color palette and design rationale in comments at the top of the page file.
