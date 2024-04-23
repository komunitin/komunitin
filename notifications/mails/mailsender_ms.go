package mails

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/mailersend/mailersend-go"
)

type MailerSend struct {
	ms *mailersend.Mailersend
}

func NewMailerSend(apiKey string) *MailerSend {
	return &MailerSend{
		ms: mailersend.NewMailersend(apiKey),
	}
}

func (ms *MailerSend) SendMail(ctx context.Context, message Email) error {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	m := ms.ms.Email.NewMessage()
	m.SetFrom(mailersend.Recipient{
		Name:  message.From.Name,
		Email: message.From.Email,
	})
	var recipients []mailersend.Recipient
	for _, to := range message.To {
		recipients = append(recipients, mailersend.Recipient{
			Name:  to.Name,
			Email: to.Email,
		})
	}
	m.SetRecipients(recipients)
	m.SetSubject(message.Subject)
	m.SetHTML(message.BodyHtml)
	m.SetText(message.BodyText)

	res, err := ms.ms.Email.Send(ctx, m)
	if err != nil {
		return err
	}

	if res.StatusCode >= http.StatusBadRequest {
		return fmt.Errorf("error sending email: %s", res.Status)
	}

	for _, recipient := range recipients {
		log.Printf("Email sent to %s <%s>\n", recipient.Name, recipient.Email)
	}

	return nil
}
