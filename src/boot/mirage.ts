import { boot } from 'quasar/wrappers'

export default boot(async () => {
  if (process.env.MOCK_ENABLE) {
    await import("../server");
  }
});


