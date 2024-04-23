package mails

import (
	"context"
	"log"
)

type MailSenderMock struct {
	SentEmails []Email
}

func NewMockMailSender() *MailSenderMock {
	return &MailSenderMock{
		SentEmails: []Email{},
	}
}

func (ms *MailSenderMock) SendMail(ctx context.Context, message Email) error {
	ms.SentEmails = append(ms.SentEmails, message)
	log.Printf(`==============EMAIL==============
	From: %s <%s>
	To: %s <%s>
	Subject: %s
	Text: %s
	=================================
	`, message.From.Name, message.From.Email, message.To[0].Name, message.To[0].Email, message.Subject, message.BodyText)
	return nil
}
