package notifications

import (
	"log"
	"net/http"

	"github.com/komunitin/jsonapi"
	"github.com/komunitin/komunitin/notifications/service"
	"github.com/komunitin/komunitin/notifications/store"
	"github.com/rs/xid"
)

// Device
type Subscription struct {
	Id    string `jsonapi:"primary,devices" json:"id"`
	Token string `jsonapi:"attr,token" json:"token"`
	// jsonapi lib doesn't support typed embedded structs.
	Settings map[string]interface{} `jsonapi:"attr,settings" json:"settings"`
	User     *ExternalUser          `jsonapi:"relation,user" json:"user"`
	Member   *ExternalMember        `jsonapi:"relation,member" json:"member"`
}

func (object ExternalResourceObject) JSONAPIMeta() *jsonapi.Meta {
	return &jsonapi.Meta{
		"external": object.External,
		"href":     object.Href,
	}
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
		// TODO: validate settings.

		if subscription.Id != "" {
			subscription.Id = xid.New().String()
		}
		// TODO: else, validate provided id has same user and member.

		// Store subscription indexed by member.
		err = store.Set(r.Context(), "subscriptions", subscription.Id, subscription, map[string]string{"member": subscription.Member.Id}, 0)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			log.Println(err)
			return
		}
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
