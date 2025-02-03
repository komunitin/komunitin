package mails

// Listens the events stream and send relevant emails to users.

// This service relies on the Komunitin api in order to fetch
// the user, users settings, members and message data.

import (
	"context"
	"log"

	"github.com/komunitin/komunitin/notifications/api"
	"github.com/komunitin/komunitin/notifications/config"
	"github.com/komunitin/komunitin/notifications/events"
	"github.com/komunitin/komunitin/notifications/i18n"
)

// These are the possible email types for transfers that can be sent.
type TransferEmailType int

const (
	undefinedEmailType TransferEmailType = iota
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
			log.Printf("error handling event from mailer: %v\n", err)
		}
		// Acknowledge event handled
		stream.Ack(ctx, event.Id)
	}
}

func handleEvent(ctx context.Context, event *events.Event) error {

	// Create a new context with the baseUrl value from the Source field of the event.
	// api methids GetTransfer and GetAccount will take the accounting base URL from
	// this context.
	ctx, err := api.NewContext(ctx, event.Source)
	if err != nil {
		return err
	}

	// Handle event depending on its type
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
	case events.GroupActivated:
		return handleGroupActivated(ctx, event)
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

func handleMemberRequested(ctx context.Context, event *events.Event) error {
	// Fetch member
	member, err := api.GetMember(ctx, event.Code, event.Data["member"])
	if err != nil {
		return err
	}
	// Fetch group admins
	group, err := api.GetGroup(ctx, event.Code)
	if err != nil {
		return err
	}
	// Send email to admins
	for _, admin := range group.Admins {
		errMail := sendMemberRequestedEmail(ctx, admin, member, group)
		if errMail != nil {
			err = errMail
		}
	}

	return err
}

func handleMemberJoined(ctx context.Context, event *events.Event) error {
	member, err := api.GetMember(ctx, event.Code, event.Data["member"])
	if err != nil {
		return err
	}
	account, err := api.GetAccount(ctx, event.Code, member.Account.Id)
	if err != nil {
		return err
	}
	group, err := api.GetGroup(ctx, event.Code)
	if err != nil {
		return err
	}
	users, err := api.GetMemberUsers(ctx, member.Id)
	if err != nil {
		return err
	}
	for _, user := range users {
		if userWantAccountEmails(user) {
			if errMail := sendMemberJoinedEmail(ctx, user, member, account, group); errMail != nil {
				err = errMail
			}
		}
	}
	return err
}

func handleGroupActivated(ctx context.Context, event *events.Event) error {
	group, err := api.GetGroup(ctx, event.Code)
	if err != nil {
		return err
	}
	for _, admin := range group.Admins {
		errMail := sendGroupActivatedEmail(ctx, admin, group)
		if errMail != nil {
			err = errMail
		}
	}
	return err
}

func sendEmail(ctx context.Context, message *Email, name string, email string) error {
	message.From.Name = "Komunitin"
	message.From.Email = "noreply@komunitin.org"

	message.AddRecipient(name, email)
	return mailSender.SendMail(ctx, *message)
}

func sendTransferEmail(ctx context.Context, user *api.User, payer *api.Member, payee *api.Member, transfer *api.Transfer, emailType TransferEmailType) error {
	t, err := i18n.NewTranslator(user.Settings.Language)
	if err != nil {
		return err
	}
	templateData := buildTransferTemplateData(t, payer, payee, transfer, emailType)
	message, err := buildTransferMessage(t, templateData)
	if err != nil {
		return err
	}

	return sendEmail(ctx, message, templateData.Name, user.Email)
}

func sendMemberRequestedEmail(ctx context.Context, admin *api.User, member *api.Member, group *api.Group) error {
	t, err := i18n.NewTranslator(admin.Settings.Language)
	if err != nil {
		return err
	}
	templateData := buildMemberRequestedTemplateData(t, member, group)
	message, err := buildTextMessage(t, templateData)
	if err != nil {
		return err
	}

	return sendEmail(ctx, message, "", admin.Email)

}

func sendMemberJoinedEmail(ctx context.Context, user *api.User, member *api.Member, account *api.Account, group *api.Group) error {
	t, err := i18n.NewTranslator(user.Settings.Language)
	if err != nil {
		return err
	}
	templateData := buildMemberJoinedTemplateData(t, member, account, group)
	message, err := buildTextMessage(t, templateData)
	if err != nil {
		return err
	}

	return sendEmail(ctx, message, "", user.Email)
}

func sendGroupActivatedEmail(ctx context.Context, admin *api.User, group *api.Group) error {
	t, err := i18n.NewTranslator(admin.Settings.Language)
	if err != nil {
		return err
	}
	templateData := buildGroupActivatedTemplateData(t, group)
	message, err := buildTextMessage(t, templateData)
	if err != nil {
		return err
	}

	return sendEmail(ctx, message, "", admin.Email)
}
