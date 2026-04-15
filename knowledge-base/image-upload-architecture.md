# Image-upload architecture (ux-prototype, 4.11.7+)

Quick-reference map of the components, types, and interaction patterns that
make up the image-upload surface. Read before touching any of:
`ImageUploadDialog`, `ItemCardEditor`, `ImageUploader`, `ImageUploadProvider`,
`defaultImageUploader`.

## Public surface

Exported from `@arda-cards/design-system/canary`:

| Name | Kind | Role |
|------|------|------|
| `ImageUploader` | interface | `uploadFile`, `uploadFromUrl`, `checkReachability` — the contract every upload consumer implements |
| `ImageUploadProvider` | component | Context provider mounted by the app; children reach the uploader via `useImageUploader()` |
| `useImageUploader` | hook | Returns the current `ImageUploader`; falls back to `defaultImageUploader` if no provider |
| `defaultImageUploader` | constant | Stub uploader backed by `defaultUploadHandler` / `defaultUrlUploadHandler` / `defaultReachabilityCheck`. Returns picsum.photos URLs for dev/Storybook |
| `ItemCardEditor` | component | Card with drop zone; consumes uploader from context |
| `ImageUploadDialog` | component | Standalone dialog with `EditExisting` / `EmptyImage` / `Uploading` / `UploadError` / `FailedValidation` phases; consumes uploader from context |

## Flow diagram (conceptual)

```
 user drops/selects file or URL
                │
                ▼
  ┌───────────────────────────────┐
  │ ItemCardEditor drop zone      │   ── direct-upload (no dialog, no cropper)
  │  uploadFile / uploadFromUrl   │
  │  on resolve → commit CDN URL  │
  └───────────────────────────────┘

 user clicks "Click to edit/replace" overlay on an existing image
 OR user double-clicks image cell in AG Grid
                │
                ▼
  ┌───────────────────────────────┐
  │ ImageUploadDialog             │
  │  RESET → EditExisting         │   ── cropper visible, for edit-mindset
  │   ↑                           │
  │   │ Accept (no edits)         │ ── skipUpload → onConfirm with existing URL
  │   │ Accept (with edits)       │ ── getCroppedImage → Uploading(blob)
  │   │ Upload New Image          │ ── EmptyImage → user drops → Uploading
  │   ▼                           │
  │  Uploading → UploadError      │ ── Retry / Discard
  │           → onConfirm (CDN)   │
  └───────────────────────────────┘
```

Key invariant: **the cropper only appears in `EditExisting`**. Fresh uploads
(via card-side drop zone OR dialog's own drop zone after `Upload New Image`)
skip to `Uploading` directly — the rapid-batch UX.

## File responsibilities

| File | What it owns |
|------|--------------|
| `src/types/canary/utilities/image-uploader.tsx` | `ImageUploader` interface, `defaultImageUploader` stub, `ImageUploadContext`, `ImageUploadProvider`, `useImageUploader` |
| `src/types/canary/utilities/image-upload-handlers.ts` | Stub handlers that make up `defaultImageUploader` |
| `src/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog.tsx` | Dialog state machine + render |
| `src/components/canary/organisms/item-card-editor/item-card-editor.tsx` | Card + drop zone + direct-upload state |
| `src/components/canary/molecules/image-drop-zone/image-drop-zone.tsx` | File/URL intake + per-format validation |
| `src/components/canary/molecules/image-preview-editor/image-preview-editor.tsx` | Cropper (react-easy-crop wrapper) |
| `src/types/canary/utilities/get-cropped-image.ts` | Canvas-based crop/zoom/rotate → Blob |
| `src/types/canary/utilities/cdn-url.ts` | CDN prefetch helpers (CORS mitigation) |

## Things that often trip agents

- **`pendingInput`** is a still-public dialog prop for consumers that want
  to inject an input from an external drop zone. Its existence is
  arguably a leaky abstraction (see
  [component-abstractions.md](./component-abstractions.md)); it's kept
  for now but is a candidate for removal in the v5 consolidation
  (Option C — track in Arda-cards/ux-prototype follow-up ticket).
- **Default fallback on `useImageUploader()`** means forgetting to mount
  `<ImageUploadProvider>` in production silently ships the picsum.photos
  stub. Mitigation: stub URLs are deliberately distinctive
  (`picsum.photos/seed/arda-uploaded/...`) so the bug is visible.
- **`EditExisting` CDN prefetch** is done via `prefetchImageAsBlob`
  (`cdn-url.ts`) to keep the cropper's `<img>` and the canvas on the
  same origin. Don't remove the prefetch without re-verifying CORS on
  canvas operations.
- **Dialog state machine post-4.11.7** no longer has `ProvidedImage` or
  `Warn` phases. `INPUT_FILE` / `INPUT_URL` now land directly in
  `Uploading`. If a regression asks to stage uploads for review, this is
  a policy change that should be discussed before reinstating those
  phases.

## Adding a new upload capability

If you want to add a new operation (e.g. clipboard paste, batch upload,
resumable upload), the playbook is:

1. **Extend `ImageUploader`** with the new method. The `Mocked<T>`
   pattern in tests picks up the new member automatically.
2. **Update `defaultImageUploader`** with a stub implementation.
3. **Update the consumer bridge** (`useItemImageUploader` in
   arda-frontend-app) with the real implementation.
4. **Wire the component** that consumes the new capability via
   `useImageUploader()`.
5. **Document in this KB**: a one-line entry in the "Public surface"
   table above, and a note in the flow diagram if it's a new user path.

Resist the urge to add a new callback prop on `ItemCardEditor` or
`ImageUploadDialog` for the capability — that's the leaky-abstraction
anti-pattern this architecture exists to prevent.
