# Komunitin

Open System for Group Communities

![build status](https://github.com/komunitin/komunitin/workflows/Build/badge.svg)

## Demo
Check the installed version of the current `master` branch at [test.komunitin.org](https://test.komunitin.org). It uses dummy data.

## Develop

Read the [developer](DEVELOP.md) readme.

## Build and run with Docker

```bash
docker build . --file Dockerfile --tag komunitin-app
docker run -d -p 80:80 --rm komunitin-app
```

And see the result at http://localhost/.
