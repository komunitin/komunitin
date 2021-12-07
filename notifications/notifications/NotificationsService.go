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
type DeviceSubscription struct {
	Id       string                 `jsonapi:"primary,devices" json:"id"`
	Endpoint string                 `jsonapi:"attr,endpoint" json:"endpoint"`
	Keys     map[string]interface{} `jsonapi:"attr,keys" json:"keys"`
	User     *User                  `jsonapi:"relation,user" json:"user"`
}
type MemberSubscription struct {
	Id     string  `jsonapi:"primary,subscriptions" json:"id"`
	User   *User   `jsonapi:"relation,user" json:"user"`
	Member *Member `jsonapi:"relation,member" json:"member"`
}

type User struct {
	Id string `jsonapi:"primary,users" json:"id"`
}

func (user User) JSONAPIMeta() *jsonapi.Meta {
	return &jsonapi.Meta{
		"external": true,
	}
}

type Member struct {
	Id   string `jsonapi:"primary,members" json:"id"`
	Name string `jsonapi:"attr,name"`
}

func (member Member) JSONAPIMeta() *jsonapi.Meta {
	return &jsonapi.Meta{
		"external": true,
	}
}

func devicesHandler(store *store.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Validate request and get subscription.
		err := service.ValidatePost(w, r)
		if err != nil {
			return
		}
		device := new(DeviceSubscription)
		err = service.ValidateJson(w, r, device)
		if err != nil {
			return
		}
		_, ok := device.Keys["p256dh"]
		if !ok {
			http.Error(w, "Missing p256dh key.", http.StatusBadRequest)
		}
		_, ok = device.Keys["auth"]
		if !ok {
			http.Error(w, "Missing auth key.", http.StatusBadRequest)
		}
		device.Id = xid.New().String()
		// save device subscription, indexed by user.
		err = store.Set(r.Context(), "devices", device.Id, device, map[string]string{"user": device.User.Id}, 0)
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
		err = jsonapi.MarshalPayload(w, device)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			log.Println(err)
			return
		}
	}
}

func subscriptionsHandler(store *store.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Validate request and get subscription.
		err := service.ValidatePost(w, r)
		if err != nil {
			return
		}
		subscription := new(MemberSubscription)
		err = service.ValidateJson(w, r, subscription)
		if err != nil {
			return
		}
		subscription.Id = xid.New().String()
		// Save member subscription, indexed by member.
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
	http.HandleFunc("/devices", devicesHandler(store))
	http.HandleFunc("/subscriptions", subscriptionsHandler(store))
}
