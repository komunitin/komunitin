package i18n

import (
	"testing"

	"golang.org/x/text/number"
)

func TestEnglish(t *testing.T) {
	en, err := NewTranslator("en-us")
	if err != nil {
		t.Error(err)
	}
	if en.T("transactionDetails") != "Transaction details" {
		t.Error("transactionDetails translation failed")
	}
	if en.Td("hello", map[string]string{"Name": "John"}) != "Hello John," {
		t.Error("hello translation failed")
	}
	if en.N(1.23456, number.Scale(2)) != "1.23" {
		t.Error("number format failed")
	}
	if c := en.C(1.23456, "€", number.Scale(2)); c != "€1.23" {
		t.Errorf("currency format failed: %s", c)
	}
}

func TestSpanish(t *testing.T) {
	es, err := NewTranslator("es")
	if err != nil {
		t.Error(err)
	}
	if es.T("transactionDetails") != "Detalles de la transacción" {
		t.Error("transactionDetails translation failed")
	}
	if es.Td("hello", map[string]string{"Name": "Juan"}) != "Hola Juan," {
		t.Error("hello translation failed")
	}
	if es.N(1.23456, number.Scale(2)) != "1,23" {
		t.Error("number format failed")
	}
	if c := es.C(1.23456, "€", number.Scale(2)); c != "1,23€" {
		t.Errorf("currency format failed: %s", c)
	}
}

func TestCatalan(t *testing.T) {
	cat, err := NewTranslator("ca")
	if err != nil {
		t.Error(err)
	}
	if cat.T("transactionDetails") != "Detalls de la transacció" {
		t.Error("transactionDetails translation failed")
	}
	if cat.Td("hello", map[string]string{"Name": "Joan"}) != "Hola Joan," {
		t.Error("hello translation failed")
	}
	if cat.N(1.23456, number.Scale(2)) != "1,23" {
		t.Error("number format failed")
	}
	if c := cat.C(1.23456, "€", number.Scale(2)); c != "1,23€" {
		t.Errorf("currency format failed: %s", c)
	}
}
