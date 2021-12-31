package notifications

// Komunitin API object models.

import (
	"time"
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

type ExternalResourceObject struct {
	Href     string `jsonapi:"meta,href" json:"href"`
	External bool   `jsonapi:"meta,external" json:"external"`
}

type ExternalMember struct {
	ExternalResourceObject
	Id string `jsonapi:"primary,members" json:"id"`
}

type ExternalUser struct {
	ExternalResourceObject
	Id string `jsonapi:"primary,users" json:"id"`
}

type ExternalAccount struct {
	ExternalResourceObject
	Id string `jsonapi:"primary,accounts" json:"id"`
}
