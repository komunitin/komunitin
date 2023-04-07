package i18n

// Scan source and update translated strings.
// Use:
// 1. Scan code for new strings:
// $go generate translations.go
// 2. Copy locales/*/out.gotext.json to locales/*/messages.gotext.json
// 3. Edit translations in messages.gotext.json files
// 4. Update catalog:
// $go generate translations.go

// TODO: Use a simpler messages file format. Concretely, the same key-value format we're using in the Komunitin app.

//Need to import this package here to avoid an unexpected error on generate command.
import _ "golang.org/x/text/message"

//go:generate gotext -srclang=en update -out catalog.go -lang=ca,en,es github.com/komunitin/komunitin/notifications
