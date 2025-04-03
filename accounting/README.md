# Komunitin accounting service

This service uses the [Stellar](https://stellar.org) blockchain to define the currencies, accounts, and transactions of the community.

## Build
```bash
$ pnpm install
```

## Run dev server standalone (with DB and local Stellar)
This is the right environment to develop the service and execute tests. Start the dependecy services (database and local Stellar Network) and the Komunitin Accounting service at http://localhost:2025.
```bash
$ cp .env.test .env
$ docker compose up -d
$ pnpm dev
```

## Run dev server with local services (with testnet Stellar)
This is the right environment to develop the integration of this service with the app and other services. 
- Start the Komunitin services following the instructions in the [main README](../README.md).
- Stop the `accounting` container
- Run the accounting service with the local services:
```bash
$ cp .env.local .env
$ pnpm dev
```
- Change the internal accounting url in integralces service:
```bash
$ cd ..
$ docker compose exec integralces drush vset ces_komunitin_accounting_url_internal http://host.docker.internal:2025 
```

Note for devs on WSL (Windows): when runnning the accounting service from WSL2 and wanting to access it from a docker container (eg from integralces or notifications), the host.docker.internal must point to the WSL2 IP instead of the Windows host IP, so the `host.docker.internal: host-gateway` entry in the `docker-compose.yml` file must be replaced by the WSL2 IP.

## Test
Execute all the tests:
```bash
$ pnpm test
```
### Unit tests
```bash
$ pnpm test-unit
```

### Ledger tests
Tests involving only the Stellar integration but not the server.
```bash
$ pnpm test-ledger
```
### Server tests
Tests involving the whole service
```bash
$ pnpm test-server
```

### Run just one test
```bash
$ pnpm test-one <test-file>
```

## Stellar


### Local model
 - Each community currency has its own asset. Assets have the following properties:
   - The asset code is a 4-character string.
   - The asset requires authorisation: no random user in the internet can hold the asset, but only users authorised by the community.
   - The asset is revocable and clawbackable: the issuer can revoke the asset from any user and clawback the asset from any user.

 - Each currency has 3 distinguished Stellar accounts:
   - The issuer account. Is the account that mints the community currency. It only transfers the currency to the credit account.
   - The credit account. Payments from this account are accounted as credit to the user. So for example, if an account has a Stellar balance of 80 units, but the sum of payments from the credit account is 100 units, then the user has a Komunitin balance of -20 units.
   - The admin account. This is an account for administrative purposes and its key is a signer of all other user accounts.

- All XLM base reserves and transaction fees are sponsored by a single global sponsor account.

### External model
In order to feature trade between communities, the following model is proposed:
  - Each currency has two additional distinguished Stellar accounts:
    - The external issuer account. Mints an asset with code HOUR (for all currencies). This asset is permissionless.
    - The external trader account. This account defines sell offers between the local asset and the HOUR asset, and also between the HOUR asset from this currency and the HOUR asset from other currencies.
  - Initially, the trader account is funded with sufficient HOUR balance and sets an offer to convert the local asset to HOUR.
  - If the trader is configured to hold and initial balance of local asset, then it also sets an offer to convert HOUR to the local asset.
  - The currency andministration may choose to trust another currency up to a limit. This means that the currency will accept the HOUR asset from the other currency as payment. This is reflected by creating a trustline to the external HOUR asset and a sell offer to convert the currency HOUR asset to the external HOUR asset.
  - Whenever an incoming external payment is received, the trader account creates or updates the sell offer to convert the current balance of external HOUR assets to local HOUR assets.

## CC integration
### Main setup
To test the CC integration, you can go to the repo root, make sure you have https://github.com/michielbdejong/ices checked out next to it, and do:
```sh
cp compose.cc.yml compose.yml
cp .env.template .env
./start.sh --up --ices --dev --demo
docker exec -it komunitin-cc-1 /bin/bash -c "service mariadb start"
docker exec -it komunitin-cc-1 /bin/bash -c "vendor/bin/phpunit tests/SingleNodeTest.php"
docker exec -it komunitin-cc-1 /bin/bash -c "cd automerge-basic; source ~/.bashrc; git pull; npm run build; npm start"
```
You can also run that last one `-d` instead of `-it` if you don't want to keep it open.
There will be a lot of `WD ces_komunitin: Event sent:` 401 errors and some `Could not connect to debugging client` errors which you can ignore, but if you see `DUPLICATE ENTRY` errors, checkout the [Reset](#reset) section below.

### Connecting with docker exec
```sh
docker exec -it komunitin-cc-1 /bin/bash -c "curl -i http://komunitin-accounting-1:2025/"
docker exec -it komunitin-integralces-1 mysql -u integralces -pintegralces -h komunitin-db-integralces-1 integralces
docker exec -it komunitin-db-accounting-1 psql postgresql://accounting:accounting@localhost:5432/accounting
```
In psql, execute `SELECT set_config('app.bypass_rls', 'on', false);` to bypass Row Level Security, then `\d+` to see a list of tables, and e.g. `select * from "Transfer";` to see the contents of the Transfers table.

### Making NET2 a Credit Commons node
1. Open `psql` on `komunitin-db-accounting-1` (see [above](#connecting-with-docker-exec)) and find out the account Id of the ClearingCentralVostro account using the following query:
```sql
SELECT set_config('app.bypass_rls', 'on', false);
SELECT "id" FROM "Account" WHERE "code"='NET20004';
\q
```

2. Harvest Fermat's bearer token from your browser dev tools while visiting http://localhost:2030/ (log in with `fermat@komunitin.org` / `komunitin`).

3. Using the results from 1. (`54c97d55-397d-49e1-9f54-47d1127323a7` in this example) and 2. (`Authorization: Bearer ...` in this example) you can graft the Komunitin node onto the CC tree:
```sh
docker exec -it komunitin-cc-1 /bin/bash -c "curl -i -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpZCI6ImUzODFlOGM4NzQwYjgzMWVmYjA4ZGQ2MTU5YzlmZTBhYmU0ZWM3OTIiLCJqdGkiOiJlMzgxZThjODc0MGI4MzFlZmIwOGRkNjE1OWM5ZmUwYWJlNGVjNzkyIiwiaXNzIjoiaHR0cDpcL1wvbG9jYWxob3N0OjIwMjlcLyIsImF1ZCI6ImtvbXVuaXRpbi1hcHAiLCJzdWIiOiI4IiwiZXhwIjoxNzQzNjgxNjAzLCJpYXQiOjE3NDM2NzgwMDMsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJzY29wZSI6ImtvbXVuaXRpbl9zb2NpYWwga29tdW5pdGluX2FjY291bnRpbmcgZW1haWwgb2ZmbGluZV9hY2Nlc3Mgb3BlbmlkIHByb2ZpbGUifQ.ZEo1pB7225M1J22bTn9iDNHqY2DSchh5oGB8_lUuhqK4kEbwTNUTv1TKWeAHFsgFEs4Tkwn1rRey4y2uRpuHaYlG6_x0whzC-lX4aVUyJRUBOtYDoKW5dJlZpLgy4DV7uPeqivNBlHtFMbjFTan5mHqnoHi0pv91oh00N_zjPu4DQwBeWs-2Jk8vr7-guCaBhdx4son2Au68kDQfUTI6f57RBZAG8wWsURUXfLWi-0UljbpUSLtbfxc02kPB-ZsIcMTunMrhsHniQYoRVV__2OeFL0dgc8UunWA6nGG1CqtyAtL4YiNhcJUMG_CkiX-ZR6bz9mWZ_Gcxr_5Krjic6Q' -X POST -d'{\"data\":{\"attributes\":{\"ccNodeName\":\"trunk\",\"lastHash\":\"trunk\",\"vostroId\":\"54c97d55-397d-49e1-9f54-47d1127323a7\"},\"relationships\":{\"vostro\":{\"data\":{\"type\":\"account\",\"id\":\"54c97d55-397d-49e1-9f54-47d1127323a7\"}}}}}' http://komunitin-accounting-1:2025/NET2/creditCommonsNodes"
```
4. To test it, run:
```sh
docker exec -it komunitin-cc-1 /bin/bash -c "curl -i -H 'Content-Type: application/json' -H 'cc-node: trunk' -H 'last-hash: trunk' http://komunitin-accounting-1:2025/NET2/cc/"
docker exec -it komunitin-cc-1 /bin/bash -c "sed -i -e 's/bob/NET20002/g' tests/MultiNodeTest.php"
docker exec -it komunitin-cc-1 /bin/bash -c "vendor/bin/phpunit tests/MultiNodeTest.php"
```
This will make the Komunitin node act as `trunk/branch2` in the CreditCommons test tree. You should see some 'DROP USER failed' errors which you can ignore, followed by a phpunit text report with 8/8 tests passing.

To get this working, depending on the state of https://gitlab.com/credit-commons/cc-php-lib/-/merge_requests/7, on komunitin-cc-1 you may need to:
```sh
cd vendor/credit-commons/cc-php-lib/
git remote add me https://gitlab.com/michielbdejong/cc-php-lib
git fetch me
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
git merge me/patch-1
cd ../../..
```


### Reset
To  restart from scratch, do `docker compose down -v`. Make sure with `docker ps -a` and `docker volume ls` that all relevant containers are stopped and removed, and repeat if necessary. There might also be an unnamed volume that you need to remove. If see `DUPLICATE ENTRY` errors on the next run then you know it wasn't removed completely.