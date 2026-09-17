const { test } = require('node:test');
const assert = require('node:assert/strict');
const { compile } = require('../../detect.js');

// Returns the matched text, which reads better in failures than offsets.
const find = (config, text) => compile(config).find(text).map(([s, e]) => text.slice(s, e));

test('email: finds an address with a plus tag and a multi-part domain', () => {
  assert.deepEqual(
    find({ types: ['email'] }, 'Contact jane.doe+work@mail.example.co.uk today'),
    ['jane.doe+work@mail.example.co.uk'],
  );
});

test('email: ignores text with an @ but no domain', () => {
  assert.deepEqual(find({ types: ['email'] }, 'Follow @veil on social, or user@localhost'), []);
});

test('money: finds amounts with symbols, codes and short forms', () => {
  assert.deepEqual(
    find({ types: ['money'] }, 'Paid $1,240.50, then 1.240,50 €, USD 99, 99 BDT, US$3.2m and ₹3 lakh'),
    ['$1,240.50', '1.240,50 €', 'USD 99', '99 BDT', 'US$3.2m', '₹3 lakh'],
  );
});

test('money: finds Indian lakh grouping in full', () => {
  assert.deepEqual(
    find({ types: ['money'] }, 'Rs. 1,00,000 and ₹12,34,56,789.50 and Tk 1,00,000'),
    ['Rs. 1,00,000', '₹12,34,56,789.50', 'Tk 1,00,000'],
  );
});

test('money: ignores numbers without a currency', () => {
  assert.deepEqual(find({ types: ['money'] }, 'Version 1.2.3, 12 Mbps, 45%, year 2026, 1,234 users'), []);
});

test('phone: finds international, bracketed, dashed and local numbers', () => {
  assert.deepEqual(
    find({ types: ['phone'] }, 'Call +880 1712-345678, (555) 123-4567, 555-123-4567 or 01712345678.'),
    ['+880 1712-345678', '(555) 123-4567', '555-123-4567', '01712345678'],
  );
});

test('phone: ignores dates, IDs, grouped amounts, cards and IBANs', () => {
  assert.deepEqual(
    find(
      { types: ['phone'] },
      'On 2026-09-17 12:30, order 123456789, total 1 234 567 890, card 4242 4242 4242 4242, IBAN DE89 3704 0044 0532 0130 00',
    ),
    [],
  );
});

test('card: finds numbers that pass the Luhn check and skips those that fail', () => {
  assert.deepEqual(
    find({ types: ['card'] }, 'Good 4242 4242 4242 4242, also 5555-5555-5555-4444, bad 4242 4242 4242 4241'),
    ['4242 4242 4242 4242', '5555-5555-5555-4444'],
  );
});

test('iban: finds valid IBANs with and without spaces and skips a bad checksum', () => {
  assert.deepEqual(
    find({ types: ['iban'] }, 'DE89 3704 0044 0532 0130 00, GB82WEST12345698765432, bad GB00WEST12345698765432'),
    ['DE89 3704 0044 0532 0130 00', 'GB82WEST12345698765432'],
  );
});

test('key: finds known API key and token formats', () => {
  // Fake keys are joined at runtime so that secret scanners do not flag this file.
  const fake = (prefix, body) => prefix + body;
  const keys = [
    fake('sk_live_', 'abc123def456'),
    fake('ghp_', 'abcdefghijklmnopqrstuvwxyz0123456789'),
    fake('shpat_', '0123456789abcdef'.repeat(2)),
    fake('AKIA', 'IOSFODNN7EXAMPLE'),
    fake('xoxb-', '1234567890-abcdefghij'),
    fake('eyJ', 'hbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U'),
  ];
  assert.deepEqual(find({ types: ['key'] }, keys.join(' and ')), keys);
});

test('key: ignores ordinary snake_case words', () => {
  assert.deepEqual(find({ types: ['key'] }, 'Set user_name and sk_live in the api_key field'), []);
});

test('ip: finds IPv4 addresses and skips out-of-range octets', () => {
  assert.deepEqual(
    find({ types: ['ip'] }, 'Hosts 192.168.1.10 and 8.8.8.8, bad 10.0.0.256, version 1.2.3'),
    ['192.168.1.10', '8.8.8.8'],
  );
});

test('custom: plain entries match without case and escape special characters', () => {
  assert.deepEqual(
    find({ custom: ['Project Falcon', 'a.b (beta)'] }, 'project FALCON ships as a.b (beta), not axb (beta)'),
    ['project FALCON', 'a.b (beta)'],
  );
});

test('custom: entries between slashes are regular expressions, and invalid ones are ignored', () => {
  assert.deepEqual(find({ custom: ['/INV-\\d+/', '/[unclosed/'] }, 'Invoice INV-2201 and INV-7'), ['INV-2201', 'INV-7']);
});

test('only the selected types are detected', () => {
  assert.deepEqual(find({ types: ['email'] }, 'Pay $5 to jane@example.com'), ['jane@example.com']);
});

test('an empty configuration detects nothing', () => {
  const m = compile({});
  assert.equal(m.empty, true);
  assert.deepEqual(m.find('Pay $5 to jane@example.com'), []);
});

test('overlapping matches merge into one span', () => {
  assert.deepEqual(
    find({ types: ['money'], custom: ['total $5'] }, 'The total $5 is due'),
    ['total $5'],
  );
});
