FROM golang:1.17

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
ENV GOOGLE_APPLICATION_CREDENTIALS=/opt/notifications/komunitin-project-firebase-adminsdk.json

CMD ["./main"]