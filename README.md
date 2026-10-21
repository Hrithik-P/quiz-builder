# Quiz Platform

A frontend-only quiz platform built with React and TypeScript: quiz list, quiz admin, a timed
quiz-taking flow that survives reloads, results and a leaderboard. There is no backend and no API
(real or mocked). All data is seeded from `src/data/seed.json` and saved in `localStorage`.

## 1. Setup and run

Requires Node `>=20.19` and npm.

```bash
npm install
npm run dev          # dev server at http://localhost:5173
npm run build        # type-check and production build
npm test             # unit and component tests (Vitest)
npm run lint         # ESLint, must be clean
npm run typecheck
npm run format       # Prettier (also sorts Tailwind classes)
```

## 2. How data is seeded, stored and reset

- **Seed:** `src/data/seed.json` (5 users, 3 countries, 5 quizzes, 11 attempts including one in
  progress).
- **First load:** nothing is saved yet, so the store starts from the seed and writes it to
  `localStorage` under `quiz-platform:db:v1`. After that every change is saved there, so data
  survives reloads.
- **Reset:** the "Reset data" button on the admin page (with a confirmation) puts the seed back.
- **Who saves it:** the Zustand `persist` middleware in `src/store/quizStore.ts`. Components never
  read or write browser storage; they use the store.

## 3. Architecture and library choices

```
pages / hooks  ->  useQuizStore (data + actions, persisted)
                   quizQueries.ts (pure reads)  ->  scoring, timing, attempt, leaderboard (pure)
```

- `src/store/quizStore.ts`: one Zustand store holds users, countries, quizzes and attempts, and
  the actions that change them. The `persist` middleware saves it to localStorage (data only,
  never the actions).
- `src/services/`: pure functions with no storage and no clock of their own. `quizQueries.ts` reads
  from the data, `scoring.ts`, `timing.ts`, `attempt.ts` and `leaderboard.ts` do the maths. Time is
  passed in, so they are easy to test.
- `src/hooks/`: attempt and timer logic: `useQuizAttempt` (connects the attend screen to the
  store), `useCountdown` (remaining time from a deadline), `useServiceData` (simulated loading
  delay), `useUnsavedChangesGuard`.
- `src/pages/` are thin: they compose hooks and components. `src/components/` has `ui/`
  (domain-agnostic building blocks) and feature folders.

**State: Zustand with `persist`.** One store is the single source of truth. Screens read it with
`useQuizData()`, so after any action (a finished attempt, an admin edit) every screen that shows
that data re-renders on its own: the quiz list and leaderboard reflect a new attempt with no
extra wiring. Context with `useReducer` would re-render every consumer, and Redux Toolkit is more
ceremony than a frontend-only app needs.

| Library                      | Why                                                              |
| ---------------------------- | ---------------------------------------------------------------- |
| React Router                 | Deep-linkable routes for every screen.                           |
| Zustand (`persist`)          | Small, selector-based, and saves to localStorage for us.         |
| React Hook Form + Zod        | Dynamic question builder with inline validation; types from Zod. |
| shadcn/ui (Radix) + Tailwind | Accessible primitives (dialogs, selects) and semantic tokens.    |
| dnd-kit                      | Accessible drag-and-drop reordering in the builder.              |
| Vitest + Testing Library     | Fast tests with fake timers.                                     |

## 4. Data models and data layer

Models are in `src/types/models.ts`; view types returned to the UI are in `src/types/views.ts`.
Two optional fields were added to the seed shape (the seed stays valid without them):

- `Quiz.revision` is bumped every time a quiz is saved.
- `Attempt.quizRevision` is the revision the attempt started on. A mismatch means "the quiz was
  edited while you were taking it".

The required operations are not one service object. Writes are actions on the store, and reads
are pure functions over the stored data (`const data = useQuizData()`):

| Operation                                                      | Where and behaviour                                                                                                                                                                                       |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getQuizzes(userId, country?)`                                 | `getQuizzes(data, userId, country?)`. Filtered by country (none means all); each quiz has `completed`, `bestScore`, `bestPercentage`.                                                                     |
| `getQuiz(quizId)`                                              | `getQuizInfo(data, quizId)`: details and question count, no questions or answers.                                                                                                                         |
| `createQuiz(data)` / `updateQuiz(id, data)` / `deleteQuiz(id)` | Store actions, including assigned countries. Attempts are kept when a quiz is deleted.                                                                                                                    |
| `startOrResumeAttempt(quizId, userId)`                         | Store action. Returns `{ ok: true, attempt }` (the in-progress one, or a new one) or `{ ok: false, reason }` (`not_found`, `retake_not_allowed`).                                                         |
| `getCurrentQuestion(attemptId)`                                | `getCurrentQuestion(data, attemptId)`: `AttemptState`, one of `question` (question without correct answers, index, total, timers), `completed`, `quiz_unavailable`, `not_found`.                          |
| `submitAnswer(attemptId, questionId, optionIds)`               | Store action. Records the answer and returns the next `AttemptState`. A submission for a question that is no longer current is ignored, so repeated clicks cannot double-answer.                          |
| `completeAttempt(attemptId)`                                   | Store action. Idempotent. Returns score, percentage, correct/incorrect counts and time taken.                                                                                                             |
| `getLeaderboard(quizId, limit?)`                               | `getLeaderboard(data, quizId, limit?)`. Best attempt per user, ranked by score then faster time. Without `limit` everyone is returned, so the page can show the current user's rank outside the top list. |
| Reset data                                                     | `resetData()` store action.                                                                                                                                                                               |

Also: `refreshAttempt(attemptId)` (applies time that passed while an attempt was closed),
`getResult`, `getBestResult`, `getInProgressAttempt`, `getQuizSummary`.

**Remaining time:** the data layer returns each timer's `endsAt` (an ISO timestamp) and
`totalSeconds`, not a number of seconds left. `useCountdown` turns `endsAt` into the live
countdown, so it is always computed from the clock and never drifts.

### How timing works

Nothing counts down in the store or in component state. Deadlines come from stored timestamps:
the overall deadline is `startedAt + timeLimitSeconds`, and a question's deadline is the previous
answer's time (or `startedAt`) plus `perQuestionSeconds`.

- **Settling:** when an attempt is opened, answered or completed, deadlines that have passed are
  applied. Unanswered questions get an empty answer stamped at their deadline, and the attempt
  completes when the overall limit or the last question is reached. Time spent away, a reload, or
  a throttled background tab therefore always counts.
- **Timeout submits the current answer:** while the page is open, `useCountdown` fires at the
  deadline and the screen submits the selected options. The store accepts that submission within
  `SUBMIT_GRACE_MS` (2 s) after the deadline and stamps it at the deadline. After that window the
  question is recorded as unanswered.
- **The seed's expired attempt (`a11`)** is completed as soon as it is resumed, using only the
  answers it already had, with time taken equal to the time limit.

## 5. Assumptions, limitations and improvements

**Assumptions**

- **Seed timestamps:** in several completed seed attempts the last `answeredAt` is slightly after
  `completedAt`. Completed attempts are treated as snapshots: their stored score and time are
  trusted (a test checks each stored score matches its stored answers). For new attempts, time
  taken is `completedAt - startedAt` (capped at the deadline) and `answeredAt` is never used for it.
- Scoring is one point per question, and a question is correct only if the selected set equals
  the correct set (no partial credit).
- Saving a quiz in the admin always counts as an edit: an attempt in progress on it stops with
  "this quiz was changed", and the user can start again.
- Deleting a quiz keeps its attempts so the attempt screen can say it was deleted.
- An attempt only gets its expired time applied when it is opened, answered or completed, so an
  expired attempt shows as "in progress" in the list until the user opens it.
- The simulated loading delay (500 ms) lives in `useServiceData`. Store actions are synchronous.

**Known limitations**

- `localStorage` is per browser. `persist` does not sync changes between open tabs, so a second
  tab shows the older data until it is reloaded.
- There is no real authentication: the user switcher trusts whoever uses it. Quiz input is
  validated in the form (Zod); the store does not re-validate it.
- If a tab is in the background when a question's time runs out, the browser may delay the timer
  past the grace window, and the question is then recorded as unanswered instead of with the
  selected option.
- No end-to-end test yet.

**With more time**

- A Playwright test of the full take-quiz path, and screenshots or a recording of the attend flow
  on mobile and desktop.
- Lazy-load the admin routes, JSON export/import of quizzes, an image upload/URL field for answer
  options in the builder (options already render an `imageUrl` when present), and i18n.
- Sync tabs with a `storage` event listener, and share the Zod quiz schema with the store.

## Project conventions

See `CLAUDE.md` for the code standards used in this repository (naming, hooks, testing,
accessibility).
