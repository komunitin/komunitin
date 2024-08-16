# External transfers

External payments are payments where the two accounts belong to different currencies. We've already outlined the scheme in the [monetary model ](../../overview/monetary-model.md#global-payments)page and the set of elements [in the Stellar nework](stellar-model.md#external-payments).

Provided there is a trustline path between the source and destination currencies, the service needs to know the remote account public key in order to make the path payment. Remember that the remote account can belong to a currency in the same or a different server.

## API

External payments make use of a JSON:API extension for external resources. Concretely, an external `payee` relationship  looks like:

```
"payee": { 
  "data" : { 
    "type": "accounts", 
    "id": "123"
    "meta": {
      "external": true
      "href": "https://komunitin.org/TEST/accounts/123"
    }
  }
}
```

The server can get the external resource following the href property. The public key is part of the resource body.

## Account discovery

Depending on the user interface method used to initiate the payment, the account discovery model may vary.&#x20;

* The most straightforward is the QR code method. Indeed, the QR already contains the full account URL, and this is directly used to get the public key.
* If using the account select field (either in the single or multiple page) the user will need to select first the remote currency. Currently only the currencies in the same server are available for selection.
  * If the remote group has enabled the possiblity for anonymous users to list the community members, the payer will see the full list of all remote members with names, avatar pictures and account numbers
  * Otherwise, the payer can enter the account number AAAAXXXX and the remote account will be obtained from that. In this case the payer don't see the name of the destination account.
* NFC tag payments don't support external transfers currently.

## Information sharing

At this point we're capable of doing the Stellar transfer, but we want more than that: we want to share the transfer description and other offchain bits of information from the payer server to the destination server.

In order to do so, the payer server directly sends all these additional data to the destination server. The payer identifies themselves using the payer account private key so the external server can verify that the transfer information indeed comes from the transfer source.

This authentication method will be used for remote external payment requests as well.

### Payment requests

When it is the destination account who wants to initiate the external transfer, the destination server sends the payment request to the payer server. Then, if the payer account allows receiving external transfer requests the transfer will be recorded in the payer server and a notification will be sent to the payer. After approval, the transaction will be submitted by the payer server and will follow the same workflow as en external payer.

Note that the requests between servers are authenticated using tokens signed with the respective Stellar account private keys.

