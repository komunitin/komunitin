# QR payments

The concept behind QR payments is fairly simple, as this method is just a convenient user experience for payers to have all the required information to create the transfer. Indeed, QR payments don't use any different API call than regular simple payments and all the logic is implemented in the frontend.

#### Payment links

The QR codes encode payment links. A payment link is:

```
https://komunitin.org/pay?t=<account_url>&m=<description>&a=<amount>
```

With the amount being expressed in the accunt's currency. Since the full account url is used, this method works fine for external transactions and it is in fact the preferred method since account discovery is a challenge otherwise.

Note that you can scan the QR code with any other app and, provided it corectly redirects you to the Komunitin app, the payment flow will continue.

Note also that payment links may have further applications beyond QR codes.

#### Workflow

The payee or destination is the initiator of the workflow by creating a payment link encoded as a QR code with their own account, the description and the amount. Then the payer scans the code as a quick way to have the transaction details, fills the payer field with their won account and effectively submits the transaction.
