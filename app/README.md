# Komunitin app
The Progressive Web App with the user interface for the Komunitin system.

## Develop

Read the [developer](DEVELOP.md) readme.

## Run locally using docker
```bash
docker build . --file Dockerfile --tag komunitin-app
docker run -d -p 80:80 --rm komunitin-app
```

And see the result at http://localhost/.
