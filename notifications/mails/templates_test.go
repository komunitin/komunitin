package mails

import (
	"strings"
	"testing"
	"time"

	"github.com/komunitin/komunitin/notifications/api"
)

func TestTransferMessage(t *testing.T) {
	user := &api.User{
		Id:    "1",
		Email: "user@example.com",
		Settings: &api.UserSettings{
			Language: "en",
		},
	}
	created, _ := time.Parse(time.RFC3339, "2024-04-16T23:05:00Z")
	transfer := &api.Transfer{
		Id:     "1",
		Amount: 100,
		State:  "committed",
		Meta:   "Test transaction",
		Payer: &api.Account{
			Code: "001",
		},
		Payee: &api.Account{
			Code: "002",
		},
		Currency: &api.Currency{
			Code:     "TEST",
			Symbol:   "#",
			Decimals: 2,
			Scale:    2,
		},
		Created: created,
	}
	payer := &api.Member{
		Id:    "1",
		Name:  "Payer",
		Image: "https://example.com/payer.jpg",
	}
	payee := &api.Member{
		Id:    "2",
		Name:  "Payee",
		Image: "https://example.com/payee.jpg",
	}

	msg, err := buildPayerMessage(user, payer, payee, transfer)
	if err != nil {
		t.Error(err)
	}
	if msg.Subject != "Payment sent" {
		t.Errorf("Expected 'Payment sent', got '%s'", msg.Subject)
	}
	if !strings.Contains(msg.BodyHtml, "#1.00") {
		t.Errorf("Expected '#1.00', got '%s'", msg.BodyHtml)
	}
	if !strings.Contains(msg.BodyHtml, "Hello Payer,") {
		t.Errorf("Expected 'Hello Payer,', got '%s'", msg.BodyHtml)
	}
	if !strings.Contains(msg.BodyHtml, "View transaction") {
		t.Errorf("Expected 'View transaction', got '%s'", msg.BodyHtml)
	}
	if !strings.Contains(msg.BodyHtml, "Test transaction") {
		t.Errorf("Expected 'Test transaction', got '%s'", msg.BodyHtml)
	}
	if !strings.Contains(msg.BodyHtml, "You have paid #1.00 to Payee.") {
		t.Errorf("Expected 'You have paid #1.00 to Payee.', got '%s'", msg.BodyHtml)
	}

	if !strings.Contains(msg.BodyText, "#1.00") {
		t.Errorf("Expected '#1.00', got '%s'", msg.BodyText)
	}
	if !strings.Contains(msg.BodyText, "Hello Payer,") {
		t.Errorf("Expected 'Hello Payer,', got '%s'", msg.BodyText)
	}
	if !strings.Contains(msg.BodyText, "You have paid #1.00 to Payee.") {
		t.Errorf("Expected 'You have paid #1.00 to Payee.', got '%s'", msg.BodyText)
	}

	// Test other lang
	user.Settings.Language = "es"
	msg, err = buildPayerMessage(user, payer, payee, transfer)
	if err != nil {
		t.Error(err)
	}
	if msg.Subject != "Pago enviado" {
		t.Errorf("Expected 'Pago enviado', got '%s'", msg.Subject)
	}
	if !strings.Contains(msg.BodyHtml, "Has pagado 1,00# a Payee.") {
		t.Errorf("Expected 'Has pagado 1,00# a Payee.', got '%s'", msg.BodyHtml)
	}
	if !strings.Contains(msg.BodyText, "Has pagado 1,00# a Payee.") {
		t.Errorf("Expected 'Has pagado 1,00# a Payee.', got '%s'", msg.BodyText)
	}
}
