// Veil sensitive data detection. Pure text matching with no DOM access.
// Loaded as a content script before content.js, and as a module by the tests.
(() => {
  const SYM = '(?:[A-Z]{1,2}\\$|[$€£¥₹৳₽₩₺₫₱₪₦₴฿₡₲₵₸₭₮¢﷼]|(?<![A-Za-z])(?:Rs|Tk|RM)\\.?(?![A-Za-z]))';
  const CODE = '(?<![A-Za-z])(?:USD|EUR|GBP|BDT|INR|JPY|CNY|RMB|AUD|CAD|SGD|HKD|NZD|AED|SAR|QAR|KWD|CHF|SEK|NOK|DKK|PLN|CZK|HUF|PKR|LKR|NPR|MYR|IDR|THB|PHP|VND|KRW|TWD|ZAR|BRL|MXN|ARS|CLP|COP|RUB|UAH|TRY|EGP|NGN|KES|ILS)(?![A-Za-z])';
  const NUM = "\\d{1,2}(?:,\\d{2})+,\\d{3}(?:\\.\\d{1,2})?|\\d{1,3}(?:[,.\\u00a0\\u202f']\\d{3})+(?:[.,]\\d{1,2})?|\\d+(?:[.,]\\d{1,2})?";
  const SUF = '(?:\\s?(?:[kKmMbB]n?|million|billion|thousand|lakh|crore)(?![A-Za-z]))?';
  const PRE = `[-−]?(?:${SYM}|${CODE})\\s?[-−]?(?:${NUM})${SUF}`;
  const POST = `[-−]?(?:${NUM})${SUF}\\s?(?:${SYM}|${CODE})`;
  const MONEY_RE = new RegExp(`${PRE}|${POST}`, 'gu');
  const FULL_RE = new RegExp(`^(?:${PRE}|${POST})$`, 'u');
  const PART_RE = new RegExp(`^(?:${SYM}|${CODE}|[-−]?(?:${NUM})${SUF})$`, 'u');
  const MONEY_WORDS = /(?<![A-Za-z])(?:total|sub-?total|grand total|price|prices|balance|amount|revenue|mrr|arr|salary|cost|costs|payment|payments|paid|due|fee|fees|income|profit|sales|earnings|budget|tax|refund|invoice|spent|spend|payout|net|gross|commission|discount)(?![A-Za-z])/i;
  const BARE_NUM_RE = /(?<![\d.,])(?:\d{1,2}(?:,\d{2})+,\d{3}(?:\.\d{1,2})?|\d{1,3}(?:[,.]\d{3})+(?:[.,]\d{1,2})?|\d+[.,]\d{2}|\d{3,})(?![\d.,]*\d)/g;
  const PURE_BARE_RE = /^(?:\d{1,2}(?:,\d{2})+,\d{3}(?:\.\d{1,2})?|\d{1,3}(?:[,.]\d{3})+(?:[.,]\d{1,2})?|\d+[.,]\d{2}|\d{3,})$/;

  function okPhone(s) {
    const d = s.replace(/\D/g, '');
    if (d.length < 9 || d.length > 15) return false;
    if (/^\d{4}-\d{1,2}-\d{1,2}/.test(s)) return false;          // a date
    if (/[+(]/.test(s)) return true;
    if (/^\d{1,3}(?:[ \u00a0]\d{3})+$/.test(s)) return false;     // 1 234 567 890
    if (/[ \u00a0-]/.test(s)) return true;
    return /^0\d{9,11}$/.test(s);                                  // 01712345678
  }

  function okCard(s) {
    const d = s.replace(/\D/g, '');
    if (d.length < 13 || d.length > 19) return false;
    let sum = 0;
    for (let i = 0; i < d.length; i++) {
      let n = +d[d.length - 1 - i];
      if (i % 2) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
    }
    return sum % 10 === 0;
  }

  function okIban(s) {
    const v = s.replace(/ /g, '');
    const r = (v.slice(4) + v.slice(0, 4)).replace(/[A-Z]/g, (c) => c.charCodeAt(0) - 55);
    let m = 0;
    for (const ch of r) m = (m * 10 + +ch) % 97;
    return m === 1;
  }

  const OCT = '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)';
  const DETECTORS = {
    money: { hint: '\\d', re: MONEY_RE },
    email: { hint: '@', re: /[\w.%+-]+@[A-Za-z\d-]+(?:\.[A-Za-z\d-]+)*\.[A-Za-z]{2,}/g },
    phone: {
      hint: '\\d',
      re: /(?<![\w+]|\d[., \u00a0-])(?:\+\d{1,3}[ \u00a0-]?)?(?:\(\d{1,4}\)[ \u00a0-]?)?\d[\d \u00a0-]{6,16}\d(?![\w]|[., \u00a0-]\d)/g,
      ok: okPhone,
    },
    card: { hint: '\\d', re: /(?<![\d-])\d(?:[ -]?\d){12,18}(?![\d-])/g, ok: okCard },
    iban: { hint: '\\d', re: /\b[A-Z]{2}\d{2}(?: ?[A-Z\d]{4}){2,7}(?: ?[A-Z\d]{1,3})?\b/g, ok: okIban },
    key: {
      hint: '[_-]|AKIA|AIza|eyJ',
      re: /(?<![\w-])(?:(?:sk|pk|rk)_(?:live|test)_[A-Za-z\d]{10,}|gh[pousr]_[A-Za-z\d]{30,}|github_pat_\w{30,}|AKIA[\dA-Z]{16}|AIza[\w-]{35}|xox[abprs]-[A-Za-z\d-]{10,}|shp(?:at|ca|pa|ss)_[a-fA-F\d]{32}|sk-(?:proj-|ant-)?[\w-]{20,}|eyJ[\w-]{10,}\.[\w-]{10,}\.[\w-]{10,})(?![\w-])/g,
    },
    ip: { hint: '\\d\\.\\d', re: new RegExp(`(?<![\\d.])(?:${OCT}\\.){3}${OCT}(?![\\d.]*\\d)`, 'g') },
  };

  // Custom entries: plain words, or /regex/ written between slashes.
  function buildCustomRE(list) {
    const parts = [];
    for (const raw of list) {
      const s = String(raw).trim();
      const m = s.match(/^\/(.+)\/[a-z]*$/);
      if (m) {
        try { new RegExp(m[1], 'u'); parts.push(`(?:${m[1]})`); } catch {}
      } else if (s) {
        parts.push(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      }
    }
    try { return parts.length ? new RegExp(parts.join('|'), 'giu') : null; } catch { return null; }
  }

  // Compiles a configuration ({ types, custom }) into a matcher.
  // find(text) returns sorted [start, end] spans that do not overlap.
  function compile({ types = [], custom = [] } = {}) {
    const list = types.filter((t) => t in DETECTORS).map((t) => DETECTORS[t]);
    const customRE = buildCustomRE(custom);
    const hints = list.map((d) => d.hint);
    if (customRE) hints.push('\\S');
    const hint = hints.length ? new RegExp(hints.join('|')) : null;

    function find(text) {
      const found = [];
      const add = (re, ok) => {
        for (const m of text.matchAll(re)) {
          if (m[0] && (!ok || ok(m[0]))) found.push([m.index, m.index + m[0].length]);
        }
      };
      for (const d of list) add(d.re, d.ok);
      if (customRE) add(customRE);
      // Detectors can overlap (an amount inside a custom phrase), so merge.
      found.sort((a, b) => a[0] - b[0]);
      const spans = [];
      for (const [s, e] of found) {
        const last = spans[spans.length - 1];
        if (last && s < last[1]) last[1] = Math.max(last[1], e);
        else spans.push([s, e]);
      }
      return spans;
    }

    return { empty: !hint, test: (text) => !!hint && hint.test(text), find };
  }

  const api = {
    TYPES: Object.keys(DETECTORS),
    compile,
    money: { FULL_RE, PART_RE, WORDS: MONEY_WORDS, BARE_NUM_RE, PURE_BARE_RE },
  };
  if (typeof module === 'object') module.exports = api;
  else globalThis.VeilDetect = api;
})();
