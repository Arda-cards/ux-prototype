# Component abstraction patterns (ux-prototype)

Concrete `ux-prototype` examples of clean-component design — paired with
specific commits and PRs so the lessons are traceable. For the general
principles, see the `clean-components` skill
(`.claude/skills/clean-components/SKILL.md`).

## The "uploader" pattern: callback explosion → Context + interface

### What it replaced (4.11.5 / 4.11.6)

The `ItemCardEditor` and `ImageUploadDialog` components originally exposed
upload semantics as three separate callback props:

```tsx
<ItemCardEditor
  onUpload={handleUpload}                    // Blob → CDN URL
  onUploadFromUrl={handleUploadFromUrl}      // URL → fetch + upload → CDN URL
  onCheckReachability={handleCheckReachability} // URL → boolean
  onUploadError={handleUploadError}          // Error → toast
/>
<ImageUploadDialog
  onUpload={handleUpload}
  onUploadFromUrl={handleUploadFromUrl}
  onCheckReachability={handleCheckReachability}
/>
```

Symptoms that triggered the refactor:

- **Two call sites** (`ItemFormPanel.tsx`, `ItemTableAGGrid.tsx`)
  destructured the same 3 handlers from the same bridge hook and
  prop-drilled them individually.
- **A bridge hook** (`useItemImageUploadDialog`) existed in the consumer
  solely to reverse-engineer the shape the package expected.
- **"Skip the cropper" product directive** had to be applied in two
  places (card-side drop zone AND dialog state machine) because both
  components owned parallel upload implementations.

### Pattern (5.0.0+)

Single interface + Context provider:

```ts
// Package exports
interface ImageUploader {
  uploadFile(file: Blob): Promise<string>;
  uploadFromUrl(url: string): Promise<string>;
  checkReachability(url: string): Promise<boolean>;
}

// Consumer
function useItemImageUploader(): ImageUploader { /* compose TanStack hooks */ }

// Call-site
<ImageUploadProvider value={uploader}>
  <ItemFormPanel />       {/* uses ItemCardEditor internally */}
  <ItemsTable />          {/* uses ImageUploadDialog internally */}
</ImageUploadProvider>
```

The package components call `useImageUploader()` internally; no per-callback
prop threading. The app mounts one provider per subtree; no duplication at
consumption sites.

### What to carry forward

- **Collapse 3+ related callbacks into one interface.** If the component
  needs several async operations that are all facets of "upload this
  image" or "resolve this entity" or similar, ship one controller.
- **Default the Context.** `useImageUploader()` returns a stub uploader
  when no provider is mounted, so Storybook stories and unit tests work
  without a wrapper. Production use requires an explicit provider.
- **Keep orthogonal concerns as props.** `onUploadError` (toast
  side-effect) stayed as a prop on `ItemCardEditor` because it's the
  *host's* side-effect, not part of the uploader's contract. Good rule
  of thumb: if the consumer is doing something with the result, it's a
  callback prop; if the component is asking for a capability, it's
  on the interface.

## State-machine-owned cropping vs. consumer-owned cropping

`ImageUploadDialog`'s `EditExisting` phase is the deliberate edit-
existing-image path — the only place the cropper appears as of 5.0.0.
New uploads (file or URL) skip the cropper entirely and go straight to
the `Uploading` phase. The user can still crop *after* the upload by
opening the dialog on the now-existing image.

Lesson: when product is explicit about "one flow should go through a
step, one should skip it", encode that in the state machine's **phase
transitions** (which paths touch `ProvidedImage`), not in conditional
logic scattered across the component body.

## Red flags specific to this repo

- **A new callback prop being added to both `ItemCardEditor` and
  `ImageUploadDialog`.** Unless the concern is genuinely orthogonal to
  the uploader (like `onUploadError`), it belongs on `ImageUploader` so
  only the interface grows, not every consumer.
- **A Storybook story that has to set up mock upload handlers with
  specific shapes.** Stories should mount the `ImageUploadProvider` with
  a mock `ImageUploader` — or rely on the default stub if the visual
  output of the stub is acceptable.
- **Tests that pass `uploader as ImageUploader`.** See
  [typed-test-mocks.md](./typed-test-mocks.md). The cast is almost
  always a sign the mock type is wrong, not that the interface is.
