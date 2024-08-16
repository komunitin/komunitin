# Data

The data required to run the accounting service is divided between the on-chain data and the server database data. The onchain are the accounts, assets, transactions and credit limits. The database saves further information such as transfer descriptions, account numbers, account settings, account tags, and importantly, the private keys. The service uses a PostgreSQL database.

### Custodial model

Every account needs a private key to sign their transactions. Furthermore, there are special accounts required for each community currency (the issuer, the admin, the external issuer and external trader), with their respective private keys. All these keys are stored in the Komunitin database. Thus, Komunitin implements a custodial scheme where users need to fully trust their servers, in contrast for non-custodial architectures where the user has their private keys and need not to trust any particular server.

The tradeoff for storing the keys in the server is that it is easier to have some features like password recovery, and automatic acceptance of payment requests.

### Encryption

In order to mitigate the risk of having all the private keys in the database, all private keys are symetrically encrypted in the database using a different key for each community. These community keys are also stored in the database and encrypted using a master key. This master key is provided to the service at deployment time, only through memory and not shared with other OS processes. Master and community are will be rotated periodically by policy as well as on demand.

This is a simple but effective security approach for the case of community currencies, where the strongest security layer is given via interpersonal trust within these small communities. The fact that all transactions are recorded in Stellar makes it possible for the local currency administrator to verify and restore the balance of a compromised account.

### Multitenant

While a single server hand handle different communities, each community data is completely isolated using the Row Level Security feature of PostgreSQL. From the security point of view, each currency data belongs to a different database and the app can't access data from currency A when processing a request in currency B.

### Open to non-custodial

Even if the current architecure is custodial, it has been designed in a way that it would be posisble to switch to a non-custodial scheme with some development effort and restricting some features.



