# Agentation Annotation Schema v2

Reference copy of the Agentation annotation schema for LLM context when processing visual feedback output. Sourced from https://agentation.dev/schema.

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique annotation identifier (e.g., `ann_abc123`) |
| `comment` | `string` | Human feedback describing the issue or observation |
| `elementPath` | `string` | CSS selector path to the annotated DOM element |
| `timestamp` | `number` | Unix timestamp in milliseconds when the annotation was created |
| `x` | `number` | Horizontal position as percentage of viewport width (0&#8211;100) |
| `y` | `number` | Vertical position in pixels from document top |
| `element` | `string` | HTML tag name of the annotated element (e.g., `button`, `div`, `span`) |

## Recommended Fields

| Field | Type | Description |
|-------|------|-------------|
| `url` | `string` | Page URL where the annotation was created |
| `boundingBox` | `object` | Element bounding rectangle with `x`, `y`, `width`, `height` properties |

## Optional Context Fields

| Field | Type | Description |
|-------|------|-------------|
| `reactComponents` | `string` | React component hierarchy tree (e.g., `App > Layout > Sidebar > NavItem`) |
| `cssClasses` | `string` | CSS class list applied to the element |
| `computedStyles` | `string` | Key computed CSS properties (font-size, color, padding, etc.) |
| `accessibility` | `string` | ARIA attributes, role, and accessibility tree information |
| `nearbyText` | `string` | Visible text content in or around the element |
| `selectedText` | `string` | Text the reviewer highlighted before annotating |

## Feedback Classification

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `intent` | `enum` | `fix` &#124; `change` &#124; `question` &#124; `approve` | What the reviewer expects to happen |
| `severity` | `enum` | `blocking` &#124; `important` &#124; `suggestion` | Priority of the annotation |

### Intent Values

- **`fix`** -- Something is broken or incorrect and needs to be fixed.
- **`change`** -- A design or behavior change is requested (not a bug).
- **`question`** -- The reviewer has a question; no fix should be attempted until answered.
- **`approve`** -- The reviewer is approving this element; no changes needed.

### Severity Values

- **`blocking`** -- Must be resolved before the work can proceed.
- **`important`** -- Should be resolved but does not block progress.
- **`suggestion`** -- Nice-to-have improvement; resolve at the team's discretion.

## Lifecycle Fields

| Field | Type | Values / Description |
|-------|------|----------------------|
| `status` | `enum` | `pending` &#124; `acknowledged` &#124; `resolved` &#124; `dismissed` |
| `resolvedAt` | `string` | ISO 8601 timestamp when the annotation was resolved |
| `resolvedBy` | `enum` | `human` &#124; `agent` |
| `thread` | `array` | Array of `ThreadMessage` objects for conversation threads |

### ThreadMessage Object

| Field | Type | Description |
|-------|------|-------------|
| `author` | `string` | Name or identifier of the message author |
| `content` | `string` | Message text |
| `timestamp` | `number` | Unix timestamp in milliseconds |

## Browser / DOM Context Fields

| Field | Type | Description |
|-------|------|-------------|
| `isFixed` | `boolean` | Whether the element has `position: fixed` or `position: sticky` |
| `isMultiSelect` | `boolean` | Whether the annotation was created via drag selection of multiple elements |
| `fullPath` | `string` | Full DOM path from document root to the element |
| `nearbyElements` | `string` | Information about sibling and nearby DOM elements |

## Markdown Output Format

When exported, Agentation produces a markdown document with one section per annotation. Each section contains the fields above formatted as key-value pairs. The `agentation-feedback` skill parses this markdown to extract the structured annotation data.

Example annotation block in markdown output:

```markdown
### Annotation: ann_abc123

- **Element:** `button.primary-action`
- **Element Path:** `div.container > form > button.primary-action`
- **React Components:** `App > Dashboard > ActionPanel > SubmitButton`
- **Comment:** The button text is truncated on narrow viewports
- **Intent:** fix
- **Severity:** important
- **Selected Text:** Subm...
- **Computed Styles:** `font-size: 14px; padding: 8px 12px; overflow: hidden; text-overflow: ellipsis;`
```
