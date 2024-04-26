# Komunitin accounting service

## Ledger
This service uses the [Stellar](https://stellar.org) blockchain to define the currencies, accounts, and transactions of the community.

### Local model
 - Each community currency has its own asset. Assets have the following properties:
   - The asset code is a 4-character string.
   - The asset requires authorisation: no random user in the internet can hold the asset, but only users authorised by the community.
   - The asset is revocable and clawbackable: the issuer can revoke the asset from any user and clawback the asset from any user.

 - Each currency has 3 distinguished Stellar accounts:
   - The issuer account. Is the account that mints the community currency. It only transfers the currency to the credit account.
   - The credit account. Payments from this account are accounted as credit to the user. So for example, if an account has a Stellar balance of 80 units, but the sum of payments from the credit account is 100 units, then the user has a Komunitin balance of -20 units.
   - The admin account. This is an account for administrative purposes and its key is a signer of all other user accounts.

- All XLM base reserves and transaction fees are sponsored by a single global sponsor account.

### External model
In order to feature trade between communities, the following model is proposed:
  - Each community has a global imaginary asset called HOUR, with the following properties:
    - The asset code is "HOUR".
    - ? Authorization required
    - ? Revocable and clawbackable
  


 - Each community sets the value of its currency in terms of a global imaginary value (the HOUR).
 - Community currencies can set trade agreements with other trusted communities, limiting the trade balance.
 - Users from one community can trade with users from another community, all using only their respective local assets, through a path of previous trade agreements between currencies.