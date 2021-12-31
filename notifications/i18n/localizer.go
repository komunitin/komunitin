package i18n

// Implements localization for this module.
//
// Use:
// l := i18n.GetLocalizer("es")
// text := l.Sprintf("stringId", arg1, arg2)
//
// See translations.go for management of strings.

import (
	"golang.org/x/text/language"
	"golang.org/x/text/message"
)

type Localizer struct {
	Locale  language.Tag
	printer *message.Printer
}

var locales = make(map[language.Tag]Localizer, 10)

func GetLocalizer(locale string) Localizer {
	tag := language.MustParse(locale)
	if _, ok := locales[tag]; !ok {
		locales[tag] = loadLocalizer(tag)
	}
	return locales[tag]
}

func loadLocalizer(tag language.Tag) Localizer {
	return Localizer{
		Locale:  tag,
		printer: message.NewPrinter(tag),
	}
}

func (l *Localizer) Sprintf(key message.Reference, args ...interface{}) string {
	return l.printer.Sprintf(key, args...)
}
