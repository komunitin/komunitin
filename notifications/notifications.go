package main

import (
	"log"

	"github.com/komunitin/komunitin/notifications/rabbitmq"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func main() {
	// Blocking function until successful connection.
	conn := rabbitmq.Connect()
	// Close connection before exiting.
	defer conn.Close()

	// Create a channel (where the api is)
	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	// Create a queue (if not exists)
	q, err := ch.QueueDeclare(
		"accounting", // name
		false,        // durable
		false,        // delete when unused
		false,        // exclusive
		false,        // no-wait
		nil,          // arguments
	)
	failOnError(err, "Failed to declare a queue")

	// Start getting the messages from the declared queue into the channel msgd.
	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Failed to register a consumer")

	// Create an unbuffered channel for bool types.
	// Type is not important but we have to give one anyway
	forever := make(chan bool)

	// fire up a goroutine that hooks onto msgs channel and reads
	// anything that pops into it. This essentially is a thread of
	// execution within the main thread. msgs is a channel constructed by
	// previous code.
	go func() {
		for d := range msgs {
			// Don't need to ack since Consume() was called with auto-ack=true.
			log.Printf("Received a message: %s", d.Body)
		}
	}()

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")

	// Blocking read operation to the forever channel. Since it is neer filled,
	// the read operation blocks forever.
	<-forever
}
