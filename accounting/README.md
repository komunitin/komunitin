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

## CC integration [WIP! needs to be updated before merging]
To test the CC integration, run:
```sh
docker compose -f compose.cc.yml up -d
docker exec -it accounting /bin/bash -c "./node_modules/.bin/prisma migrate reset --force"
docker exec -it cc /bin/bash -c "service mariadb start"
docker exec -it cc /bin/bash -c "vendor/bin/phpunit tests/SingleNodeTest.php"
docker exec -d cc /bin/bash -c "cd automerge-basic; source ~/.bashrc; npm start"
docker exec -it cc /bin/bash -c "vendor/bin/phpunit tests/MultiNodeTest.php"
docker exec -it cc /bin/bash -c "curl -i http://accounting:2025/"
docker exec -it accounting /bin/bash -c "pnpm test-one test/creditcommons/3.receive.test.ts"
docker exec -it db psql postgresql://accounting:accounting@db:5432/accounting
docker exec -it accounting pnpm build-cli
docker exec -it accounting node build/cli.js
```

Some errors like this will be displayed only the first time you execute the CC tests, you can ignore them:
```
ERROR 1396 (HY000) at line 1: Operation DROP USER failed for 'twig'@'localhost'
```

Next step: let the accounting server act as branch2.cc-server, and complete the remote payment!