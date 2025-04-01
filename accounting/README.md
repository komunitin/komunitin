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
To test the CC integration, you can go to the repo root and do:
```sh
cp compose.cc.yml compose.yml
./start.sh --up --ices --dev --demo
docker exec -it komunitin-cc-1 /bin/bash -c "service mariadb start"
docker exec -d komunitin-cc-1 /bin/bash -c "cd automerge-basic; source ~/.bashrc; npm start"
docker exec -it komunitin-cc-1 /bin/bash -c "curl -i http://komunitin-accounting-1:2025/"
docker exec -it komunitin-db-accounting-1 psql postgresql://accounting:accounting@localhost:5432/accounting
```

In psql, execute `SELECT set_config('app.bypass_rls', 'on', false);` to bypass Row Level Security, then `\d+` to see a list of tables, and e.g. `select * from "Transfer";` to see the contents of the Transfers table. Run `update "Currency" set "adminId"='75736572-2020-4716-a669-000000000007' where "tenantId"='NET2';` to make Noether the currency admin of NET2, harvest Noether's bearer token from your browser dev tools while visiting http://localhost:2030/ (log in with `noether@komunitin.org` / `komunitin`), and then you can graft the Komunitin node onto the CC tree and access its CC API (FIXME: create a dedicated gateway account first instead of using `4d41c0cb-9457-464b-97d0-402db8e6e912 / NET20003 / Fermat` as the gateway/vostro account):

```sh
docker exec -it komunitin-cc-1 /bin/bash -c "curl -i -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpZCI6ImUwM2Q2ZmQ5OTE4ZGU3NjUyOTcyODQ4YTViNDVlOWNlMjE4YzY0ZjMiLCJqdGkiOiJlMDNkNmZkOTkxOGRlNzY1Mjk3Mjg0OGE1YjQ1ZTljZTIxOGM2NGYzIiwiaXNzIjoiaHR0cDpcL1wvbG9jYWxob3N0OjIwMjlcLyIsImF1ZCI6ImtvbXVuaXRpbi1hcHAiLCJzdWIiOiI3IiwiZXhwIjoxNzQzNTAwNTIyLCJpYXQiOjE3NDM0OTY5MjIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJzY29wZSI6ImtvbXVuaXRpbl9zb2NpYWwga29tdW5pdGluX2FjY291bnRpbmcgZW1haWwgb2ZmbGluZV9hY2Nlc3Mgb3BlbmlkIHByb2ZpbGUifQ.RKahmd_Pc-8NVkwb6Xcio9uRQtCIhebWz97Mf0fKrv0BFuFSmK-AEGFsyGp7_HXJiDo8GBmWgI30-KX1XV4Mav73CX2T4clWp5tHJlx9360Jk-u92MzI7H7R1aEq809IGfRRXZF5r42SIGCTfpgzOK1n9Dyx88_9GTY_khWKsnUJjWXb8q1Z17djV3QqW9ardtnoq_qhAHZIfTHCm_HsDFKL8M5g4C8qhD6zDAr_j-1rYFcT4zKMeVakXh2blZFcj9USWwKhHu7A7kbnb21ddsirsX-dcCcgqJByfxmpy2niZk4B02CXgSWh6nTWOrh4CO1-MeuGHYfH-7KlDLikPg' -X POST -d'{\"data\":{\"attributes\":{\"ccNodeName\":\"trunk\",\"lastHash\":\"trunk\",\"vostroId\":\"4d41c0cb-9457-464b-97d0-402db8e6e912\"},\"relationships\":{\"vostro\":{\"data\":{\"type\":\"account\",\"id\":\"4d41c0cb-9457-464b-97d0-402db8e6e912\"}}}}}' http://komunitin-accounting-1:2025/NET2/creditCommonsNodes"
docker exec -it komunitin-cc-1 /bin/bash -c "curl -i -H 'Content-Type: application/json' -H 'cc-node: trunk' -H 'last-hash: trunk' http://komunitin-accounting-1:2025/NET2/cc/"
docker exec -it komunitin-cc-1 /bin/bash -c "vendor/bin/phpunit tests/MultiNodeTest.php"
```
This will make the Komunitin node act as `trunk/branch2` in the CreditCommons test tree. You should see 8/8 tests passing.
