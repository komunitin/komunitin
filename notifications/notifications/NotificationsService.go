package notifications

// Implements the /subscriptions Notifications API endpoint.

import (
	"log"
	"net/http"
	"reflect"

	"github.com/komunitin/jsonapi"
	"github.com/komunitin/komunitin/notifications/model"
	"github.com/komunitin/komunitin/notifications/service"
	"github.com/komunitin/komunitin/notifications/store"
	"github.com/rs/xid"
)

// Subscrption resource object
type Subscription struct {
	Id    string `jsonapi:"primary,subscriptions" json:"id"`
	Token string `jsonapi:"attr,token" json:"token"`
	// jsonapi lib doesn't support typed embedded structs.
	Settings map[string]interface{} `jsonapi:"attr,settings" json:"settings"`
	User     *model.ExternalUser    `jsonapi:"relation,user" json:"user"`
	Member   *model.ExternalMember  `jsonapi:"relation,member" json:"member"`
}

func subscriptionsHandler(store *store.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// TODO: Validate authorization token.

		// Validate request and get subscription.
		err := service.ValidatePost(w, r)
		if err != nil {
			// Http error already sent by called function.
			return
		}
		subscription := new(Subscription)
		err = service.ValidateJson(w, r, subscription)
		if err != nil {
			// Http error already sent by called function.
			return
		}
		// Validate provided data.
		if subscription.Member == nil || subscription.User == nil {
			http.Error(w, "Missing member and/or user relationships.", http.StatusBadRequest)
			return
		}
		// TODO: Validate that provided user/member matches the one privided in authorization.

		// Check if provided subscription already exists.
		existing, err := store.GetByIndex(r.Context(), "subscriptions", reflect.TypeOf(subscription), "member", subscription.Member.Id)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			log.Println(err)
			return
		}
		// Check if device is already subscribed
		found := false
		for _, current := range existing {
			sub := current.(*Subscription)
			if sub.Token == subscription.Token &&
				sub.Member.Id == subscription.Member.Id &&
				sub.User.Id == subscription.User.Id {
				// Set the subscription id to the matching id so the subscription will ve overwritten.
				subscription.Id = sub.Id
				found = true
			}
		}
		if !found {
			subscription.Id = xid.New().String()
		}

		// Store subscription indexed by member.
		err = store.Set(r.Context(), "subscriptions", subscription.Id, subscription, map[string]string{"member": subscription.Member.Id}, 0)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			log.Println(err)
			return
		}
		log.Printf("Stored subscription %s.\n", subscription.Id)

		// Return success following JSON:API spec https://jsonapi.org/format/#crud-creating-responses.
		w.Header().Set(service.ContentType, jsonapi.MediaType)
		// Not adding Location header since events are not accessible (by the moment).
		w.WriteHeader(http.StatusCreated)
		// return same object (with id) as response.
		err = jsonapi.MarshalPayload(w, subscription)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			log.Println(err)
			return
		}
	}
}

func InitService() {
	store, err := store.NewStore()
	if err != nil {
		log.Fatal(err)
	}
	http.HandleFunc("/subscriptions", subscriptionsHandler(store))
}
