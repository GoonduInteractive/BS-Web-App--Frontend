/**
 * Beyond Service — the header's REGISTER sheet → this spreadsheet.
 *
 * A Google Apps Script web app, bound to the spreadsheet it writes to. The
 * site posts the form (form-encoded: firstName, lastName, whatsapp, email,
 * locale, page) and this appends one row per person under the `Registrations`
 * tab. Setup, deploy and the site's environment variable are in README.md
 * beside this file.
 *
 * Replies are JSON — `{ ok: true, duplicate }` or `{ ok: false, error }` — and
 * the site's adapter (`src/lib/api/register.ts`) reads `ok` and nothing else
 * it does not recognise.
 */

var SHEET_NAME = "Registrations";
var HEADERS = ["Timestamp", "First name", "Last name", "WhatsApp", "Email", "Locale", "Page"];

/** The form's POST. */
function doPost(e) {
  try {
    var p = (e && e.parameter) || {};

    // The honeypot: a field no person sees. A bot that fills every input fills
    // it; say yes and keep nothing.
    if (p.website) return reply({ ok: true, duplicate: false });

    var firstName = clean(p.firstName, 80);
    var lastName = clean(p.lastName, 80);
    var whatsapp = clean(p.whatsapp, 24).replace(/\s+/g, "");
    var email = clean(p.email, 254).toLowerCase();

    if (!firstName || !lastName || !whatsapp || !email) return reply({ ok: false, error: "missing" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ ok: false, error: "email" });
    if (!/^\+?\d{7,15}$/.test(whatsapp)) return reply({ ok: false, error: "whatsapp" });

    // One writer at a time, so two people submitting together cannot land on
    // the same row or both pass the duplicate check.
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = getSheet();
      if (hasEmail(sheet, email)) return reply({ ok: true, duplicate: true });
      sheet.appendRow([new Date(), firstName, lastName, whatsapp, email, clean(p.locale, 8), clean(p.page, 200)]);
    } finally {
      lock.releaseLock();
    }

    return reply({ ok: true, duplicate: false });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

/** Opening the URL in a browser: a health check, nothing more. */
function doGet() {
  return reply({ ok: true, service: "beyond-service-register" });
}

/** The tab, created with its header row the first time. */
function getSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    // Numbers stay text: "+2348030000000" must not be read as a formula or a
    // number that drops its plus and its leading zero.
    sheet.getRange("D:D").setNumberFormat("@");
  }
  return sheet;
}

/** Is this address already on the list? Column E, case-insensitive. */
function hasEmail(sheet, email) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var emails = sheet.getRange(2, 5, last - 1, 1).getValues();
  for (var i = 0; i < emails.length; i++) {
    if (String(emails[i][0]).toLowerCase() === email) return true;
  }
  return false;
}

/** A string, trimmed and capped; anything else becomes "". */
function clean(value, max) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
