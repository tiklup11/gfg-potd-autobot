# GFG POTD Autobot

Runs the GeeksforGeeks problem of the day for users configured in a protected
JSON file and emails one result summary after each run.

The default schedule is `0 15 * * *` in `Asia/Kolkata`, which is 3:00 PM IST.
Change `CRON_SCHEDULE` or `CRON_TIMEZONE` in the VPS environment file when
needed.

## Add or update users

Cookie-Editor must be set to JSON export mode. Its exported file should contain
an array of `.geeksforgeeks.org` cookies like the structure shown by
`config/users.example.json`.

From the repository, add a user with:

```bash
npm run user:upsert -- \
  --email user@example.com \
  --cookies /path/to/cookie-editor-export.json
```

The command creates `config/users.json` when it does not exist. The resulting
file has this shape:

```json
[
  {
    "email": "user@example.com",
    "authHeader": "cookie-name=cookie-value; another-cookie=another-value"
  }
]
```

To refresh an existing user's cookies, export the latest cookies and run the
same command with the same email:

```bash
npm run user:upsert -- \
  --email user@example.com \
  --cookies /path/to/new-cookie-editor-export.json
```

Emails are matched case-insensitively, so an existing entry is replaced instead
of duplicated. Run the command once for each user, then upload the completed
file to the VPS:

```bash
ssh -t -i ~/.ssh/orcle_vps_ai_key ubuntu@140.245.25.32 \
  'sudo install -d -o ubuntu -g ubuntu -m 700 /srv/gfg-potd-bot/config'

scp -i ~/.ssh/orcle_vps_ai_key \
  config/users.json \
  ubuntu@140.245.25.32:/srv/gfg-potd-bot/config/users.json

ssh -i ~/.ssh/orcle_vps_ai_key ubuntu@140.245.25.32 \
  'chmod 600 /srv/gfg-potd-bot/config/users.json'
```

`config/users.json` is the bot's small user database and is tracked in this
personal private repository. It contains active login credentials, so the
repository must never be made public or shared. The script rejects expired and
non-GFG cookies, writes the file atomically with mode `600`, and never prints
authentication values.

The account used to fetch the official solution is configured separately, so
submission users remain eligible for their own reward points:

```bash
npm run solution:set -- --cookies /path/to/solution-account-export.json
```

This writes the tracked `config/solution-user.json` file. Copy both protected
files to the VPS before deployment:

```bash
scp -i ~/.ssh/orcle_vps_ai_key \
  config/users.json config/solution-user.json \
  ubuntu@140.245.25.32:/srv/gfg-potd-bot/config/

ssh -i ~/.ssh/orcle_vps_ai_key ubuntu@140.245.25.32 \
  'chmod 600 /srv/gfg-potd-bot/config/users.json /srv/gfg-potd-bot/config/solution-user.json'
```

To test one configured user immediately without sending the report email:

```bash
npm run run:once -- user@example.com --no-email
```

Remove `--no-email` to send the normal summary report after the test. The
command exits with status `0` on success and `1` on failure.

## VPS deployment

GitHub Actions builds an ARM64 image and automatically deploys pushes to `main`
through `infra_repo/scripts/deploy-app.sh`. Runtime configuration stays on the
VPS at `<VPS_APP_PATH>/envs/.env.prod`; use `envs/.env.prod.example` as its
template.

The GitHub `prod` environment requires these variables:

- `VPS_HOST`
- `VPS_PORT`
- `VPS_USER`
- `VPS_APP_PATH`
- `VPS_INFRA_PATH`

It also requires `VPS_SSH_PRIVATE_KEY` and `VPS_KNOWN_HOSTS` as secrets. The
VPS must already be logged in to GHCR and have the latest `infra_repo` checkout.
