'use strict';
// All game numbers live here. The rest of the game uses these constants.
const MIN_PRICE = 500;
const MAX_PRICE = 5000;
const START_LIVES = 3;
const ZERO = 0;
const ONE = 1;

let currentPrice = randomPrice();
let lives = START_LIVES;
let streak = ZERO;
let bestStreak = ZERO;
let message = 'Choose Higher or Lower to reveal the next price.';
let resultClass = '';
const controls = document.getElementById('game-controls');
const feedback = document.getElementById('game-message');

function randomPrice() {
    // Each integer has the same chance, including the smallest and largest.
    return Math.floor(Math.random() * (MAX_PRICE - MIN_PRICE + ONE)) + MIN_PRICE;
}
function money(value) {
    return value.toLocaleString('en-US') + ' ₸';
}
function renderGame() {
    document.getElementById('current-price').textContent = money(currentPrice);
    document.getElementById('price-range').textContent = money(MIN_PRICE) + ' to ' + money(MAX_PRICE) + ' / whole tenge';
    document.getElementById('lives').textContent = lives;
    document.getElementById('streak').textContent = streak;
    document.getElementById('best').textContent = bestStreak;
    feedback.textContent = message;
    feedback.classList.toggle('win', resultClass === 'win');
    feedback.classList.toggle('loss', resultClass === 'loss');
    for (const button of controls.querySelectorAll('button')) button.disabled = lives === ZERO;
}
function play(guess) {
    // Guard clauses reject invalid moves BEFORE changing the game state.
    if (lives === ZERO) {
        feedback.textContent = 'Game over. Start a new round to play again.';
        return;
    }
    if (guess !== 'higher' && guess !== 'lower') {
        feedback.textContent = 'Choose Higher or Lower. Your score has not changed.';
        return;
    }
    const nextPrice = randomPrice();
    const equal = nextPrice === currentPrice;
    const correct = equal || (guess === 'higher' && nextPrice > currentPrice) || (guess === 'lower' && nextPrice < currentPrice);
    if (equal) {
        streak += ONE;
        message = 'Same price! ' + money(nextPrice) + ' counts as a correct guess.';
        resultClass = 'win';
    } else if (correct) {
        streak += ONE;
        message = 'Correct! ' + money(currentPrice) + ' → ' + money(nextPrice) + '.';
        resultClass = 'win';
    } else {
        lives -= ONE;
        streak = ZERO;
        message = 'Not this time: ' + money(currentPrice) + ' → ' + money(nextPrice) + '. One life lost.';
        resultClass = 'loss';
    }
    bestStreak = Math.max(bestStreak, streak);
    currentPrice = nextPrice;
    if (lives === ZERO) message += ' Game over. Start a new round.';
    renderGame();
    if (lives === ZERO) document.getElementById('restart').focus();
}
controls.addEventListener('click', function (event) {
    const button = event.target.closest('button');
    if (button && controls.contains(button)) play(button.dataset.guess);
});
document.getElementById('restart').addEventListener('click', function () {
    lives = START_LIVES;
    streak = ZERO;
    currentPrice = randomPrice();
    message = 'New round. Your best streak is kept for this visit.';
    resultClass = '';
    renderGame();
    controls.querySelector('button').focus();
});
renderGame();
