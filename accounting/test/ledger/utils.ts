export const friendbot = async (publicKey: string) => {
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`)
    await response.json()
    console.log(`Account ${publicKey} funded with 10,000 XLM on the test network.`)
  } catch (e) {
    console.error("Error funding account", e)
  }
}
