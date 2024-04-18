package mails

import (
	"embed"
	htmlTemplate "html/template"
	"strings"
	textTemplate "text/template"

	"github.com/komunitin/komunitin/notifications/i18n"
)

//go:embed template/html/*
var html embed.FS

//go:embed template/text/*
var text embed.FS

const (
	Payment = "Payment"
	Income  = "Income"
)

type Message struct {
	Subject  string
	BodyHtml string
	BodyText string
}

// Data for the template
type TemplateMainData struct {
	LogoUrl  string
	SiteName string
	Footer   string
	Greeting string
}

type TemplateTransferData struct {
	PayerAvatarUrl string
	PayerName      string
	PayerAccount   string
	PayeeAvatarUrl string
	PayeeName      string
	PayeeAccount   string
	Payment        bool
	Amount         string
	State          string
	Group          string
	Time           string
	Description    string
}

type TemplateActionData struct {
	ActionUrl  string
	ActionText string
}

type TemplateContentTransferData struct {
	Text string
}

// All data required for payments/incomes emails.
type EmailTransferData struct {
	TemplateMainData
	TemplateTransferData
	TemplateActionData
	TemplateContentTransferData
}

func buildTransferMessage(subject string, templateData EmailTransferData, t *i18n.Translator) (*Message, error) {
	// Functions available in the template
	funcMap := htmlTemplate.FuncMap{
		"t":         t.T,
		"uppercase": strings.ToUpper,
	}
	// Build HTML body
	htmlT, err := htmlTemplate.New("html").Funcs(funcMap).ParseFS(html, "template/html/*.html")
	if err != nil {
		return nil, err
	}
	w := new(strings.Builder)
	err = htmlT.ExecuteTemplate(w, "main", templateData)
	if err != nil {
		return nil, err
	}
	htmlBody := w.String()

	// Build text body
	textT, err := textTemplate.New("text").Funcs(funcMap).ParseFS(text, "template/text/*.txt")
	if err != nil {
		return nil, err
	}
	w.Reset()
	err = textT.ExecuteTemplate(w, "main", templateData)
	if err != nil {
		return nil, err
	}
	textBody := w.String()

	return &Message{
		Subject:  subject,
		BodyHtml: htmlBody,
		BodyText: textBody,
	}, nil

}
