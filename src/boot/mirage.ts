import { boot } from 'quasar/wrappers'

export default boot(async () => {
  if (process.env.USE_MIRAGE) {
    await import("../server");
  }
});


