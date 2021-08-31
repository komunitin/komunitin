FROM golang:1.16-buster


RUN mkdir /opt/notifications
WORKDIR /opt/notifications

COPY . .

CMD ["go", "run", "notifications.go"]