# Notifications

The notifications service is a web service app written in Go responsible for delivering Push messages and emails to users in response to certain events.&#x20;

Google’s [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) (FCM) service is used to send push notifications to either Android, Apple or Web systems. Each device that wants to receive notifications must subscribe using their system API (either Android, iOS or the browser) to the notification service. From that call the client app gets a token that must be sent to the notifications API. With this token, the notifications API will be able to send push notifications to this particular device by sending the message to the FCM backend.

When an event happens either in the accounting service or the social service (eg a new member, or a new committed payment), this event is sent to the notifications service. The service will handle the queue of events and send the relevant notifications depending on the notifications preference.

The notifications service uses a Redis database for storing the event queue, the device subscriptions and user preferences.
