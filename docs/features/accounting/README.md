# Accounting

## Currencies

Komunitin allows for creating different currencies, one for each community. Each currency is effectively a different token in the Stellar blockchain. When defining a currency you need to set some basic properties:

* **Code**: A unique 4-uppercase-letter code such as HOUR or COIN
* **Name**: The name of the currency, such as "Euro" or "Hour" or "Twike"
* **Symbol**: Such as $, €, ℏ, ¤ or any valid string of unicode symbols up to 3 characters.
* **Decimals**: The number of decimals to use when formatting the currency. Usually 2.
* **Scale**: The real number of decimals when doing internal computations with the currency.
* **Value**: The value of the currency measured with the global unit `HOUR`, meaning an average hour of labor. This value sets the exchange rate with other currencies in Komunitin and can be set as a fraction. More on that in [External transfers](external-transfers.md) section.

Currencies also have a set of settings defining some rules for the currency and what can or can not be done. See the Currency settings section.

## Accounts

Each account belongs to one and only one currency, and hence holds a balance in this currency. Each account is effectively an account in the Stellar blockchain. Accounts have

* **Code**: The currency code followed by 4 numbers. For example COIN0123.
* **Credit limit**: Each account can be as much negative as defined by its credit limit setting. If set to zero, then it can't be negative. If set to 100, then it can be as much negative as -100. Credit limits can be set in a per-account basis or also with a currency-wide strategy, and can change over time.
* **Maximum balance**: Optionally, accounts can be bounded by the upside too.

Accounts have a set of settings defining some behavior and what is allowed to do. See the Account settings section.

## Transfers

Users can pay to other accounts of the same currency. There are several methods for making transfers and they can be enabled or disabled by configuration:

* **Simple payment**. A user can see the list of community members and choose the one that needs to be paid. Then enter the amount and a description, and submit.
* **Simple payment request**. The initiating user is now not the payer but the payee. They go to the app, choose the payer from the members list, set a description and amount and request the payment. Generally, the payer will receive a notification and an email asking for their aproval. When the payer aproves the transfer, the payee will receive a notification as well.\
  Users can have a whitelist of accounts that will get their requests automatically accepted, and can even configure their account so that it automatically accepts all payment requests.
* **Multiple transfers.** The app provides an interface for entering a batch of transfers and executing them all at once. This is just a convenient productivity interface for use cases when tens of transfers need to be entered. This option is available either for payments or for payment requests.
* **Upload file**. An alternative way to enter multiple transfers is importing a CSV (Comma Separated Salues) file with the transfers. The user may use any spreadsheet program to comfortably create the file. The format is simple: exactly 4 columns with Payer, Payee, Description and Amount. External transfers are not supported.
* **QR code**. This is a method that allows the requester to enter the Description and the Amount of a transfer and build a QR code. This QR code can be then scanned by the payer to finish the transaction.
* **NFC tag**. This feature allows for payments with a workflow similar to contactless cards (the technology is different though). Users can link one or several existing NFC tags to their account. Then the receiver can initiate the payment by adding a description and an amount and showing their NFC reader to the payer. The payer brings their NFC tag close to the payee reader to complete the transaction. Currently NFC tag payments only work for&#x20;

Note that all these transfer methods are configurable and can be enabled at currency or account level depending on your concrete requirements. It is not recommended to leave all them available by default since too many options may cause confusion to users. A good approach is to set a single default way to perform payments and open additional methods on a per-account basis as required.

## Account settings

Beyond the code, and the credit and maximum limits accounts have some additional settings governing their behavior. All this settings can be set account by acocunt and they have a default value for all accounts in a currency.

* **Allow payments**. Allow this account to pay other accounts.
* **Allow payment requests**. Allow this account to request payments from other accounts.
* **Accept payments automatically**. Payment requests from users in the community are accepted by default, without the need of manual acceptance. This feature may look dangerous since it allows unsupervised charges from anyone in the community, but it has proved useful for small trustful commnities since it simplifies the payment request workflow.
* **Account whitelist**. It is a list of accounts. Payment requests from the whitelist are automatically accepted.
* **Payments timeout**. After a payment request is done, it may be set to be automatically accepted after some time, eg 15 days.
* **Allow external payments**. Allow this account to pay to accounts in other currencies.
* **Allow external payment requests**. Allow this account to request payments from accounts in other currencies.
* **Allow tag payments**. Allow this account to link NFC tags to their account and authorize payments through these linked tag.
* **Allow tag payment requests**. Allow this account to request payments authorized with NFC tags. To perform NFC tag payments, the payer needs to have "Allow tag payments" and the merchand needs to have "Allow tag payment requests".
* **Accept external payments automatically**. Extend the accept payments automatically to payment requests from accounts from other currencies as well.
* **On-payment credit limit update**. This setting enables a dynamic scheme for account credit limits. Concretely, the account credit limit is updated automatically every time this account receives a payment so the account credit limit equals the total sum of payments received by this account. The credit limit thus gradually grows with currency upd up to a configurable hard limit.

While this set of settings already provides a great level of flexibility, the project is set to provide more configurable features as they are requested by partner communities.

## Currency settings

Beyond the basic currency properties (name, code, symbol, scale, decimals), currencies have some additional settings.&#x20;

* **Initial credit limit**. The credit limit for the new accounts. Chamging this setting does not affect existing accounts.
* **Enable external payments**. Whether this currency support payments to other currencies (both incomming and outgoing).
* **Enable external payment requests**. Whether this currency suports payment requests from other currencies (both incomming and outgoing).
* **Default account settings**. Currency have a set of account settings by default: allow payments, allow payment requests, accept payemnts automatically, whitelist, etc. \
  For example, if a community wants regular accounts to be just able to pay and some special accounts to be able to both pay and request payments, they can set the allow payments to true and allow payment requests to false at currency level and then overwrite the allow payment requests setting for the special accounts.



