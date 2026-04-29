# Typed test mocks (ux-prototype)

Guidance for mocking TypeScript interfaces in vitest without type-safety
holes.

## The smell

```ts
type MockUploader = {
  [K in keyof ImageUploader]: ReturnType<typeof vi.fn>;
};
function makeMock(): MockUploader { /* … */ }

// In a test:
<ImageUploadProvider value={makeMock() as ImageUploader}>
```

The `as ImageUploader` cast is silencing a **real** type-system complaint:
`ReturnType<typeof vi.fn>` without a type argument resolves to the generic
`Mock<Procedure | Constructable>`, which is deliberately permissive so
`vi.fn()` is usable anywhere. It is **not** structurally compatible with
specific signatures like `(file: Blob) => Promise<string>`.

The cast says "trust me, this matches." If the `ImageUploader` interface
changes (new parameter, new return type), the mock compiles unchanged —
and you only learn at runtime that the test was exercising a mismatched
contract.

## The fix

Use vitest's built-in `Mocked<T>` utility:

```ts
import { type Mocked } from 'vitest';

type MockUploader = Mocked<ImageUploader>;

function makeMock(): MockUploader {
  return {
    uploadFile: vi.fn(async (_f: Blob) => 'cdn://stub'),
    uploadFromUrl: vi.fn(async (_u: string) => 'cdn://stub'),
    checkReachability: vi.fn(async (_u: string) => true),
  };
}

// No cast — MockUploader IS structurally an ImageUploader.
<ImageUploadProvider value={makeMock()} />
```

`Mocked<T>` maps each function member to `MockedFunction<T[K]>`, which
preserves the original signature. Helper methods (`.mockResolvedValue`,
`.mockClear`, `.mock.calls`, etc.) are still available on each member.

## Companion types (use the matching one)

- `Mocked<T>` — map an object/interface type to a fully mocked version.
- `MockedFunction<F>` — a single function mock typed against `F`.
- `MockedClass<C>` — a class mock typed against `C`.

If the thing being mocked has a mixed shape (e.g. class with some fields
not-functions), `Mocked<T>` is the right one; the non-function members
pass through unchanged.

## The rule

**Before writing `as SomeInterface` in a test, stop and ask: would
`Mocked<T>` (or `MockedFunction<F>`, `MockedClass<C>`) give me the right
type?** Almost always it will.

There are legitimate uses for `as` in tests (asserting the type of a
DOM query result, narrowing a widened union, …). `as` on the result of
a mock factory is almost never one of them.

## Specific pattern used in this repo

```ts
// ux-prototype tests consistently use Mocked<T> for controller-shaped
// mocks (ImageUploader, EntityViewer lifecycle, etc.).
import { type Mocked } from 'vitest';

type MockX = Mocked<XInterface>;

function makeMockX(overrides: Partial<XInterface> = {}): MockX {
  return {
    methodA: vi.fn(async (_a: A) => defaultA),
    methodB: vi.fn(async (_b: B) => defaultB),
    ...overrides,
  };
}
```

Keep the signatures on each `vi.fn(async (…) => …)` explicit — vitest will
infer the parameter types from usage, but an explicit signature makes the
test readable and catches drift if the interface is later tightened.
