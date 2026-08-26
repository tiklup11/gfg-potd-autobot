# GFG POTD Autobot

Runs the GeeksforGeeks problem of the day for users configured in a private
JavaScript module and emails one result summary after each attempted run. After the
first fully successful run of the day, later scheduled runs and emails are
skipped.

The default schedule is `0 10,13,16,19,22 * * *` in `Asia/Kolkata`, which runs
at 10:00 AM, 1:00 PM, 4:00 PM, 7:00 PM, and 10:00 PM IST every day. Change
`CRON_SCHEDULE` or `CRON_TIMEZONE` in the runtime environment when needed.
Defaults live in `src/appconfig.js`, and process environment variables take
precedence.

## Add or update users

Cookie-Editor must be set to JSON export mode. Its exported file must contain
an array of `.geeksforgeeks.org` cookies.

From the repository, add a user with:

```bash
npm run user:upsert -- \
  --email user@example.com \
  --cookies /path/to/cookie-editor-export.json
```

The command creates `src/configured_users.js` when it does not exist. The resulting
file has this shape:

```js
module.exports = [
  {
    email: "user@example.com",
    authHeader: "cookie-name=cookie-value; another-cookie=another-value",
  },
];
```

To refresh an existing user's cookies, export the latest cookies and run the
same command with the same email:

```bash
npm run user:upsert -- \
  --email user@example.com \
  --cookies /path/to/new-cookie-editor-export.json
```

Emails are matched case-insensitively, so an existing entry is replaced instead
of duplicated. Run the command once for each user, then commit and push the
updated file to the branch deployed by Dokploy.

`src/configured_users.js` is the bot's small user database and is tracked in this
personal private repository. It contains active login credentials, so the
repository must never be made public or shared. The script rejects expired and
non-GFG cookies, writes the file atomically with mode `600`, and never prints
authentication values.

The account used to fetch the official solution is configured separately, so
submission users remain eligible for their own reward points:

```bash
npm run solution:set -- --cookies /path/to/solution-account-export.json
```

This writes the tracked `src/configured_solution_user.js` file.

To test one configured user immediately without sending the report email:

```bash
npm run run:once -- user@example.com --no-email
```

Remove `--no-email` to send the normal summary report after the test. The
command exits with status `0` on success and `1` on failure.

## Dokploy deployment

Deploy the repository as a Dockerfile application with build context `.`. The
bot does not need a public domain; its internal port is `1289`, and Docker checks
`/healthz` automatically.

Set these runtime variables in Dokploy:

- `NODE_ENV=production`
- `PORT` (optional)
- `CRON_SCHEDULE` (optional)
- `CRON_TIMEZONE` (optional)
- `SMTP_HOST` (optional)
- `SMTP_PORT` (optional)
- `SMTP_USER`
- `SMTP_PASSWORD`
- `REPORT_EMAIL`
- `NEW_RELIC_APP_NAME` (optional; defaults to `gfg-potd-bot`)
- `NEW_RELIC_LICENSE_KEY` (optional; enables New Relic in production)

Production logs are emitted as JSON and, when `NEW_RELIC_LICENSE_KEY` is set,
forwarded to New Relic. They include scheduler, job, per-user submission, report
email, and failure events. GFG response bodies, authentication values, submitted
code, and SMTP response strings are never logged.
