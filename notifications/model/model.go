package model

// Komunitin API object models.

import (
	"time"

	"github.com/komunitin/jsonapi"
)

type Member struct {
	Id      string           `jsonapi:"primary,members"`
	Code    string           `jsonapi:"attr,code"`
	Name    string           `jsonapi:"attr,name"`
	Account *ExternalAccount `jsonapi:"relation,account"`
	// Ommitted other fields.
}

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

// The jonapi library does not support embedded structs. There
// is a branch with this feature in the repo but it is inactive
// and not merged. So we need to repeat all the fields for each type.
// For some types we're just using the id and then we don't need to
// implement the meta part so far.

type ExternalMember struct {
	Id string `jsonapi:"primary,members" json:"id"`
}

type ExternalAccount struct {
	Id string `jsonapi:"primary,accounts" json:"id"`
}

// External User.
type ExternalUser struct {
	Id       string `jsonapi:"primary,users" json:"id"`
	Href     string `jsonapi:"meta,href" json:"href"`
	External bool   `jsonapi:"meta,external" json:"external"`
}

func (object ExternalUser) JSONAPIMeta() *jsonapi.Meta {
	return &jsonapi.Meta{
		"external": object.External,
		"href":     object.Href,
	}
}

// External Transfer object. Use the href URL to fetch the actual transfer object.
type ExternalTransfer struct {
	Id       string `jsonapi:"primary,transfers" json:"id"`
	Href     string `jsonapi:"meta,href" json:"href"`
	External bool   `jsonapi:"meta,external" json:"external"`
}

// Implement the Metable interface for ExternalTransfer.
// https://pkg.go.dev/github.com/google/jsonapi#readme-meta
func (object ExternalTransfer) JSONAPIMeta() *jsonapi.Meta {
	return &jsonapi.Meta{
		"external": object.External,
		"href":     object.Href,
	}
}
