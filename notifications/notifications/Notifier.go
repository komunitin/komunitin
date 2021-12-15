package notifications

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"reflect"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/messaging"

	"github.com/komunitin/jsonapi"
	"github.com/komunitin/komunitin/notifications/events"
	"github.com/komunitin/komunitin/notifications/store"
)

const (
	TransferCommitted = "TransferCommitted"
)

const (
	AccountingUrl = "http://localhost:2029/ces/api/accounting"
	SocialUrl     = "http://localhost:2029/ces/api/social"
)

type Message struct {
	Title string
	Body  string
}

// Wait for data in events stream and perform notifications as needed.
func Notifier(ctx context.Context) error {
	// TODO: Bettererror handling. Need to be studied carefully, but:
	//  - error at reading could be reattempted after X seconds
	//  - erroneous events/notifications could be moved to a seaparate stream

	// TOO: For far greather throughtput we can decouple reading events from
	// sending notifications by reading events ino a channel and then having
	// different goroutines consuming he channel and performing the notifications.

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
			// Unexpected error,terminating.
			return err
		}
		// Acknowledge event handled
		stream.Ack(ctx, id)
	}
}

func handleEvent(ctx context.Context, value map[string]interface{}) error {
	event := value["name"]
	switch event {
	case TransferCommitted:
		return handleTransferCommitted(ctx, value)
	default:
		log.Printf("Unkown event type %v\n", event)
	}
	return nil
}

func handleTransferCommitted(ctx context.Context, value map[string]interface{}) error {

	// Get full transfer object.  Code missing!
	res, err := http.Get(value["transfer"].(string))
	if err != nil {
		return err
	}
	transfer := new(Transfer)
	err = jsonapi.UnmarshalPayload(res.Body, transfer)
	if err != nil {
		return err
	}

	code := value["code"].(string)
	// Get payer and payee accounts.
	payer := transfer.Payer
	payee := transfer.Payee

	// Get the members related to these accounts.
	res, err = http.Get(SocialUrl + "/" + code + "/members?filter[account]=" + payer.Id + "," + payee.Id)

	if err != nil {
		return err
	}

	members, err := jsonapi.UnmarshalManyPayload(res.Body, reflect.TypeOf((*Member)(nil)).Elem())

	if err != nil {
		return err
	}

	payerMember := members[0].(Member)
	payeeMember := members[1].(Member)

	payerMsg := Message{
		Title: "New purchase",
		Body:  fmt.Sprintf("Purchase of %s from %s.", formatAmount(transfer.Amount, transfer.Currency), payeeMember.Name),
	}
	err = notifyMember(ctx, payerMsg, payerMember)

	if err != nil {
		return err
	}

	payeeMsg := Message{
		Title: "Payment recieved",
		Body:  fmt.Sprintf("Recieved %s from %s.", formatAmount(transfer.Amount, transfer.Currency), payerMember.Name),
	}
	err = notifyMember(ctx, payeeMsg, payeeMember)

	if err != nil {
		return err
	}

	return nil
}

// Format a currency amount for human readability.
func formatAmount(amount int, currency *Currency) string {
	format := fmt.Sprint("%.", currency.Decimals, "f%s") // "%.2f%s"
	return fmt.Sprintf(format, float64(amount)/float64(currency.Scale), currency.Symbol)
}

func notifyMember(ctx context.Context, msg Message, member Member) error {
	// 1. Get users by member.
	store, err := store.NewStore()
	if err != nil {
		return err
	}

	// Get subscriptions for this member.
	res, err := store.GetByIndex(ctx, "subscriptions", reflect.TypeOf((*Subscription)(nil)), "member", member.Id)
	if err != nil {
		return err
	}

	// Just change types from []interface{} to []Subscription.
	subscriptions := make([]Subscription, len(res))
	for i, sub := range res {
		subscriptions[i] = sub.(Subscription)
	}

	return notifyDevices(ctx, msg, subscriptions)
}

func notifyDevices(ctx context.Context, msg Message, subscriptions []Subscription) error {
	// Credentials are implicitly loaded from a JSON file identifyed by the environment
	// variable GOOGLE_APPLICATION_CREDENTIALS.
	app, err := firebase.NewApp(ctx, nil)
	if err != nil {
		return fmt.Errorf("Error initializing firebase: %v\n", err)
	}
	client, err := app.Messaging(ctx)
	if err != nil {
		return fmt.Errorf("Error getting firebase messaging client: %v\n", err)
	}

	// Build array of registration tokens
	tokens := make([]string, len(subscriptions))
	for i, sub := range subscriptions {
		tokens[i] = sub.Token
	}

	// Build firebase message object.
	message := &messaging.MulticastMessage{
		Tokens: tokens,
		Notification: &messaging.Notification{
			Title: msg.Title,
			Body:  msg.Body,
		},
	}

	// Send the message!
	br, err := client.SendMulticast(ctx, message)
	if err != nil {
		return err
	}

	log.Default().Printf("%d messages sent.\n", br.SuccessCount)

	return nil
}
