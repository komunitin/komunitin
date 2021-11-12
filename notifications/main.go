package main

import (
	"context"
	"log"
	"net/http"

	"github.com/komunitin/komunitin/notifications/events"
	"github.com/komunitin/komunitin/notifications/notifications"
)

func main() {
	events.InitService()
	notifications.InitService()

	log.Println("Starting notifier service...")
	go notifications.Notifier(context.Background())

	log.Println("Starting web service...")
	go http.ListenAndServe(":2028", nil)

	log.Println("Press CTRL + C to exit.")

	// Block main thread forever using a blocking read operation
	// on a channel that gets never filled.
	forever := make(chan bool)
	<-forever
}
