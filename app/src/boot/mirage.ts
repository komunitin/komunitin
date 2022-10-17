import { boot } from 'quasar/wrappers'

export default boot(async () => {
  if (process.env.MOCK_ENABLE == "true") {
    await import("../server");
  }
});


