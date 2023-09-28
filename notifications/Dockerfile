FROM golang:1.20 as notifications-build

RUN mkdir /opt/notifications
WORKDIR /opt/notifications

# Install dlv debugger
RUN go install github.com/go-delve/delve/cmd/dlv@latest

# Download dependencies first so they're cached
COPY go.mod .
COPY go.sum .
RUN go mod download

# Build project
COPY . .
RUN go build -o main .

# Start golang debugger
FROM notifications-build as notifications-dev

ENV GOOGLE_APPLICATION_CREDENTIALS=/opt/notifications/komunitin-project-firebase-adminsdk.json

EXPOSE 40000
EXPOSE 2028

CMD dlv debug github.com/komunitin/komunitin/notifications -l 0.0.0.0:40000 --headless=true --log=true --api-version=2

# Build minimal production image
FROM notifications-build as notifications

RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

ENV GOOGLE_APPLICATION_CREDENTIALS=/opt/notifications/komunitin-project-firebase-adminsdk.json

WORKDIR /opt/notifications

EXPOSE 2028

CMD ["/opt/notifications/main"]
