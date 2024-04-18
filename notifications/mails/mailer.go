package mails

// Listens the events stream and send relevant emails to users.

// This service relies on the Komunitin api in order to fetch
// the user, users settings, members and message data.

import (
	"context"
	"fmt"
	"log"
	"math"
	"net/http"
	"time"

	"github.com/mailersend/mailersend-go"

	"github.com/komunitin/komunitin/notifications/api"
	"github.com/komunitin/komunitin/notifications/config"
	"github.com/komunitin/komunitin/notifications/events"
	"github.com/komunitin/komunitin/notifications/i18n"
	"golang.org/x/text/number"
)

func Mailer(ctx context.Context) error {
	// Open the events stream.
	stream, err := events.NewEventsStream(ctx, "mailer")
	if err != nil {
		return err
	}

	// Infinite loop
	for {
		// Blocking call to get next event in stream
		event, err := stream.Get(ctx)
		if err != nil {
			// Unexpected error, terminating.
			return err
		}
		err = handleEvent(ctx, event)
		if err != nil {
			// Error handling event. Just print and ignore event.
			log.Printf("Error handling event: %v\n", err)
		}
		// Acknowledge event handled
		stream.Ack(ctx, event.Id)
	}
}

func handleEvent(ctx context.Context, event *events.Event) error {
	switch event.Name {
	case events.TransferCommitted:
		return handleTransferCommitted(ctx, event)
	}
	return nil
}

func handleTransferCommitted(ctx context.Context, event *events.Event) error {
	// We need to send an email to the payer and another to the payee.
	payerMemberId := event.Data["payer"]
	payeeMemberId := event.Data["payee"]
	transferId := event.Data["transfer"]

	// Fetch transfer details, payer and payee details and related user emails.
	transfer, err := api.GetTransfer(ctx, event.Code, transferId)
	if err != nil {
		return err
	}
	payerMember, err := api.GetMember(ctx, event.Code, payerMemberId)
	if err != nil {
		return err
	}
	payerUsers, err := api.GetMemberUsers(ctx, payerMemberId)
	if err != nil {
		return err
	}
	payeeMember, err := api.GetMember(ctx, event.Code, payeeMemberId)
	if err != nil {
		return err
	}
	payeeUsers, err := api.GetMemberUsers(ctx, payeeMemberId)
	if err != nil {
		return err
	}
	// Send email to payer users
	for _, user := range payerUsers {
		if userWantAccountEmails(user) {
			sendPayerEmail(ctx, user, payerMember, payeeMember, transfer)
		}
	}

	// Send email to payee users
	for _, user := range payeeUsers {
		if userWantAccountEmails(user) {
			sendPayeeEmail(ctx, user, payerMember, payeeMember, transfer)
		}
	}

	return nil
}

func userWantAccountEmails(user *api.User) bool {
	komunitin := user.Settings.Komunitin
	if !komunitin {
		return false
	}
	emails := user.Settings.Emails
	if emails == nil {
		return false
	}
	myAccount, ok := emails["myAccount"]
	if !ok {
		return false
	}
	return myAccount.(bool)
}

// Creates the EmailTransferData object with the generic data required for the template,
// that is not specific to the payer, payee or exact type of event.
func buildTransferTemplateData(t *i18n.Translator, payer *api.Member, payee *api.Member, transfer *api.Transfer) EmailTransferData {
	templateData := EmailTransferData{
		TemplateMainData: TemplateMainData{
			LogoUrl:  config.KomunitinAppUrl + "/logos/logo-200.png",
			SiteName: "Komunitin",
			Footer:   t.T("footer"),
		},
		TemplateTransferData: TemplateTransferData{
			PayerAvatarUrl: payer.Image,
			PayerName:      payer.Name,
			PayerAccount:   transfer.Payer.Code,
			PayeeAvatarUrl: payee.Image,
			PayeeName:      payee.Name,
			PayeeAccount:   transfer.Payee.Code,
			Amount:         FormatCurrency(transfer.Amount, transfer.Currency, t),
			State:          t.T(transfer.State),
			Group:          transfer.Currency.Code,
			Time:           t.Dt(transfer.Created),
			Description:    transfer.Meta,
		},
		TemplateActionData: TemplateActionData{
			ActionUrl:  config.KomunitinAppUrl + "/groups/" + transfer.Currency.Code + "/transactions/" + transfer.Id,
			ActionText: t.T("viewTransaction"),
		},
	}
	return templateData
}

func buildPayerMessage(user *api.User, payer *api.Member, payee *api.Member, transfer *api.Transfer) (*Message, error) {
	t, err := i18n.NewTranslator(user.Settings.Language)
	if err != nil {
		return nil, err
	}
	templateData := buildTransferTemplateData(t, payer, payee, transfer)
	templateData.Greeting = t.Td("hello", map[string]string{"Name": payer.Name})
	templateData.Payment = true
	templateData.Text = t.Td("paymentText", map[string]string{"Amount": templateData.Amount, "PayeeName": payee.Name})
	return buildTransferMessage(t.T("paymentSubject"), templateData, t)
}

func sendPayerEmail(ctx context.Context, user *api.User, payer *api.Member, payee *api.Member, transfer *api.Transfer) error {
	message, err := buildPayerMessage(user, payer, payee, transfer)
	if err != nil {
		return err
	}
	return sendMail(ctx, payer.Name, user.Email, message)
}

func buildPayeeMessage(user *api.User, payer *api.Member, payee *api.Member, transfer *api.Transfer) (*Message, error) {
	t, err := i18n.NewTranslator(user.Settings.Language)
	if err != nil {
		return nil, err
	}
	templateData := buildTransferTemplateData(t, payer, payee, transfer)
	templateData.Greeting = t.Td("hello", map[string]string{"Name": payee.Name})
	templateData.Payment = false
	templateData.Text = t.Td("incomeText", map[string]string{"Amount": templateData.Amount, "PayerName": payer.Name})
	return buildTransferMessage(t.T("incomeSubject"), templateData, t)
}

func sendPayeeEmail(ctx context.Context, user *api.User, payer *api.Member, payee *api.Member, transfer *api.Transfer) error {
	message, err := buildPayeeMessage(user, payer, payee, transfer)
	if err != nil {
		return err
	}
	return sendMail(ctx, payee.Name, user.Email, message)
}

func FormatCurrency(amount int, currency *api.Currency, t *i18n.Translator) string {
	scaled := float64(amount) / math.Pow10(currency.Scale)
	return t.C(scaled, currency.Symbol, number.Scale(currency.Decimals))
}

func sendMail(ctx context.Context, name string, email string, message *Message) error {
	ms := mailersend.NewMailersend(config.MailersendApiKey)

	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	mail := ms.Email.NewMessage()
	mail.SetFrom(mailersend.From{
		Name:  "Komunitin",
		Email: "noreply@komunitin.org",
	})
	mail.SetRecipients([]mailersend.Recipient{
		{
			Name:  name,
			Email: email,
		},
	})
	mail.SetSubject(message.Subject)
	mail.SetHTML(message.BodyHtml)
	mail.SetText(message.BodyText)

	res, err := ms.Email.Send(ctx, mail)
	if err != nil {
		return err
	}

	if res.StatusCode >= http.StatusBadRequest {
		return fmt.Errorf("error sending email: %s", res.Status)
	}

	log.Printf("Email sent to %s <%s>\n", name, email)
	return nil
}
