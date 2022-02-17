#  Komunitin Notifications service
This microservice implements the Komunitin Notifications API.

## Build and run with docker
1. Startup RabbitMQ message broker and the Notifications service:
```
$ docker compose up -d
```
2. Send test messages to the message broker:
```
$ docker compose exec notifications 
```