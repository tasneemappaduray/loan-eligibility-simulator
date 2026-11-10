# Loan Eligibility Simulator

A website where a customer types in their income, expenses and the loan they want, and sees straight away whether they are likely to be approved, what they would pay each month, and how affordable it is. All the data is pretend (mocked), as the brief asked.

## Run it

You need Node 24 (or newer) and npm.

```
npm ci
npm run dev
```

Then open the address it prints, usually http://localhost:5173. The pretend server waits 1500 milliseconds before it answers. To change that, copy `.env.example` to `.env` and edit `VITE_MOCK_LATENCY_MS`.

## Build it

```
npm run build      # makes the finished website files in the dist folder
npm run preview    # serves those files, so you can look at the real build
```

## Test it

```
npm test
```

This runs all the tests once: the loan maths, the decision rules, the form checks, each screen, the whole journey to a result, and accessibility checks on every page. The code checks are `npm run lint`, `npm run lint:styles` and `npm run format:check`.

## Run it with Docker

```
docker build -t loan-eligibility-simulator .
docker run --rm -p 8080:8080 loan-eligibility-simulator
```

Then open http://localhost:8080. If port 8080 is already in use, change the first number, for example `-p 8081:8080`, and open http://localhost:8081. The image serves the built app with nginx as a normal (non-root) user.

## How a loan is decided

Capitec's brief shows what goes into the check and what comes out, but not the rules. These are the rules I chose. They live in `src/config/loanRules.js`, and the "How it works" page in the app lists them in plain words.

A person is **not eligible** if they are unemployed, if their credit score is below 500, if the monthly payment is more than the money left after expenses, or if their existing debt plus the new payment is more than 50% of their income.

The approval chance (0 to 100) mixes the credit score (40%), how much of the income goes on debt (30%) and how much is left after the payment (30%). Anyone who is declined shows 0% and high risk, so the result never contradicts itself.

## Where the numbers differ from Capitec's examples

- **Monthly payment.** Capitec's example shows R7,089.50 for R150,000 over 24 months at 12.5%. The standard formula gives R7,096.10, so the app uses the formula. The interest rate also comes from the credit score, so the example customer (score 650) gets 13.41% and pays R7,160.19.
- **Loan to income.** The result shows how many times the monthly income the loan is (6× for R150,000 on R25,000). Capitec's example shows 60.0, and the brief does not say how it is worked out.
- **Loan limits.** Capitec's rules cap loans at R300,000, but the Vehicle product allows up to R1,500,000, so each loan type uses its own limits.
- **Home Loan.** I added a third loan type with invented limits (R300,000 to R5,000,000, 10 to 30 years, 10.5% to 13%). Its form asks for a property price and a deposit, and works the loan amount out as price minus deposit.
- **The pretend server** (`src/services/loanApi.js`) answers like the endpoints in `docs/api-spec`. It adds one rule that is not in Capitec's description (existing debt cannot be negative) and one extra request field, `loanType`.

## Project structure

```
src/components/  the pieces of each screen (form, result, side menu, loader, ui boxes)
src/pages/       one file for each page
src/hooks/       loading the data, sending an application, the browser tab title
src/services/    the pretend server and its data
src/utils/       loan maths, the loan decision, form checks, formatting
src/config/      the rules, page addresses, the delay setting
src/styles/      every colour is in colors.scss
Dockerfile, nginx.conf    how the app is packaged and served
.github/workflows/ci.yml  runs the checks, tests, build and Docker build on every push
```

Most files have their tests next to them, for example `loanMath.test.js`.

## Decisions and trade-offs

- **Plain JavaScript, `useState` and `useEffect`, no form library.** It is a little more code, and all of it can be read and explained.
- **The form blocks wrong typing,** so error messages rarely appear. Whole-number boxes accept only digits and money boxes accept one decimal point. Capitec's error messages are still used for what cannot be blocked, such as an empty box.
- **SCSS Modules and Framer Motion,** which respects a device's "reduce motion" setting.
- **Accessibility.** Every box has a label, errors are tied to their box, the result is announced, and the colours were checked for contrast. The one exception is the small "Created by" line in the side menu, which is faint on purpose.
- **Known limits.** Picking another loan type clears the form, and a comma is not treated as a decimal point.
