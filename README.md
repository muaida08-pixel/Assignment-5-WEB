# Assignment 5 - Midnight Crate After-hours Lab

Aida Mukusheva, IT-2509. Web Technologies 1.

A standalone assignment themed around the earlier Midnight Crate project.
Open `index.html` directly or run `python3 -m http.server 8000` in this folder.
No installation, network connection, framework, jQuery or Bootstrap is required.

## Chosen options

- Task 1, option A: Higher or Lower (`task1.html`, `js/task1.js`).
  Inclusive integer prices 500-5000 KZT, three lives, equality wins,
  streak and best streak, state guards and restart without reload.
  Best streak lasts for this page visit; it is not persistent storage.
- Task 2, option A: Kanban (`task2.html`, `js/task2.js`).
  Twelve objects; three columns; capacity three in the middle column;
  priority sorting, combined search/tag filter and progress across all cards.
  One board click listener delegates card actions. `render()` builds the DOM.
  `countStatus()` uses an explicit loop. Moving a card preserves keyboard focus.
- Task 3, option A: Ticket builder (`task3.html`, `js/task3.js`).
  Seven controls, live preview, blur-then-input feedback, custom errors,
  error count and first-invalid focus, DOM result and reset after success.
  Dates: 6-8 November 2026. Tasting sold out on 7 Nov; Study on 8 Nov.
  Stock per type/event/date: Standard 8, Duo 4, VIP 2.
  VIP only for Tasting. NIGHT10 gives 10%; DUO15 gives 15% on Duo.
  A Duo ticket admits two people. Quantity counts tickets, not individuals.
  Demo stock is not decremented: no real reservations or email sending.

## Files

`index.html`: overview; `task1.html`-`task3.html`: tasks;
`css/style.css`: responsive design and state classes;
`js/task1.js`-`js/task3.js`: independent task scripts;
`fonts/`: local Montserrat files and OFL license.

## Verification

75 browser checks passed in Chromium on 23 October 2026, including:
- 375px and 1280px layouts without horizontal document overflow;
- equal/random minimum/random maximum cases, game over and restart;
- blocked moves, empty searches, sorting, extra data and delegated buttons;
- all custom form rules, dependent-field updates, reset and repeated submission;
- safe text output, selected keyboard interactions and no page JavaScript errors.

The screenshots and full check log are included in the submission package.
This does not claim testing in every browser or with a screen reader.

## Sources

- Supplied Assignment 5 brief and Week 7 lecture, Alexey Fedenko, AITU.
- Montserrat fonts, SIL Open Font License (see fonts/OFL.txt).
- Original Midnight Crate project supplies the navy/orange brand direction.

## Submission

Read the report and explain it in your own words before submission. The brief
requires individual understanding, a live defense and independent live coding.
The report is supplied separately from the website source.
