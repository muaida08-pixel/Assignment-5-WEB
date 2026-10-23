'use strict';
const events = [
    { id: 'tasting', name: 'Midnight tasting', soldOut: ['2026-11-07'] },
    { id: 'study', name: 'Study & snacks', soldOut: ['2026-11-08'] }
];
const ticketTypes = [
    { id: 'standard', name: 'Standard', price: 2000, seatsLeft: 8 },
    { id: 'duo', name: 'Duo (2 people)', price: 3500, seatsLeft: 4 },
    { id: 'vip', name: 'Tasting VIP', price: 5000, seatsLeft: 2 }
];
const promoCodes = [
    { code: 'NIGHT10', discount: 0.10, type: 'all' },
    { code: 'DUO15', discount: 0.15, type: 'duo' }
];
const form = document.getElementById('ticket-form');
const fields = Array.from(form.querySelectorAll('input, select'));
const touched = new Set();
let submitted = false;
const summary = document.getElementById('error-summary');
const preview = document.getElementById('ticket-preview');
const result = document.getElementById('ticket-result');
form.noValidate = true;

function readData() {
    return {
        event: document.getElementById('event').value,
        date: document.getElementById('date').value,
        type: document.getElementById('ticket-type').value,
        quantity: Number(document.getElementById('quantity').value),
        name: document.getElementById('full-name').value.trim(),
        email: document.getElementById('email').value.trim(),
        promo: document.getElementById('promo').value.trim().toUpperCase()
    };
}
function selectedType(data) {
    return ticketTypes.find(function (type) { return type.id === data.type; });
}
function selectedPromo(data) {
    return promoCodes.find(function (promo) { return promo.code === data.promo; });
}
function validateField(field, data) {
    // Clear the old custom error before asking the browser about HTML constraints.
    field.setCustomValidity('');
    let error = '';
    if (!field.checkValidity()) {
        if (field.validity.valueMissing) error = 'Please complete this field.';
        else if (field.validity.typeMismatch) error = 'Enter an email such as aida@example.com.';
        else if (field.id === 'date') error = 'Choose a date from 6 to 8 November 2026.';
        else if (field.id === 'quantity') error = 'Enter a whole number from 1 to 8.';
        else error = 'Check the length and format of this value.';
    }
    const chosenEvent = events.find(function (item) { return item.id === data.event; });
    const type = selectedType(data);
    const promo = selectedPromo(data);
    if (!error && field.id === 'date' && chosenEvent && chosenEvent.soldOut.includes(data.date)) {
        error = 'This date is sold out for ' + chosenEvent.name + '. Choose another date.';
    }
    if (!error && field.id === 'ticket-type' && data.type === 'vip' && data.event !== 'tasting') {
        error = 'VIP tickets are only available for Midnight tasting.';
    }
    if (!error && field.id === 'quantity' && type && data.quantity > type.seatsLeft) {
        error = 'Only ' + type.seatsLeft + ' ' + type.name + ' tickets are left for this event and date.';
    }
    if (!error && field.id === 'full-name' && (data.name.length < 2 || data.name.length > 60)) {
        error = 'Use 2–60 characters after removing spaces at the edges.';
    }
    if (!error && field.id === 'promo' && data.promo !== '') {
        if (!promo) error = 'Unknown code. Use NIGHT10 or DUO15, or leave it empty.';
        else if (promo.type !== 'all' && promo.type !== data.type) error = 'DUO15 is valid only with a Duo ticket.';
    }
    field.setCustomValidity(error);
    return error;
}
function showErrors(data) {
    let firstInvalid = null;
    let count = 0;
    for (const field of fields) {
        const error = validateField(field, data);
        const show = touched.has(field.id) || submitted;
        const message = document.getElementById(field.id + '-error');
        message.textContent = show ? error : '';
        message.hidden = !show || error === '';
        if (show) field.setAttribute('aria-invalid', String(error !== ''));
        else field.removeAttribute('aria-invalid');
        if (error) {
            count += 1;
            if (!firstInvalid) firstInvalid = field;
        }
    }
    summary.hidden = !submitted || count === 0;
    summary.textContent = count + (count === 1 ? ' field needs attention.' : ' fields need attention.') + ' Please correct the errors below.';
    return firstInvalid;
}
function node(tag, text) {
    const item = document.createElement(tag);
    item.textContent = text;
    return item;
}
function totalFor(data) {
    const type = selectedType(data);
    const promo = selectedPromo(data);
    const eligible = promo && (promo.type === 'all' || promo.type === data.type);
    const quantityField = document.getElementById('quantity');
    if (!type || !quantityField.validity.valid) return null;
    const subtotal = type.price * data.quantity;
    return Math.round(subtotal * (eligible ? 1 - promo.discount : 1));
}
function renderPreview(data) {
    preview.textContent = '';
    const chosenEvent = events.find(function (item) { return item.id === data.event; });
    const type = selectedType(data);
    const list = node('dl', '');
    const values = [
        ['Event', chosenEvent ? chosenEvent.name : 'Choose an event'],
        ['Date', data.date || 'Choose a date'],
        ['Ticket', type ? type.name : 'Choose a ticket'],
        ['Quantity', Number.isInteger(data.quantity) && data.quantity > 0 ? String(data.quantity) : 'Enter a quantity'],
        ['Guest', data.name || 'Your name'],
        ['Email', data.email || 'Your email'],
        ['Promo', data.promo || 'No promo code']
    ];
    for (const [label, value] of values) {
        const row = node('div', '');
        row.append(node('dt', label), node('dd', value));
        list.appendChild(row);
    }
    preview.appendChild(list);
    const total = totalFor(data);
    const amount = node('p', total === null ? 'Total pending' : total.toLocaleString('en-US') + ' ₸');
    amount.classList.add('total');
    preview.appendChild(amount);
    preview.appendChild(node('small', 'Estimated total. Invalid or ineligible promo codes are not applied.'));
}
function update() {
    const data = readData();
    const invalid = showErrors(data);
    renderPreview(data);
    return invalid;
}
// blur does not bubble; capture=true lets this single form listener catch it.
form.addEventListener('blur', function (event) {
    if (!fields.includes(event.target)) return;
    touched.add(event.target.id);
    update();
}, true);
form.addEventListener('input', update);
form.addEventListener('change', update);
form.addEventListener('submit', function (event) {
    event.preventDefault();
    submitted = true;
    const firstInvalid = update();
    if (firstInvalid) {
        firstInvalid.focus();
        return;
    }
    const data = readData();
    const chosenEvent = events.find(function (item) { return item.id === data.event; });
    const type = selectedType(data);
    const code = 'MC-' + Math.floor(Math.random() * 900000 + 100000);
    result.textContent = '';
    result.appendChild(node('h2', 'Your demo ticket is ready.'));
    result.appendChild(node('p', 'Booking code: ' + code));
    result.appendChild(node('p', chosenEvent.name + ' / ' + data.date));
    result.appendChild(node('p', data.quantity + ' × ' + type.name + ' / ' + totalFor(data).toLocaleString('en-US') + ' ₸'));
    result.appendChild(node('p', data.name + ' / ' + data.email));
    result.appendChild(node('small', 'Local demonstration. No email is sent and demo inventory is not reserved.'));
    result.hidden = false;
    form.reset();
    result.focus();
});
form.addEventListener('reset', function () {
    // reset fires BEFORE native values reset; run afterwards to read fresh defaults.
    queueMicrotask(function () {
        touched.clear();
        submitted = false;
        for (const field of fields) field.setCustomValidity('');
        update();
    });
});
update();
