# komunitin
Open System for Exchange Communities

![build status](https://github.com/komunitin/komunitin/workflows/Build/badge.svg)

## Develop
Read the [developer](DEVELOP.md) readme.

## Build and run with Docker
```bash
docker build . --file Dockerfile --tag komunitin-app
docker run -d -p 80:80 --rm komunitin-app
```
And see the result at http://localhost/.
