package notifications

import (
	"context"
	"log"

	"github.com/komunitin/komunitin/notifications/events"
	"github.com/komunitin/komunitin/notifications/store"
)

// Wait for data in events stream and perform notifications as needed.
func Notifier(ctx context.Context) error {
	// TODO: Better error handling. Need to be studied carefully, but:
	//  - errors at reading could be reattempted after X seconds
	//  - erroneous events/notifications could be moved to a seaparate stream

	// TODO: For far greather throughtput we can decouple reading events from
	// sending notifications by reading events into a channel and then having
	// different goroutines consuming the channel and performing the notifications.

	stream, err := store.NewStream(ctx, events.EventStream)
	if err != nil {
		return err
	}
	// Infinite loop.
	for {
		// Blocking call to get next event in stream
		id, value, err := stream.Get(ctx)
		if err != nil {
			// Unexpected error, terminating.
			return err
		}
		err = handleEvent(value)
		if err != nil {
			// Unexpected error, terminating.
			return err
		}
		// Acknowledge event handled.
		stream.Ack(ctx, id)
	}
}

func handleEvent(value map[string]interface{}) error {
	log.Printf("New event of type %v recieved at %v from %v.\n", value["name"], value["time"], value["source"])
	return nil
}
