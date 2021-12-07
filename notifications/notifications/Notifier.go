package notifications

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"reflect"
	"time"

	firebase "firebase.google.com/go"
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

type Transfer struct {
	Id       string    `jsonapi:"primary,transfers"`
	Amount   int       `jsonapi:"attr,amount"`
	Meta     string    `jsonapi:"attr,meta"`
	State    string    `jsonapi:"attr,state"`
	Expires  time.Time `jsonapi:"attr,expires,iso8601"`
	Created  time.Time `jsonapi:"attr,expires,iso8601"`
	Updated  time.Time `jsonapi:"attr,expires,iso8601"`
	Payer    *Account  `jsonapi:"relation,payer"`
	Payee    *Account  `jsonapi:"relation,payee"`
	Currency *Currency `jsonapi:"relation,currency"`
}

type Account struct {
	Id          string    `jsonapi:"primary,accounts"`
	Code        string    `jsonapi:"attr,code"`
	Balance     int       `jsonapi:"attr,balance"`
	CreditLimit int       `jsonapi:"attr,creditLimit"`
	DebitLimit  int       `jsonapi:"attr,debitLimit"`
	Currency    *Currency `jsonapi:"relation,currency"`
}

type Currency struct {
	Id         string `jsonapi:"primary,currencies"`
	CodeType   string `jsonapi:"attr,codeType"`
	Code       string `jsonapi:"attr,code"`
	Name       string `jsonapi:"attr,name"`
	NamePlural string `jsonapi:"attr,namePlural"`
	Symbol     string `jsonapi:"attr,symbol"`
	Decimals   int    `jsonapi:"attr,decimals"`
	Scale      int    `jsonapi:"attr,scale"`
	Value      int    `jsonapi:"attr,value"`
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

	members, err := jsonapi.UnmarshalManyPayload(res.Body, reflect.TypeOf((*Account)(nil)).Elem())

	if err != nil {
		return err
	}

	payerMember := members[0].(Member)
	payeeMember := members[1].(Member)

	payerMsg := fmt.Sprintf("Purchase of %s from %s.", formatAmount(transfer.Amount, transfer.Currency), payeeMember.Name)
	err = notifyMember(ctx, payerMsg, payerMember)

	if err != nil {
		return err
	}

	payeeMsg := fmt.Sprintf("Recieved %s from %s.", formatAmount(transfer.Amount, transfer.Currency), payerMember.Name)
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

func notifyMember(ctx context.Context, msg string, member Member) error {
	// 1. Get users by member.
	store, err := store.NewStore()
	if err != nil {
		return err
	}
	subscriptions, err := store.GetByIndex(ctx, "subscriptions", reflect.TypeOf((*MemberSubscription)(nil)), "member", member.Id)
	// Member should always have at leat one user, isn't it? But perhaps I should'n assume that at this point.
	if err != nil {
		return err
	}

	devices := []DeviceSubscription{}
	for _, subscription := range subscriptions {
		// 2. Get devices by user.
		userDevices, err := store.GetByIndex(ctx, "devices", reflect.TypeOf((*DeviceSubscription)(nil)), "user", subscription.(MemberSubscription).User.Id)
		if err != nil {
			return err
		}
		for _, device := range userDevices {
			devices = append(devices, device.(DeviceSubscription))
		}
	}

	for _, device := range devices {
		err = notifyDevice(ctx, msg, device)
		if err != nil {
			return err
		}
	}

	return nil
}

func notifyDevice(ctx context.Context, msg string, device DeviceSubscription) error {
	config := &firebase.Config{
		ProjectID: "komunitin-project",
	}
	app, err := firebase.NewApp(ctx, config, nil)
	if err != nil {
		return err
	}

	return nil
}
