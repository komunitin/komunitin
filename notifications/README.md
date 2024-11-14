#  Komunitin Notifications service
This microservice implements the Komunitin Notifications API.

Features:
 - Listen to the events/ endpoint so other components can send events.
 - Listen to the subscriptions/ endpoint so end users can subscribe devuces to push notifications.
 - Send push notifications to the subscribed users on relevant events.
 - Send emails to users on relevant events.

This service uses Google Cloud Messaging (GCM) to send push notifications and MailerSend to send emails.

## Run with docker
Execute the Notifications services locally:
1. Be sure that you have the `komunitin-project-firebase-adminsdk.json` credentials file in the project root and the required environment variables in the `.env` file.
2. Stand up services for dev purposes.
```
$ docker compose --profile run up --build
```

## Development run
1. Execute the local IntegralCES server at port 2029.
2. Be sure that you have the `komunitin-project-firebase-adminsdk.json` credentials file in the project root and the required environment variables in the `.env` file.
3. Run the service:
```
$ docker compose --profile dev up --build
```
4. Open Visual Code and run the Go debugger to start the service.

## Run unit tests
Currently the i18n and the mails packages are tested. To run all the tests execute:
```
go test ./...
```
