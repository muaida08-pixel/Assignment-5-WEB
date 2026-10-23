'use strict';
const MAX_IN_PROGRESS = 3;
// id/string, title/string, priority/number, tag/string, status/string, urgent/boolean.
const initialCards = [
    { id: 'tea', title: 'Brew the midnight tea', priority: 1, tag: 'food', status: 'todo', urgent: true },
    { id: 'noodles', title: 'Prepare noodle cups', priority: 1, tag: 'food', status: 'todo', urgent: false },
    { id: 'cookies', title: 'Pack oat cookies', priority: 3, tag: 'food', status: 'todo', urgent: false },
    { id: 'labels', title: 'Print allergen labels', priority: 1, tag: 'food', status: 'doing', urgent: true },
    { id: 'lights', title: 'Set up table lights', priority: 2, tag: 'setup', status: 'todo', urgent: false },
    { id: 'signs', title: 'Place welcome signs', priority: 3, tag: 'setup', status: 'todo', urgent: false },
    { id: 'tables', title: 'Arrange study tables', priority: 1, tag: 'setup', status: 'doing', urgent: false },
    { id: 'music', title: 'Choose a quiet playlist', priority: 3, tag: 'setup', status: 'done', urgent: false },
    { id: 'tickets', title: 'Check the ticket list', priority: 1, tag: 'guests', status: 'todo', urgent: true },
    { id: 'messages', title: 'Prepare arrival reminders', priority: 2, tag: 'guests', status: 'todo', urgent: false },
    { id: 'seats', title: 'Mark reserved seats', priority: 2, tag: 'guests', status: 'todo', urgent: false },
    { id: 'welcome', title: 'Write the welcome note', priority: 3, tag: 'guests', status: 'done', urgent: false }
];
const columns = [
    { id: 'todo', title: 'To do' },
    { id: 'doing', title: 'In progress' },
    { id: 'done', title: 'Done' }
];
let cards = initialCards.map(function (card) { return { ...card }; });
const board = document.getElementById('board');
const search = document.getElementById('search');
const tagFilter = document.getElementById('tag-filter');
const prioritySort = document.getElementById('priority-sort');
const boardMessage = document.getElementById('board-message');

function countStatus(status) {
    let count = 0;
    for (const card of cards) {
        if (card.status === status) count += 1;
    }
    return count;
}
function element(tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.classList.add(className);
    return node;
}
function announce(text, blocked) {
    boardMessage.textContent = text;
    boardMessage.classList.toggle('danger', blocked);
}
function render() {
    // Remember a card button before replacing DOM nodes, preserving keyboard navigation.
    const focused = document.activeElement;
    const focusId = focused.dataset.id;
    const focusAction = focused.dataset.action;
    board.textContent = '';
    const query = search.value.trim().toLowerCase();
    const visible = cards.filter(function (card) {
        return card.title.toLowerCase().includes(query) && (tagFilter.value === 'all' || card.tag === tagFilter.value);
    });
    visible.sort(function (a, b) {
        return prioritySort.value === 'high' ? a.priority - b.priority : b.priority - a.priority;
    });
    document.getElementById('empty-results').hidden = visible.length !== 0;
    for (const column of columns) {
        const section = element('section', '', 'column');
        section.dataset.status = column.id;
        const title = element('h2', column.title + ' / ' + countStatus(column.id));
        section.appendChild(title);
        let shown = 0;
        for (const card of visible) {
            if (card.status !== column.id) continue;
            shown += 1;
            const article = element('article', '', 'card');
            const badge = element('span', ['','High','Medium','Low'][card.priority] + ' priority', 'badge');
            badge.classList.add('priority-' + card.priority);
            article.appendChild(badge);
            article.appendChild(element('h3', card.title));
            article.appendChild(element('p', card.tag + (card.urgent ? ' / Time-sensitive' : ' / Routine prep')));
            const actions = element('div', '', 'actions');
            const position = columns.findIndex(function (item) { return item.id === card.status; });
            for (const offset of [-1, 1]) {
                const target = columns[position + offset];
                if (!target) continue;
                const button = element('button', (offset < 0 ? '← ' : '→ ') + target.title, 'secondary');
                button.type = 'button';
                button.dataset.id = card.id;
                button.dataset.action = target.id;
                button.setAttribute('aria-label', 'Move ' + card.title + ' to ' + target.title);
                actions.appendChild(button);
            }
            article.appendChild(actions);
            section.appendChild(article);
        }
        if (shown === 0) section.appendChild(element('p', 'No matching cards in this column.', 'empty'));
        board.appendChild(section);
    }
    const done = countStatus('done');
    const percent = cards.length === 0 ? 0 : Math.round(done / cards.length * 100);
    document.getElementById('board-progress').value = percent;
    document.getElementById('progress-text').textContent = done + ' of ' + cards.length + ' finished / ' + percent + '% (all cards)';
    if (focusId) {
        const candidates = Array.from(board.querySelectorAll('button')).filter(function (button) { return button.dataset.id === focusId; });
        const nextFocus = candidates.find(function (button) { return button.dataset.action === focusAction; }) || candidates[0];
        if (nextFocus) nextFocus.focus();
    }
}
// One delegated listener handles every card, including cards created by render().
board.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-id]');
    if (!button || !board.contains(button)) return;
    const card = cards.find(function (item) { return item.id === button.dataset.id; });
    const target = button.dataset.action;
    const fromIndex = columns.findIndex(function (item) { return card && item.id === card.status; });
    const toIndex = columns.findIndex(function (item) { return item.id === target; });
    if (!card || toIndex < 0 || Math.abs(toIndex - fromIndex) !== 1) {
        announce('Invalid move. Cards can move only to the next or previous column.', true);
        return;
    }
    if (target === 'doing' && countStatus('doing') >= MAX_IN_PROGRESS) {
        announce('Move blocked: In progress already has ' + MAX_IN_PROGRESS + ' cards. Move one out first.', true);
        return;
    }
    card.status = target;
    announce(card.title + ' moved to ' + columns[toIndex].title + '.', false);
    render();
});
search.addEventListener('input', render);
tagFilter.addEventListener('change', render);
prioritySort.addEventListener('change', render);
document.getElementById('reset-board').addEventListener('click', function () {
    cards = initialCards.map(function (card) { return { ...card }; });
    search.value = '';
    tagFilter.value = 'all';
    prioritySort.value = 'high';
    announce('Board reset to the original 12 cards.', false);
    render();
});
render();
