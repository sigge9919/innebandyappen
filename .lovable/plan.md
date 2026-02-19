
## Add Multi-Player Test Entry Support

### Goal
When adding a new test result, the coach can choose between "Single Player" mode (current behaviour) and "Group Test" mode — where all test fields (name, type, date) are shared, and each player gets their own result, previous result, and trend inputs.

### How it works today
`TestResultFormDialog` handles one player at a time. It calls `onSave(test: TestResult)` once with a single record. The `Development.tsx` page calls `addTest` once per save.

### What changes

#### 1. `src/components/forms/TestResultFormDialog.tsx`
This is the core change. When creating a new test (not editing), a **toggle** at the top lets the coach switch between:

- **Single Player** — current form, unchanged
- **Group Test** — shared fields (test name, type, date) at the top, then a list of all players, each with their own result input, previous result, and trend selector. Players are opted-in via a checkbox. Only checked players are saved.

The `onSave` prop signature stays `(test: TestResult) => void`, but we need to call it multiple times (once per selected player). To handle this cleanly:

- Change `onSave` to `onSave: (tests: TestResult[]) => void` — an array, even when single
- This is a local-only interface change; callers need updating

#### 2. `src/pages/Development.tsx`
Update `handleSaveTest` to iterate over the array of `TestResult` objects returned and call `addTest` for each one (or `updateTest` for single edits).

#### 3. `src/components/team/PlayerTestResults.tsx` (if it uses the dialog)
Check and update the `onSave` call-site if this dialog is reused on the player detail page.

### Form layout for Group Test mode

```text
┌─────────────────────────────────────────┐
│  Add Test Result                        │
│  [Single Player]  [Group Test]  ← tabs  │
│                                         │
│  Test Name: ___________________________  │
│  Type: [Fitness ▼]   Date: [__/__/__]   │
│                                         │
│  Players                         Result │
│  ☑ #11 Smith              4.2s  [____]  │
│  ☑ #7  Jones              4.5s  [____]  │
│  ☐ #3  Lee                              │
│  ...                                    │
│                                         │
│           [Cancel]  [Save X Results]    │
└─────────────────────────────────────────┘
```

Each checked player row has:
- Checkbox to include/exclude
- Player name & jersey number
- Result input (required when checked)
- Previous result input (optional)
- Trend select (up / same / down)

### Files to edit
| File | Change |
|---|---|
| `src/components/forms/TestResultFormDialog.tsx` | Add mode toggle + group entry UI; update `onSave` to return `TestResult[]` |
| `src/pages/Development.tsx` | Update `handleSaveTest` to loop and call `addTest` for each result |
| `src/components/team/PlayerTestResults.tsx` | Update `onSave` call-site if this dialog is used there |

### No database schema changes needed
The `test_results` table already stores one row per player per test — exactly what this feature produces.
