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

// Event names
const (
	TransferCommitted = "TransferCommitted"
	TransferPending   = "TransferPending"
	TransferRejected  = "TransferRejected"
	NeedPublished     = "NeedPublished"
	NeedExpired       = "NeedExpired"
	OfferPublished    = "OfferPublished"
	OfferExpired      = "OfferExpired"
	MemberJoined      = "MemberJoined"
)

// Event types (used for notification preferences)
const (
	MyAccount  = "myAccount"
	NewOffers  = "newOffers"
	NewNeeds   = "newNeeds"
	NewMembers = "newMembers"
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
	// Create a single connection to the DB.
	store, err := store.NewStore()
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
		err = handleEvent(ctx, value, store)
		if err != nil {
			// Error handling event. Just print and ignore event.
			log.Printf("Error handling event: %v\n", err)
		}
		// Acknowledge event handled
		stream.Ack(ctx, id)
	}
}

func handleEvent(ctx context.Context, value map[string]interface{}, store *store.Store) error {
	event := value["name"]

	switch event {
	case TransferCommitted:
		return handleTransferEvent(ctx, value, store, Both)
	case TransferPending:
		return handleTransferEvent(ctx, value, store, Payer)
	case TransferRejected:
		return handleTransferEvent(ctx, value, store, Payee)
	case NeedPublished:
		return handleGroupEvent(ctx, value, store, NewNeeds)
	case OfferPublished:
		return handleGroupEvent(ctx, value, store, NewOffers)
	case MemberJoined:
		return handleGroupEvent(ctx, value, store, NewMembers)
	case NeedExpired:
		return handleMemberEvent(ctx, value, store)
	case OfferExpired:
		return handleMemberEvent(ctx, value, store)
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

func handleMemberEvent(ctx context.Context, value map[string]interface{}, store *store.Store) error {
	data, err := buildMessageData(value)
	if err != nil {
		return err
	}
	members := []string{data["member"]}
	return notifyMembers(ctx, store, members, "", data, MyAccount)
}

func handleTransferEvent(ctx context.Context, value map[string]interface{}, store *store.Store, dest TransferEventDestination) error {
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
	return notifyMembers(ctx, store, members, value["user"].(string), data, MyAccount)

}

func handleGroupEvent(ctx context.Context, value map[string]interface{}, store *store.Store, eventType string) error {

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

	return notifyMembers(ctx, store, memberIds, excludeUser, data, eventType)
}

func notifyMembers(ctx context.Context, store *store.Store, memberIds []string, excludeUser string, data map[string]string, eventType string) error {
	// The array of tokens to send the message to.
	tokens := []string{}
	// A map to reverse from tokens to subscriptions in order to easily handle responses.
	tokenMap := make(map[string]*Subscription)

	for _, member := range memberIds {
		subscriptions, err := getMemberSubscriptions(ctx, store, member, excludeUser)
		if err != nil {
			return err
		}
		for _, sub := range subscriptions {
			// Check if user wants to receive notifications of this type.
			if sub.Settings[eventType] == true {
				tokens = append(tokens, sub.Token)
				tokenMap[sub.Token] = &sub
			}
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

		br, err := sendMessage(ctx, store, message)
		if err != nil {
			return err
		}
		// Handle responses
		log.Printf("Sent %d notifications with %d successes and %d failures.\n", (end - i), br.SuccessCount, br.FailureCount)
		handleResponses(ctx, store, br.Responses, tokens, tokenMap)
	}
	return nil
}

func handleResponses(ctx context.Context, store *store.Store, responses []*messaging.SendResponse, tokens []string, tokenMap map[string]*Subscription) {
	// Responses order is the same as tokens order, as per Firebase documentation.
	for i, r := range responses {
		token := tokens[i]
		sub := tokenMap[token]
		if r.Success {
			// Log success
			log.Printf("Notification sent to member %s.\n", sub.Member.Id)
		} else {
			// Log error
			log.Printf("Error sending notification to member %s: %v\n", sub.Member.Id, r.Error)
			if messaging.IsRegistrationTokenNotRegistered(r.Error) {
				store.Delete(ctx, "subscriptions", sub.Id)
				log.Printf("Subscription deleted for member %s.\n", sub.Member.Id)
			}
		}
	}
}

// Return the subscriptions of given member, excluding the ones related to the given user id.
func getMemberSubscriptions(ctx context.Context, store *store.Store, memberId string, excludeUser string) ([]Subscription, error) {
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

func sendMessage(ctx context.Context, store *store.Store, message *messaging.MulticastMessage) (*messaging.BatchResponse, error) {
	// Credentials are implicitly loaded from a JSON file identifyed by the environment
	// variable GOOGLE_APPLICATION_CREDENTIALS.
	app, err := firebase.NewApp(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("error initializing firebase: %v", err)
	}
	client, err := app.Messaging(ctx)
	if err != nil {
		return nil, fmt.Errorf("error getting firebase messaging client: %v", err)
	}

	// Send the message!
	return client.SendMulticast(ctx, message)

}

func successfulMessage(r *messaging.SendResponse, token string) {
	// Find member by token.

}
