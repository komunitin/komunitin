#  Komunitin Notifications service
This microservice implements the Komunitin Notifications API.

This service is in charge of listening to events and sending Push Messages to subscribed users using Firebase Cloud Messaging.

## Run with docker
Execute the Notifications services locally:
1. Be sure that you have the `komunitin-project-firebase-adminsdk.json` credentials file in the project root.
2. Stand up services for dev purposes.
```
$ docker compose --profile run up --build
```

## Development run
1. Execute the local IntegralCES server at port 2029.
2. Be sure that you have the `komunitin-project-firebase-adminsdk.json` credentials file in the project root.
3. Run the service:
```
$ docker compose --profile dev up --build
```
4. Open Visual Code and run the Go debugger to start the service.
