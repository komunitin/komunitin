package mails

import "context"

type Recipient struct {
	Name  string
	Email string
}

type Email struct {
	Subject  string
	BodyHtml string
	BodyText string
	To       []Recipient
	From     Recipient
	ReplyTo  Recipient
}

func (e *Email) AddRecipient(name, email string) {
	e.To = append(e.To, Recipient{Name: name, Email: email})
}

type MailSender interface {
	SendMail(ctx context.Context, message Email) error
}
