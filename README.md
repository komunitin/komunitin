# Komunitin

Open System for Exchange Communities

![build status](https://github.com/komunitin/komunitin/workflows/Build/badge.svg)

Komunitin features mutual credit currency management for communities. It is the natural successor of [IntegralCES](https://integralces.net) and it wants to be a
useful tool for local communities to build more resilient and sustainable economic structures.

## Demo
Check the installed version of the current `master` branch at [test.komunitin.org](https://test.komunitin.org). It uses dummy data from [demo.integralces.net](https://demo.integralces.net)

* user: noether@integralces.net
* password: integralces

## Structure
The Komunitin system is made of several units:
 - Komunitin app: [ALPHA] The client application with user interface. See the [app](app/) folder.
 - Notifications service: [ALPHA] The backend for the messaging system including push notifications. See the [notifications](notifications/) folder.
 - IntegralCES: The backend for the social and accounting APIs. These will be moved to two separate microservices but the APIs are provided by the classic 
 IntegralCES by now. See the [ices Drupal project](https://drupal.org/project/ices).
 - Accounting service: [IN PROGRESS]: The new decentralized backend for the accounting API. See the [accounting](accounting) folder.
 - Social service: [TODO] The new decentralized backend for the social API.

## Run with Docker
In order to run the whole system with docker compose, you need the peer dependency IntegralCES. Clone it in the same parent folder as Komunitin.

```bash
git clone https://git.drupalcode.org/project/ices.git
```

Before running the system you need to setup some environment variables. Use the `.env.template` file as a reference and create a `.env` file with the correct values. Also, create the file `komunitin-project-firebase-adminsdk.json` in the `notifications` folder with the firebase admin sdk credentials.

Then you can run the start script with the options to 1) start the containers, 2) initialize IntegralCES and 3) seed the system with demo data.

```bash
. ./start.sh --ices --demo
```

The published services are:
 - Komunitin app: [http://localhost:2030](http://localhost:2030)
 - IntegralCES: [http://localhost:2029](http://localhost:2029)
 - Notifications service: [http://localhost:2028](http://localhost:2028)
 - Accounting service: [http://localhost:2025](http://localhost:2025)

You can now try Komunitin at [http://localhost:2030](http://localhost:2030) with the email `noether@integralces.net` and password `integralces`.

## Public deployment
In case of deployment in a public server, you need to add the flag `--public` to the start script. For example:

```bash
. ./start.sh --ices --public
```

This will configure the system not to publish any port and with [Traefik](https://traefik.io) labels to be used by a the reverse proxy. Then you need to start the reverse proxy with:

```bash
docker-compose -f docker-compose.proxy.yml up -d
```

The proxy is provided separately because it may be shared with other services in the same server and may need to be customized.

