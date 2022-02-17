package service

// JSON:API service helpers

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/komunitin/jsonapi"
)

const (
	ContentType = "Content-Type"
)

// Validates the request is POST and JSON:API content type.
func ValidatePost(w http.ResponseWriter, r *http.Request) error {
	// Validate HTTP POST Method.
	if r.Method != http.MethodPost {
		msg := http.StatusText(http.StatusMethodNotAllowed)
		http.Error(w, msg, http.StatusMethodNotAllowed)
		return errors.New(msg)
	}
	// Validate "application/vnd.api+json" Content-Type
	contentType := r.Header.Get(ContentType)
	if contentType != jsonapi.MediaType {
		msg := http.StatusText(http.StatusUnsupportedMediaType)
		http.Error(w, msg, http.StatusUnsupportedMediaType)
		return errors.New(msg)
	}
	return nil
}

// Decodes the request body into JSON and reports any encoding error.
func ValidateJson(w http.ResponseWriter, r *http.Request, res interface{}) error {
	// Use http.MaxBytesReader to enforce a maximum read of 16KB from the
	// response body. A request body larger than that will now result in
	// Decode() returning a "http: request body too large" error.
	body := http.MaxBytesReader(w, r.Body, 16*1024)
	err := jsonapi.UnmarshalPayload(body, res)
	// Error validation code from https://www.alexedwards.net/blog/how-to-properly-parse-a-json-request-body.
	if err != nil {
		var syntaxError *json.SyntaxError
		var unmarshalTypeError *json.UnmarshalTypeError
		var msg string
		switch {

		// Catch any syntax errors in the JSON and send an error message
		// which interpolates the location of the problem to make it
		// easier for the client to fix.
		case errors.As(err, &syntaxError):
			msg = fmt.Sprintf("Request body contains badly-formed JSON (at position %d)", syntaxError.Offset)
			http.Error(w, msg, http.StatusBadRequest)

		// In some circumstances Decode() may also return an
		// io.ErrUnexpectedEOF error for syntax errors in the JSON. There
		// is an open issue regarding this at
		// https://github.com/golang/go/issues/25956.
		case errors.Is(err, io.ErrUnexpectedEOF):
			msg = "Request body contains badly-formed JSON"
			http.Error(w, msg, http.StatusBadRequest)

		// Catch any type errors, like trying to assign a string in the
		// JSON request body to a int field in our Person struct. We can
		// interpolate the relevant field name and position into the error
		// message to make it easier for the client to fix.
		case errors.As(err, &unmarshalTypeError):
			msg = fmt.Sprintf("Request body contains an invalid value for the %q field (at position %d)", unmarshalTypeError.Field, unmarshalTypeError.Offset)
			http.Error(w, msg, http.StatusBadRequest)

		// An io.EOF error is returned by Decode() if the request body is
		// empty.
		case errors.Is(err, io.EOF):
			msg = "Request body must not be empty"
			http.Error(w, msg, http.StatusBadRequest)

		// Catch the error caused by the request body being too large. Again
		// there is an open issue regarding turning this into a sentinel
		// error at https://github.com/golang/go/issues/30715.
		case err.Error() == "http: request body too large":
			msg = "Request body must not be larger than 16KB"
			http.Error(w, msg, http.StatusRequestEntityTooLarge)

		// Catch errors from jsonapi module
		case errors.Is(err, jsonapi.ErrInvalidISO8601) || errors.Is(err, jsonapi.ErrInvalidType) || errors.Is(err, jsonapi.ErrUnknownFieldNumberType):
			http.Error(w, err.Error(), http.StatusBadRequest)

		// Otherwise default to logging the error and sending a 500 Internal
		// Server Error response.
		default:
			log.Println(err.Error())
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return err
		}
		return errors.New(msg)
	}
	// No error parsing JSON.
	return nil
}
