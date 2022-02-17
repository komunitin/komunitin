# Komunitin

Open System for Exchange Communities

![build status](https://github.com/komunitin/komunitin/workflows/Build/badge.svg)

Komunitin features mutual credit currency management for communities. It is the natural successor of [IntegralCES](https://integralces.net) and it wants to be a useful tool for local communities to build more resilient and sustainable economic structures.

## Demo
Check the installed version of the current `master` branch at [test.komunitin.org](https://test.komunitin.org). It uses dummy data.

## Develop

Read the [developer](DEVELOP.md) readme.

## Run locally using docker
```bash
docker build . --file Dockerfile --tag komunitin-app
docker run -d -p 80:80 --rm komunitin-app
```

And see the result at http://localhost/.
