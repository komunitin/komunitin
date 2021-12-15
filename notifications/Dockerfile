FROM golang

RUN mkdir /opt/notifications
WORKDIR /opt/notifications

# Install dlv debugger
RUN go install github.com/go-delve/delve/cmd/dlv@latest

COPY . .
RUN go build -o main .
ENV GOOGLE_APPLICATION_CREDENTIALS=/opt/notifications/komunitin-project-firebase-adminsdk.json

CMD ["./main"]