package events

// Implements the /events notifications API endpoint.
//
// The events service gets event objects and enqueues these events in the events stream.
// These are asynchronously consumed by the notifier process to send push messages to users.

import (
	"context"
	"crypto/subtle"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/komunitin/jsonapi"
	"github.com/komunitin/komunitin/notifications/model"
	"github.com/komunitin/komunitin/notifications/service"
	"github.com/komunitin/komunitin/notifications/store"
)

const (
	EventStream = "events"
)

type Event struct {
	// The type of the event
	Id       string                  `jsonapi:"primary,events"`
	Name     string                  `jsonapi:"attr,name"`
	Source   string                  `jsonapi:"attr,source"`
	Code     string                  `jsonapi:"attr,code"`
	Time     time.Time               `jsonapi:"attr,time,iso8601"`
	Data     map[string]interface{}  `jsonapi:"attr,data"`
	User     *model.ExternalUser     `jsonapi:"relation,user"`
	Transfer *model.ExternalTransfer `jsonapi:"relation,transfer,omitempty"`
}

var (
	expectedUser = os.Getenv("NOTIFICATIONS_EVENTS_USERNAME")
	expectedPass = os.Getenv("NOTIFICATIONS_EVENTS_PASSWORD")
)

func checkBasicAuth(w http.ResponseWriter, r *http.Request) bool {
	user, pass, ok := r.BasicAuth()
	if !ok {
		http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
	}
	usermatch := subtle.ConstantTimeCompare([]byte(user), []byte(expectedUser)) == 1
	passmatch := subtle.ConstantTimeCompare([]byte(pass), []byte(expectedPass)) == 1
	if usermatch && passmatch {
		return true
	} else {
		http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
		return false
	}
}

// Return the handler for requests to /events
func eventsHandler(stream store.Stream) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Check authentication by asking the caller to use notification client_id/client_secret pair as basic auth.
		if !checkBasicAuth(w, r) {
			return
		}
		// Validate request and get event.
		err := service.ValidatePost(w, r)
		if err != nil {
			return
		}
		event := new(Event)
		err = service.ValidateJson(w, r, event)
		if err != nil {
			return
		}
		// Validate provided data.
		if event.User == nil {
			http.Error(w, "Missing 'user' relationship", http.StatusBadRequest)
			return
		}
		data, err := json.Marshal(event.Data)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			log.Println(err.Error())
			return
		}
		value := map[string]interface{}{
			"name":   event.Name,
			"source": event.Source,
			"user":   event.User.Id,
			"time":   event.Time.String(),
			"code":   event.Code,
			"data":   data,
		}

		// TODO: delete this as transfer is not used anymore.
		if event.Transfer != nil {
			value["transfer"] = event.Transfer.Href
		}

		// Enqueue event to the stream.
		id, err := stream.Add(r.Context(), value)
		if err != nil {
			// Unexpected error
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			log.Println(err.Error())
			return
		}
		// Return success following JSON:API spec https://jsonapi.org/format/#crud-creating-responses.
		w.Header().Set(service.ContentType, jsonapi.MediaType)
		w.WriteHeader(http.StatusCreated)
		// Not adding Location header since events are not accessible (by the moment).
		// Send response, which is the same as the request but with the id.
		event.Id = id
		err = jsonapi.MarshalPayload(w, event)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			log.Println(err.Error())
			return
		}
	}
}

// Starts the events server.
func InitService() {
	// Create store connection.
	stream, err := store.NewStream(context.Background(), EventStream)
	if err != nil {
		log.Fatal(err)
	}
	http.HandleFunc("/events", eventsHandler(*stream))
}
