package notifications

import (
	"log"
	"net/http"

	"github.com/komunitin/komunitin/notifications/service"
	"github.com/komunitin/komunitin/notifications/store"
)

// Device
type DeviceSubscription struct {
	User         string            `json:"user"`
	Subscription *PushSubscription `json:"subscription"`
}

// Device push subscription
type PushSubscription struct {
	Endpoint string `json:"endpoint"`
	Keys     struct {
		P256dh string `json:"p256dh"`
		Auth   string `json:"auth"`
	} `json:"auth"`
}

func devicesHandler(store *store.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Validate request and get event.
		err := service.ValidatePost(w, r)
		if err != nil {
			return
		}
		var device DeviceSubscription
		err = service.ValidateJson(w, r, &device)
		if err != nil {
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
}
