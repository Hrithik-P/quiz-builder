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
npm run test:e2e     # end-to-end tests (Playwright), see below
npm run lint         # ESLint, must be clean
npm run typecheck
npm run format       # Prettier (also sorts Tailwind classes)
```

### End-to-end tests

`npm run test:e2e` builds the app, serves the production build and runs the Playwright tests in
`e2e/` at desktop size and at 360 px wide. The first time, install the browser with
`npx playwright install chromium`. To use a Chrome you already have instead, run
`PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`.

The main test takes a quiz from the list to the leaderboard: it answers every question (with a
reload in the middle to prove the attempt resumes), checks focus moves to each new question,
submits with Enter, and checks the results, leaderboard and quiz list. Two smaller tests cover a
quiz without retakes and the seed attempt that has already run out of time.

## 2. How data is seeded, stored and reset

- **Seed:** `src/data/seed.json` (5 users, 3 countries, 5 quizzes, 11 attempts including one in
  progress).
- **First load:** nothing is saved yet, so the store starts from the seed and writes it to
  `localStorage` under `quiz-platform:db:v1`. After that every change is saved there, so data
  survives reloads.
- **Unreadable data:** what comes out of localStorage is not trusted. If it is not valid JSON or
  not shaped like the app's data (cleared halfway, edited by hand, an older version), it is
  ignored, the seed is used, and storage is rewritten with valid data. Every record is checked
  with a Zod schema (`src/store/quizDataSchema.ts`): field types, timestamps that parse, and
  whole, non-negative counts. One bad record is enough to fall back to the seed, because it would
  otherwise crash every screen that lists it.
- **Current user:** the user picked in the switcher is saved under `quiz-platform:session:v1`, so a
  reload (or closing the tab and coming back) keeps the same person and their attempts. "Reset
  data" does not change it.
- **Reset:** the "Reset data" button on the admin page (with a confirmation) puts the seed back.
- **Who saves it:** the Zustand `persist` middleware in `src/store/quizStore.ts`. Components never
  read or write browser storage; they use the store. A change in one tab is picked up by the other
  open tabs through the browser's `storage` event.

## 3. Architecture and library choices

```
pages / hooks  ->  useQuizStore (data + actions, persisted)
                   quizQueries.ts (pure reads)  ->  scoring, timing, attempt, leaderboard (pure)
```

- `src/store/quizStore.ts`: one Zustand store holds users, countries, quizzes and attempts, and
  the actions that change them. The `persist` middleware saves it to localStorage (data only,
  never the actions).
- `src/services/`: pure functions with no storage and no clock of their own. `quizQueries.ts` reads
  from the data, `scoring.ts`, `timing.ts`, `attempt.ts` and `leaderboard.ts` do the maths, and
  `answering.ts` records an answer (deadlines, grace window, completion). Time is passed in, so
  they are easy to test, and recording an answer is a single save.
- `src/hooks/`: attempt and timer logic: `useQuizAttempt` (connects the attend screen to the
  store), `useCountdown` (remaining time from a deadline), `useServiceData` (simulated loading
  delay), `useUnsavedChangesGuard`.
- `src/pages/` are thin: they compose hooks and components. `src/components/` has `ui/`
  (domain-agnostic building blocks) and feature folders.
- `src/app/` has the route table (`routes.tsx`), the shell and its two layouts, and the error page.

**Two areas, one shell.** The app is split into a learner area (`/`: quizzes, results, leaderboard)
and an admin area (`/admin`: manage, create and edit quizzes). Both use the same `AppShell`, so
they look the same: it draws the skip link, the mobile header, the side panel or bottom navigation,
and the main area. Each area only passes in what differs: its navigation items, a link to the other
area, and its controls (`LearnerLayout` adds the user switcher; `AdminLayout` does not need one,
because admin actions do not depend on the current user). The page itself is the shell's `children`.
There is no role check: this separates the two jobs, it is not access control, and anyone can open
either area.
**Bundle.** The admin area (its layout and screens, with the form, validation and drag-and-drop
libraries) is lazy-loaded the first time it is visited, and the React and UI libraries are split into their own cached
chunks. First load went from 741 kB (231 kB gzipped) to about 538 kB (169 kB gzipped), and no chunk
is over 500 kB.

**Error handling.** Each area has React Router error boundaries in two places: around its screens,
so a crash is shown inside the shell and the navigation keeps working, and around the shell itself.
The page shows a plain message with "Try again" and "Back to quizzes", never the raw error or
stack, which are logged to the console instead. A lazy chunk that fails to download gets its own
message. Boundaries only catch errors thrown while rendering (and loading a route); errors in event
handlers are handled where they happen.

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
`getResult`, `getBestResult`, `getInProgressAttempt`, `getQuizSummary`, and
`importQuizzes(inputs)` (adds several quizzes in one save, used by the JSON import).

**Remaining time:** the data layer returns each timer's `endsAt` (an ISO timestamp) and
`totalSeconds`, not a number of seconds left. `useCountdown` turns `endsAt` into the live
countdown, so it is always computed from the clock and never drifts.

### JSON export and import

The admin page has **Export all** and **Import** buttons. Export downloads every quiz as
`quizzes-YYYY-MM-DD.json`. Import accepts a `.json` file with one quiz or many.

```json
{
  "format": "quiz-platform/quizzes",
  "version": 1,
  "exportedAt": "2026-10-21T10:00:00.000Z",
  "quizzes": [
    {
      "title": "JavaScript Basics",
      "description": "Core language concepts.",
      "countries": ["IN", "GB"],
      "timeLimitSeconds": 300,
      "perQuestionSeconds": null,
      "retakesAllowed": true,
      "questions": [
        {
          "id": "q1-1",
          "text": "Which keyword declares a constant?",
          "type": "single",
          "options": [
            { "id": "q1-1-o1", "text": "var" },
            { "id": "q1-1-o2", "text": "const" }
          ],
          "correctOptionIds": ["q1-1-o2"]
        }
      ]
    }
  ]
}
```

- A single quiz is a file with a list of one. Only this layout is accepted (not a bare list).
  Quizzes have no `id` or `revision`: the app gives each imported quiz a new id.
- **The file is not trusted.** It must be under 1 MB and valid JSON, and every quiz must pass the
  same rules as the admin form (`quizSchema`): a title, at least one question, at least two options
  per question, at least one correct option, and exactly one for single choice. It must also have
  known country codes, unique question and option ids, correct answers that point at real options,
  and option images that are `http` or `https` links.
- **All or nothing.** If anything is wrong, nothing is imported and every problem found is listed
  (the first 10, then a count), naming the quiz and the question.
- Import always adds **new copies**. Importing the same file twice gives two copies. It never
  overwrites a quiz, and attempts and the leaderboard are not touched.
- The file holds quiz definitions only, **including the correct answers**, so treat an exported
  file as admin-only.
- Export is for all quizzes at once. A save that fails (browser storage full) is reported, but the
  quizzes may stay in the open tab until it is reloaded.

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

- `localStorage` is per browser. Open tabs stay in sync through the `storage` event, but if two
  tabs save within a few milliseconds of each other, the last one wins.
- There is no real authentication: the user switcher trusts whoever uses it. Quiz input is
  validated in the form (Zod); the store does not re-validate it.
- An attempt link (`/quiz/:quizId/attempt/:attemptId`) only opens for the person who owns the
  attempt and for the quiz named in the link. Otherwise it shows "Attempt not found". This is a
  courtesy, not security: with no real login, anyone can switch to any user.
- If a tab is in the background when a question's time runs out, the browser may delay the timer
  past the grace window, and the question is then recorded as unanswered instead of with the
  selected option.

## 6. Screenshots

Desktop, light theme, on the seed data (current user: Aarav Menon).

**Quiz list:** the in-progress attempt to resume, completed quizzes with their best or final
score, and the country filter.

![Quiz list](public/Screenshot%20from%202026-10-21%2018-13-34.png)

**Leaderboard:** best attempt per player, ties to the faster finish, current user highlighted.

![Leaderboard](public/Screenshot%20from%202026-10-21%2018-14-05.png)

**Admin list:** search, sort, pagination, import, export and reset.

![Admin quiz list](public/Screenshot%20from%202026-10-21%2018-13-43.png)

**Quiz builder:** the shared add/edit form with time limits, retakes, countries and questions.

![New quiz form](public/Screenshot%20from%202026-10-21%2018-13-53.png)

## 7. AI usage

**Tool:** Claude Code.

I planned the app and made the technical decisions myself: how data is stored and handled (one
Zustand store saved to `localStorage`, with scoring and timing calculated from saved timestamps),
and which packages to use and why (see section 3). I also set the design direction.

I used Claude Code to build from that plan and to review the code as a senior frontend engineer
would, looking for bugs, security issues and edge cases. I chose which findings to fix.

**Mainly AI-generated:** boilerplate and setup, most of the tests, and most of the styling.

I reviewed and tested all of it before committing.
