package main

import (
	"log"

	"github.com/komunitin/komunitin/notifications/rabbitmq"
	"github.com/streadway/amqp"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func main() {
	// Connect to RabbitMQ server
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

	// Send a message to the queue.
	body := "Hello Komunitin Notifications API!"
	err = ch.Publish(
		"",     // exchange
		q.Name, // routing key
		false,  // mandatory
		false,  // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(body),
		})
	failOnError(err, "Failed to publish a message")
}
