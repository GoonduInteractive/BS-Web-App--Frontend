# REGISTER → Google Sheet

The header's REGISTER button opens a sheet that collects a first name, last name, WhatsApp number
and email. On SUBMIT the site posts them to a Google Apps Script web app, and the script appends a
row to a Google Sheet. `Code.gs` in this folder is that script. Nothing else is involved: no
server of ours, no third-party form service.

Once set up, the sheet fills a tab called **Registrations** with these columns:

| Timestamp | First name | Last name | WhatsApp | Email | Locale | Page |
|---|---|---|---|---|---|---|

Repeat emails are not added twice. The script also ignores a POST that carries a `website` field -
a bot-trap the site's form no longer sets (browser autofill filled it for real people, and their
sign-ups were silently dropped), kept in the script only because it is harmless there.

## Set up (about ten minutes, once)

1. **Create the spreadsheet.** In Google Drive, New → Google Sheets. Name it anything (say
   "Beyond Service - Registrations"). Leave it empty; the script creates its own tab.

2. **Open the script editor.** In the spreadsheet: **Extensions → Apps Script**. A project opens
   with an empty `Code.gs`.

3. **Paste the script.** Delete the contents of that `Code.gs` and paste the whole of the `Code.gs`
   from this folder. Save (Ctrl/Cmd+S). You can rename the project at the top left.

4. **Deploy it as a web app.** Top right: **Deploy → New deployment**.
   - Click the gear next to "Select type" and choose **Web app**.
   - Description: anything ("register v1").
   - **Execute as: Me** (your account - the script writes to your spreadsheet as you).
   - **Who has access: Anyone** (the site's visitors are not signed in to Google; without this
     the browser gets a Google sign-in page instead of the script).
   - Click **Deploy**.

5. **Authorise it.** The first deploy asks for permission to run as you and edit your
   spreadsheets. Choose your account → if you see "Google hasn't verified this app", click
   **Advanced → Go to <project name> (unsafe)** - it is your own script, not a published app →
   **Allow**.

6. **Copy the Web app URL.** It ends in `/exec`. Paste it in a browser tab: you should see
   `{"ok":true,"service":"beyond-service-register"}`. That is the health check.

7. **Give the site the URL.** The site reads it from the environment variable
   **`NEXT_PUBLIC_REGISTER_ENDPOINT`**.
   - Locally: add `NEXT_PUBLIC_REGISTER_ENDPOINT=https://script.google.com/macros/s/…/exec` to
     `.env.local` in the project root (the `.env*` files are gitignored) and restart `npm run dev`.
   - On the host: add the same variable in the project's environment settings, then **rebuild**.
     `NEXT_PUBLIC_` variables are baked in at build time, so a change needs a new build, not a
     restart.

8. **Test it.** Open the site, click REGISTER, fill the form, SUBMIT. Within a second the
   REGISTRATION SUCCESSFUL sheet shows, and a new row is in the **Registrations** tab. Submit the
   same email again: the sheet says success, the tab does not gain a row.

## Changing the script later

Edits in the Apps Script editor do **not** go live on their own. After saving:
**Deploy → Manage deployments → (pencil) Edit → Version: New version → Deploy.** Updating the
existing deployment keeps the same `/exec` URL. Creating a *new* deployment gives a new URL and the
site would need the environment variable changed and a rebuild.

## Things worth knowing

- **The URL is not a secret.** It ships in the site's JavaScript, as any form's destination
  would. What protects the sheet is Google's own access to the spreadsheet (share it only with
  people who should read it) and the script's checks: required fields, an email and a number that
  look like one, the duplicate check, and one writer at a time.
- **Why form-encoded, and why no error details reach the visitor.** Apps Script cannot answer a
  browser's CORS "preflight", so the site sends a plain form post, which browsers send without
  asking. The reply is `{ ok: true }` or `{ ok: false, error }`; the visitor sees only "sent" or
  "not sent - try again". The `error` codes (`missing`, `email`, `whatsapp`) are for you, in the
  browser's network tab.
- **"CORS error" in the console, but the row IS in the sheet.** The request reached the script
  (it runs before it answers); it is the *reply* the browser refused, because Google routes the
  answer through a redirect that sometimes comes back without the CORS header - typically when more
  than one Google account is signed in in that browser. The site handles this: when it cannot read
  the reply it sends the same post once more in a mode whose reply it never needs, and shows
  success once that completes. The script keeps one row per email, so nothing is added twice. The
  one thing lost in that case is the ALREADY REGISTERED message - a repeat address gets plain
  success. Signing out of the extra Google accounts, or testing in a private window, makes the
  reply readable again.
- **If the sheet says "not sent" every time:** check the URL in the environment variable ends in
  `/exec` (not `/dev`), that the deployment's access is **Anyone**, that the site was rebuilt
  after the variable was set, and that the health check in step 6 still answers. **Executions**
  in the Apps Script editor's left rail lists every call with its error, if any.
- **Quotas.** A consumer Google account allows the script to run for 90 minutes a day in total;
  each registration takes well under a second. Thousands a day are fine. A Workspace account has
  higher limits.
- **This collects personal data.** Names, phone numbers and emails of real people are being stored
  in a spreadsheet. The site's Privacy Policy page is still Coming Soon and the form has no consent
  line; both need copy from Goondu before the form is public. Whoever holds the spreadsheet holds
  the data - keep sharing tight, and delete rows when someone asks.
