package i18n

import (
	"embed"
	"encoding/json"
	"slices"
	"strings"
	"time"

	"github.com/goodsign/monday"
	"github.com/nicksnyder/go-i18n/v2/i18n"
	"golang.org/x/text/language"
	"golang.org/x/text/message"
	"golang.org/x/text/number"
)

//go:embed messages/*
var messages embed.FS

var bundle *i18n.Bundle

// This function is executed when importing the package.
func init() {
	// Init i18n
	bundle = i18n.NewBundle(language.English)
	bundle.RegisterUnmarshalFunc("json", json.Unmarshal)
	// Load translation files
	files, err := messages.ReadDir("messages")
	if err != nil {
		panic(err)
	}
	for _, file := range files {
		_, err = bundle.LoadMessageFileFS(messages, "messages/"+file.Name())
		if err != nil {
			panic(err)
		}
	}
}

type Translator struct {
	language  language.Tag
	localizer *i18n.Localizer
}

func NewTranslator(lang string) (*Translator, error) {
	language, err := language.Parse(lang)
	if err != nil {
		return nil, err
	}
	return &Translator{
		language:  language,
		localizer: i18n.NewLocalizer(bundle, lang),
	}, nil
}

func (t *Translator) T(id string) string {
	return t.localizer.MustLocalize(&i18n.LocalizeConfig{MessageID: id})
}

func (t *Translator) Td(id string, data map[string]string) string {
	return t.localizer.MustLocalize(&i18n.LocalizeConfig{MessageID: id, TemplateData: data})
}

func (t *Translator) N(value any, option number.Option) string {
	p := message.NewPrinter(t.language)
	return p.Sprint(number.Decimal(value, option))
}

func (t *Translator) C(value any, cur string, option number.Option) string {
	p := message.NewPrinter(t.language)
	num := t.N(value, option)
	// Go standard library does not provide a way to know whether the currency
	// symbol goes before or after the number. So we implement it here for some
	// locales.
	// https://en.wikipedia.org/wiki/Linguistic_issues_concerning_the_euro#Position_of_currency_sign
	currencyAfter := []language.Tag{language.Catalan, language.Spanish, language.Italian, language.Portuguese, language.French, language.Greek}
	if slices.Contains(currencyAfter, t.language) {
		return p.Sprintf("%s%s", num, cur)
	} else {
		return p.Sprintf("%s%s", cur, num)
	}
}

// Format datetime
func (t *Translator) Dt(d time.Time) string {
	locale := findMondayLocale(t.language)
	return monday.Format(d, monday.DateTimeFormatsByLocale[locale], locale)
}

func findMondayLocale(lang language.Tag) monday.Locale {
	// Normalize language tag to match Monday locales
	norm := strings.Replace(lang.String(), "-", "_", -1)
	parts := strings.Split(norm, "_")
	if len(parts) > 0 {
		parts[0] = strings.ToLower(parts[0])
	}
	if len(parts) > 1 {
		parts[1] = strings.ToUpper(parts[1])
	}
	norm = strings.Join(parts[0:1], "_")

	locales := monday.ListLocales()
	// Try exact match
	for _, locale := range locales {
		if string(locale) == norm {
			return locale
		}
	}
	// Try parent match
	for _, locale := range locales {
		if strings.HasPrefix(string(locale), parts[0]+"_") {
			return locale
		}
	}
	// Default to English
	return monday.LocaleEnUS
}
