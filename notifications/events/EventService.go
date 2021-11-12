package events

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/google/jsonapi"
	"github.com/komunitin/komunitin/notifications/service"
	"github.com/komunitin/komunitin/notifications/store"
)

const (
	EventStream = "events"
)

type Transfer struct {
	Id string `jsonapi:"primary,transfers"`
}

type Event struct {
	// The type of the event
	Id       string    `jsonapi:"primary,events"`
	Name     string    `jsonapi:"attr,name"`
	Source   string    `jsonapi:"attr,source"`
	Time     time.Time `jsonapi:"attr,time,iso8601"`
	Transfer *Transfer `jsonapi:"relation,transfer,omitempty"`
}

// Implement Metable interface in Transfer object to declare that it is an external object.
func (transfer Transfer) JSONAPIMeta() *jsonapi.Meta {
	return &jsonapi.Meta{
		"external": true,
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
		var event Event
		err = service.ValidateJson(w, r, &event)
		if err != nil {
			return
		}
		// Enqueue event to the stream.
		id, err := stream.Add(r.Context(), map[string]interface{}{
			"name":   event.Name,
			"source": event.Source,
			"time":   event.Time.String(),
		})
		if err != nil {
			// Unexpected error
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			log.Println(err.Error())
			return
		}
		// Return success following JSON:API spec https://jsonapi.org/format/#crud-creating-responses.
		w.Header().Set(service.ContentType, jsonapi.MediaType)
		// Not adding Location header since events are not accessible (by the moment).
		w.WriteHeader(http.StatusCreated)
		// Send response, which is the same as the request but with the id.
		event.Id = id
		err = jsonapi.MarshalPayload(w, &event)
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
