## Developer readme

Follow these steps to start hacking with the komunitin app.

### Download

Get the code

```bash
git clone https://github.com/komunitin/komunitin.git
cd komunitin
```

### Install

Install the [Quasar framework](https://quasar.dev/), a develompent framework built over [Vue.js](https://vuejs.org/).

```bash
npm install -g @quasar/cli
npm install
```

### Launch

Launch the development HTTP server, that will make the app accessible at `http://localhost:8080/`.

```bash
quasar dev -m pwa
```

### Visual Studio Code

We use the de development IDE Visual Studio Code. [Follow this page](https://quasar.dev/start/vs-code-configuration) to set it up.

### Test

Launch the [Jest](https://jestjs.io/) testing framework for unit testing with:

```bash
quasar test --unit jest
```

When developing new Vue components or pages, always create their unit test file under the `__test__` folder.

### Mock API

```bash
npm run dev:mirage
```

or

```bash
quasar dev --env.USE_MIRAGE [TIMING]
```

### Sending environment variables

Added the possibility of passing environment variables in command line.

Example:

```bash
quasar dev --env.USE_MIRAGE 1000
```
