package rabbitmq

import (
	"log"
	"time"

	"github.com/streadway/amqp"
)

func Connect() *amqp.Connection {
	for {
		// Connect to RabbitMQ server
		url := "amqp://guest:guest@rabbitmq:5672/"
		conn, err := amqp.Dial(url)
		if err == nil {
			return conn
		}
		log.Println(err)
		log.Printf("Retrying connection to RabbitMQ at %s.", url)

		time.Sleep(500 * time.Millisecond)
	}
}
