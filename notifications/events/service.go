package events

// Implements the /events notifications API endpoint.
//
// The events service gets event objects and enqueues these events in the events stream.
// These are asynchronously consumed by the notifier process to send push messages to users.

import (
	"context"
	"crypto/subtle"
	"log"
	"net/http"
	"time"

	"github.com/komunitin/jsonapi"
	"github.com/komunitin/komunitin/notifications/api"
	"github.com/komunitin/komunitin/notifications/config"
	"github.com/komunitin/komunitin/notifications/service"
)

// EventData object as reveived from JSON:API request.
type EventData struct {
	// The type of the event
	Id     string                 `jsonapi:"primary,events"`
	Name   string                 `jsonapi:"attr,name"`
	Source string                 `jsonapi:"attr,source"`
	Code   string                 `jsonapi:"attr,code"`
	Time   time.Time              `jsonapi:"attr,time,iso8601"`
	Data   map[string]interface{} `jsonapi:"attr,data"`
	User   *api.ExternalUser      `jsonapi:"relation,user"`
}

func checkBasicAuth(w http.ResponseWriter, r *http.Request) bool {
	user, pass, ok := r.BasicAuth()
	if !ok {
		http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
	}
	usermatch := subtle.ConstantTimeCompare([]byte(user), []byte(config.NotificationsEventsUsername)) == 1
	passmatch := subtle.ConstantTimeCompare([]byte(pass), []byte(config.NotificationsEventsPassword)) == 1
	if usermatch && passmatch {
		return true
	} else {
		http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
		return false
	}
}

// Return the handler for requests to /events
func eventsHandler(stream *EventStream) http.HandlerFunc {
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
		eventData := new(EventData)
		err = service.ValidateJson(w, r, eventData)
		if err != nil {
			return
		}
		// Validate provided data.
		if eventData.User == nil {
			http.Error(w, "Missing 'user' relationship", http.StatusBadRequest)
			return
		}

		// convert Data from map[string]interface{} to map[string]string
		data := make(map[string]string, len(eventData.Data))
		for k, v := range eventData.Data {
			if s, ok := v.(string); ok {
				data[k] = s
			} else {
				http.Error(w, "Data field must be a map of strings", http.StatusBadRequest)
				return
			}
		}

		// Create internal Event object.
		event := &Event{
			Name:   eventData.Name,
			Source: eventData.Source,
			Code:   eventData.Code,
			Time:   eventData.Time,
			Data:   data,
			User:   eventData.User.Id,
		}

		// Enqueue event to the stream.
		id, err := stream.Add(r.Context(), event)
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
		eventData.Id = id
		err = jsonapi.MarshalPayload(w, eventData)
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
	stream, err := NewEventsStream(context.Background(), "service")
	if err != nil {
		log.Fatal(err)
	}
	http.HandleFunc("/events", eventsHandler(stream))
}
