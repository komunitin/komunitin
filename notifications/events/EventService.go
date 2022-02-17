package events

// Implements the /events notifications API endpoint.
//
// The events service gets event objects and enqueues these events in the events stream.
// These are asynchronously consumed by the notifier process to send push messages to users.

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/komunitin/jsonapi"
	"github.com/komunitin/komunitin/notifications/service"
	"github.com/komunitin/komunitin/notifications/store"
)

const (
	EventStream = "events"
)

type ExternalTransfer struct {
	Id       string `jsonapi:"primary,transfers"`
	Href     string `jsonapi:"meta,href"`
	External bool   `jsonapi:"meta,external"`
}

type Event struct {
	// The type of the event
	Id       string            `jsonapi:"primary,events"`
	Name     string            `jsonapi:"attr,name"`
	Source   string            `jsonapi:"attr,source"`
	Code     string            `jsonapi:"attr,code"`
	Time     time.Time         `jsonapi:"attr,time,iso8601"`
	Transfer *ExternalTransfer `jsonapi:"relation,transfer,omitempty"`
}

// Implement Metable interface in Transfer object to declare that it is an external object.
func (transfer ExternalTransfer) JSONAPIMeta() *jsonapi.Meta {
	return &jsonapi.Meta{
		"external": true,
		"href":     transfer.Href,
	}
}

// Return the handler for requests to /events
func eventsHandler(stream store.Stream) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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
		value := map[string]interface{}{
			"name":   event.Name,
			"source": event.Source,
			"time":   event.Time.String(),
			"code":   event.Code,
		}
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
