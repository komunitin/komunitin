package mails

// Listens the events stream and send relevant emails to users.

// This service relies on the Komunitin api in order to fetch
// the user, users settings, members and message data.

import (
	"context"
	"log"
	"math"

	"github.com/komunitin/komunitin/notifications/api"
	"github.com/komunitin/komunitin/notifications/config"
	"github.com/komunitin/komunitin/notifications/events"
	"github.com/komunitin/komunitin/notifications/i18n"
	"golang.org/x/text/number"
)

// These are the possible email types that can be sent.
type EmailType int

const (
	undefinedEmailType EmailType = iota
	paymentSent
	paymentReceived
	paymentRejected
	paymentPending
)

type fetchWichUsers int

const (
	fetchBothUsers = iota
	fetchPayerUsers
	fetchPayeeUsers
)

var mailSender MailSender

func Mailer(ctx context.Context) error {
	// Open the events stream.
	stream, err := events.NewEventsStream(ctx, "mailer")
	if err != nil {
		return err
	}

	if config.SendMails == "true" {
		mailSender = NewMailerSend(config.MailersendApiKey)
	} else {
		mailSender = NewMockMailSender()
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
	case events.TransferRejected:
		return handleTransferRejected(ctx, event)
	case events.TransferPending:
		return handleTransferPending(ctx, event)
	case events.MemberJoined:
		return handleMemberJoined(ctx, event)
	case events.MemberRequested:
		return handleMemberRequested(ctx, event)
	}
	return nil
}

// Send emails to all users involved in the transfer that have the
// myAccount email setting enabled. Even to the user originating the
// event.
func handleTransferCommitted(ctx context.Context, event *events.Event) error {
	payer, payerUsers, payee, payeeUsers, transfer, err := fetchTransferResources(ctx, event, fetchBothUsers)
	if err != nil {
		return err
	}

	// Send email to payer users
	for _, user := range payerUsers {
		if userWantAccountEmails(user) {
			if errMail := sendTransferEmail(ctx, user, payer, payee, transfer, paymentSent); errMail != nil {
				err = errMail
			}
		}
	}

	// Send email to payee users
	for _, user := range payeeUsers {
		if userWantAccountEmails(user) {
			if errMail := sendTransferEmail(ctx, user, payer, payee, transfer, paymentReceived); errMail != nil {
				err = errMail
			}
		}
	}

	return err
}

// Send email to all users involved in the transfer that have the
// myAccount email setting enabled except the user originating the event.
func handleTransferRejected(ctx context.Context, event *events.Event) error {
	payer, _, payee, payeeUsers, transfer, err := fetchTransferResources(ctx, event, fetchPayeeUsers)
	if err != nil {
		return err
	}
	for _, user := range payeeUsers {
		if userWantAccountEmails(user) {
			if errMail := sendTransferEmail(ctx, user, payer, payee, transfer, paymentRejected); errMail != nil {
				err = errMail
			}
		}
	}
	return err
}

func handleTransferPending(ctx context.Context, event *events.Event) error {
	payer, payerUsers, payee, _, transfer, err := fetchTransferResources(ctx, event, fetchPayerUsers)
	if err != nil {
		return err
	}
	for _, user := range payerUsers {
		if userWantAccountEmails(user) {
			if errMail := sendTransferEmail(ctx, user, payer, payee, transfer, paymentPending); errMail != nil {
				err = errMail
			}
		}
	}
	return err
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

func fetchTransferResources(ctx context.Context, event *events.Event, which fetchWichUsers) (payer *api.Member, payerUsers []*api.User, payee *api.Member, payeeUsers []*api.User, transfer *api.Transfer, err error) {
	payerMemberId := event.Data["payer"]
	payeeMemberId := event.Data["payee"]
	transferId := event.Data["transfer"]

	// Fetch transfer details, payer and payee details and related user emails.
	transfer, err = api.GetTransfer(ctx, event.Code, transferId)
	if err != nil {
		return
	}
	payer, err = api.GetMember(ctx, event.Code, payerMemberId)
	if err != nil {
		return
	}
	if which == fetchPayerUsers || which == fetchBothUsers {
		payerUsers, err = api.GetMemberUsers(ctx, payerMemberId)
		if err != nil {
			return
		}
	}
	payee, err = api.GetMember(ctx, event.Code, payeeMemberId)
	if err != nil {
		return
	}
	if which == fetchPayeeUsers || which == fetchBothUsers {
		payeeUsers, err = api.GetMemberUsers(ctx, payeeMemberId)
		if err != nil {
			return
		}
	}
	return
}

// Creates the EmailTransferData object with the generic data required for the template,
// that is not specific to the payer, payee or exact type of event.
func buildCommonTransferTemplateData(t *i18n.Translator, payer *api.Member, payee *api.Member, transfer *api.Transfer) EmailTransferData {
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

func buildTransferTemplateData(t *i18n.Translator, payer *api.Member, payee *api.Member, transfer *api.Transfer, emailType EmailType) EmailTransferData {
	templateData := buildCommonTransferTemplateData(t, payer, payee, transfer)
	switch emailType {
	case paymentSent:
		templateData.Payment = true
		templateData.Text = t.Td("paymentSentText", map[string]string{"Amount": templateData.Amount, "PayeeName": payee.Name})
		templateData.Subject = t.T("paymentSentSubject")
	case paymentReceived:
		templateData.Payment = false
		templateData.Text = t.Td("paymentReceivedText", map[string]string{"Amount": templateData.Amount, "PayerName": payer.Name})
		templateData.Subject = t.T("paymentReceivedSubject")
	case paymentRejected:
		templateData.Payment = false
		templateData.Text = t.Td("paymentRejectedText", map[string]string{"Amount": templateData.Amount, "PayerName": payer.Name})
		templateData.Subtext = t.T("paymentRejectedSubtext")
		templateData.Subject = t.T("paymentRejectedSubject")
	case paymentPending:
		templateData.Payment = true
		templateData.Text = t.Td("paymentPendingText", map[string]string{"Amount": templateData.Amount, "PayeeName": payee.Name})
		templateData.Subtext = t.T("paymentPendingSubtext")
		templateData.Subject = t.T("paymentPendingSubject")
	}

	if templateData.Payment {
		templateData.Name = payer.Name
	} else {
		templateData.Name = payee.Name
	}
	templateData.Greeting = t.Td("hello", map[string]string{"Name": templateData.Name})
	return templateData
}

func sendTransferEmail(ctx context.Context, user *api.User, payer *api.Member, payee *api.Member, transfer *api.Transfer, emailType EmailType) error {
	t, err := i18n.NewTranslator(user.Settings.Language)
	if err != nil {
		return err
	}
	templateData := buildTransferTemplateData(t, payer, payee, transfer, emailType)
	message, err := buildTransferMessage(t, templateData)
	if err != nil {
		return err
	}

	message.From.Name = "Komunitin"
	message.From.Email = "noreply@komunitin.org"

	message.AddRecipient(templateData.Name, user.Email)
	return mailSender.SendMail(ctx, *message)
}

func FormatCurrency(amount int, currency *api.Currency, t *i18n.Translator) string {
	scaled := float64(amount) / math.Pow10(currency.Scale)
	return t.C(scaled, currency.Symbol, number.Scale(currency.Decimals))
}

func handleMemberJoined(ctx context.Context, event *events.Event) error {
	member, err := api.GetMember(ctx, event.Code, event.Data["member"])
	if err != nil {
		return err
	}
	users, err := api.GetMemberUsers(ctx, member.Id)
	if err != nil {
		return err
	}
	for _, user := range users {
		if userWantAccountEmails(user) {
			if errMail := sendMemberJoinedEmail(ctx, user, member); errMail != nil {
				err = errMail
			}
		}
	}
	return err
}

func handleMemberRequested(ctx context.Context, event *events.Event) error {
	member, err := api.GetMember(ctx, event.Code, event.Data["member"])
	if err != nil {
		return err
	}
	
	return err
}