---
name: agentation-feedback
description: >
  Processes Agentation visual annotation output and translates it into
  actionable UI fix tasks. Accepts markdown with element selectors,
  component paths, and reviewer feedback. Creates GitHub issues in
  Arda-cards/management for each annotation.
argument-hint: "[paste agentation markdown output]"
---

# Processing Agentation Visual Feedback

You have received pasted Agentation markdown output from a visual UI review session. Follow these steps to parse the annotations, create a prioritized task list, and file GitHub issues for tracking.

## Step 1: Parse Annotations

Parse the pasted Agentation markdown to extract each annotation. Every annotation contains some or all of the following fields:

- **elementPath** -- CSS selector identifying the annotated DOM element
- **reactComponents** -- Component hierarchy (e.g., `App > Layout > Sidebar > NavItem`)
- **comment** -- The reviewer's written feedback
- **intent** -- One of: `fix`, `change`, `question`, `approve`
- **severity** -- One of: `blocking`, `important`, `suggestion`
- **selectedText** -- Text the reviewer highlighted (may be absent)
- **computedStyles** -- Current CSS property values on the element (may be absent)

If any field is missing from a particular annotation, treat it as absent rather than inferring a value. Collect all annotations into a structured list before proceeding.

## Step 2: Locate Source Files

For each annotation, use `Grep` to search the codebase for the component names found in `reactComponents`. Start with the leaf (most specific) component name in the hierarchy and search for its definition or export.

```
Grep pattern: "export.*function <ComponentName>|export.*const <ComponentName>"
```

Record the resolved file path for each annotation. If a component cannot be found, note it as unresolved and include the full `reactComponents` hierarchy in the task description so a developer can locate it manually.

## Step 3: Group and Sort

Group the annotations by:

1. **Severity** (blocking first, then important, then suggestion)
2. **File** (annotations targeting the same source file are grouped together)

Within each severity tier, order by file path so related fixes are adjacent.

## Step 4: Create Task List

Using `TaskCreate`, create one task per annotation, ordered by the grouping from Step 3 (blocking first).

Each task must contain:

- **subject**: `[<severity>] <component name>: <short summary of comment>`
- **description**: Include all of the following:
  - The reviewer's comment (verbatim)
  - The target file path and component name
  - The CSS selector (`elementPath`) for context
  - Suggested approach based on the intent:
    - `fix` -- Describe what appears broken and suggest a code fix
    - `change` -- Describe the requested change and suggest an implementation approach
    - `question` -- Flag for human response; do NOT suggest a fix. Mark the task description with: `NEEDS HUMAN RESPONSE: This annotation is a question from the reviewer, not an actionable fix.`
    - `approve` -- Note the approval; no fix needed. Create the task as informational only.
- **activeForm**: `Processing <component name> feedback`

## Step 5: Create GitHub Issues

For each annotation, create ONE GitHub issue in the `Arda-cards/management` repository using `mcp__github-mcp-server__issue_write`.

Do **not** attach GitHub labels. All classification metadata goes in the issue body.

### Issue Title

```
[UI Feedback] <ComponentName>: <short summary>
```

Keep the summary under 60 characters. Use the leaf component name from `reactComponents`.

### Issue Body

Use this template:

```markdown
## Classification

| Field    | Value        |
|----------|--------------|
| Intent   | `<intent>`   |
| Severity | `<severity>` |
| Category | `feedback`, `ui-review` |

## Annotation Details

**Element selector:** `<elementPath>`

**Component hierarchy:** `<reactComponents>`

**Selected text:** <selectedText or "N/A">

**Computed styles:**
<computedStyles formatted as a code block, or "N/A" if absent>

## Reviewer Comment

> <comment>

## Source Location

**File:** `<resolved file path>`
**Component:** `<leaf component name>`

## Implementation Plan

<Based on intent:>
<- fix: Describe the likely bug and suggest a concrete code change>
<- change: Describe the requested modification and suggest an approach>
<- question: "This annotation is a question from the reviewer. A team member should respond before implementation work begins.">
<- approve: "The reviewer approved this element. No changes needed.">
```

## Step 6: Summary

After creating all tasks and issues, output a summary table:

```markdown
| # | Component | Severity | Intent | Issue |
|---|-----------|----------|--------|-------|
| 1 | ...       | ...      | ...    | #NNN  |
```

Include counts: total annotations, blocking, important, suggestions, questions.

If any GitHub issue creation failed, list the failures and display the task list as a fallback so the user can create issues manually.

## Error Handling

- If the pasted content does not appear to be valid Agentation output, inform the user and ask them to verify the format. Do not guess.
- If `mcp__github-mcp-server__issue_write` is unavailable or fails, fall back to displaying the structured task list without creating issues. Inform the user that issues must be created manually.
- If a component from `reactComponents` cannot be found in the codebase, still create the task and issue but note the source location as "unresolved" and include the full component hierarchy for manual lookup.
