package notifications

// Listens the events stream and send relevant push notifications to users.

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"reflect"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/messaging"

	"github.com/komunitin/komunitin/notifications/events"
	"github.com/komunitin/komunitin/notifications/store"
)

const (
	TransferCommitted = "TransferCommitted"
	TransferPending   = "TransferPending"
	TransferRejected  = "TransferRejected"
	NeedPublished     = "NeedPublished"
	OfferPublished    = "OfferPublished"
	MemberJoined      = "MemberJoined"
)

type TransferEventDestination int

const (
	Payer TransferEventDestination = iota
	Payee
	Both
)

// These configuration parameters are set docker-compose.xml file.
var (
	/*accountingUrl = os.Getenv("KOMUNITIN_ACCOUNTING_URL")*/
	socialUrl = os.Getenv("KOMUNITIN_SOCIAL_URL")
	/*appUrl    = os.Getenv("KOMUNITIN_APP_URL")*/
)

// Wait for data in events stream and perform notifications as needed.
func Notifier(ctx context.Context) error {
	// TODO: Better error handling. Need to be studied carefully, but:
	//  - error at reading could be reattempted after X seconds
	//  - erroneous events/notifications could be moved to a seaparate stream

	// TODO: For far greather throughtput we can decouple reading events from
	// sending notifications by reading events into a channel and then having
	// different goroutines consuming the channel and performing the notifications.

	stream, err := store.NewStream(ctx, events.EventStream)
	if err != nil {
		return err
	}
	// Infinite loop
	for {
		// Blocking call to get next event in stream
		id, value, err := stream.Get(ctx)
		if err != nil {
			// Unexpected error, terminating.
			return err
		}
		err = handleEvent(ctx, value)
		if err != nil {
			// Error handling event. Just print and ignore event.
			log.Printf("Error handling event: %v\n", err)
		}
		// Acknowledge event handled
		stream.Ack(ctx, id)
	}
}

func handleEvent(ctx context.Context, value map[string]interface{}) error {
	event := value["name"]

	switch event {
	case TransferCommitted:
		return handleTransferEvent(ctx, value, Both)
	case TransferPending:
		return handleTransferEvent(ctx, value, Payer)
	case TransferRejected:
		return handleTransferEvent(ctx, value, Payee)
	case NeedPublished:
		return handleGroupEvent(ctx, value)
	case OfferPublished:
		return handleGroupEvent(ctx, value)
	case MemberJoined:
		return handleGroupEvent(ctx, value)
	default:
		log.Printf("Unkown event type %v\n", event)
	}
	return nil
}

func buildMessageData(value map[string]interface{}) (map[string]string, error) {
	data := make(map[string]string)
	data["event"] = value["name"].(string)
	data["code"] = value["code"].(string)
	data["user"] = value["user"].(string)

	decoded := make(map[string]string)
	err := json.Unmarshal([]byte(value["data"].(string)), &decoded)
	if err != nil {
		return nil, err
	}

	for key, value := range decoded {
		data[key] = value
	}

	return data, nil
}

func handleTransferEvent(ctx context.Context, value map[string]interface{}, dest TransferEventDestination) error {
	data, err := buildMessageData(value)
	if err != nil {
		return err
	}
	members := make([]string, 0, 2)
	if dest == Both || dest == Payer {
		members = append(members, data["payer"])
	}
	if dest == Both || dest == Payee {
		members = append(members, data["payee"])
	}

	// Notify members
	return notifyMembers(ctx, members, value["user"].(string), data)

}

func handleGroupEvent(ctx context.Context, value map[string]interface{}) error {

	// Get group members
	code := value["code"].(string)
	members, err := getGroupMembers(ctx, code)
	if err != nil {
		return err
	}

	memberIds := make([]string, len(members))
	for i, member := range members {
		memberIds[i] = member.Id
	}

	excludeUser := value["user"].(string)
	data, err := buildMessageData(value)
	if err != nil {
		return err
	}

	return notifyMembers(ctx, memberIds, excludeUser, data)
}

func notifyMembers(ctx context.Context, memberIds []string, excludeUser string, data map[string]string) error {
	tokens := []string{}

	for _, member := range memberIds {
		subscriptions, err := getMemberSubscriptions(ctx, member, excludeUser)
		if err != nil {
			return err
		}
		for _, sub := range subscriptions {
			tokens = append(tokens, sub.Token)
		}
	}

	if len(tokens) == 0 {
		return nil
	}

	// Break tokens in groups of 500 and send the message because of firebase limitations.
	for i := 0; i < len(tokens); i += 500 {
		end := i + 500
		if end > len(tokens) {
			end = len(tokens)
		}

		// Send notification
		message := &messaging.MulticastMessage{
			Tokens: tokens[i:end],
			Data:   data,
		}

		err := sendMessage(ctx, message)

		if err != nil {
			return err
		}
	}
	return nil
}

// Return the subscriptions of given member, excluding the ones related to the given user id.
func getMemberSubscriptions(ctx context.Context, memberId string, excludeUser string) ([]Subscription, error) {
	// Get connection to DB.
	store, err := store.NewStore()
	if err != nil {
		return nil, err
	}

	// Get subscriptions for this member.
	res, err := store.GetByIndex(ctx, "subscriptions", reflect.TypeOf((*Subscription)(nil)), "member", memberId)
	if err != nil {
		return nil, err
	}

	// Change types from []interface{} to []Subscription and remove subcriptions from the user that originated the event.
	subscriptions := []Subscription{}
	for _, sub := range res {
		// Convert to *Subscription and dereference.
		subscription := *(sub.(*Subscription))
		if subscription.User.Id != excludeUser {
			subscriptions = append(subscriptions, subscription)
		}
	}
	return subscriptions, nil
}

func sendMessage(ctx context.Context, message *messaging.MulticastMessage) error {
	// Credentials are implicitly loaded from a JSON file identifyed by the environment
	// variable GOOGLE_APPLICATION_CREDENTIALS.
	app, err := firebase.NewApp(ctx, nil)
	if err != nil {
		return fmt.Errorf("error initializing firebase: %v", err)
	}
	client, err := app.Messaging(ctx)
	if err != nil {
		return fmt.Errorf("error getting firebase messaging client: %v", err)
	}

	// Send the message!
	br, err := client.SendMulticast(ctx, message)
	if err != nil {
		return err
	}
	// TODO: Handle errors by deleting invalid tokens.

	log.Printf("%d messages sent.\n", br.SuccessCount)

	return nil
}
