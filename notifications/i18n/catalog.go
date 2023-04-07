// Code generated by running "go generate" in golang.org/x/text. DO NOT EDIT.

package i18n

import (
	"golang.org/x/text/language"
	"golang.org/x/text/message"
	"golang.org/x/text/message/catalog"
)

type dictionary struct {
	index []uint32
	data  string
}

func (d *dictionary) Lookup(key string) (data string, ok bool) {
	p, ok := messageKeyToIndex[key]
	if !ok {
		return "", false
	}
	start, end := d.index[p], d.index[p+1]
	if start == end {
		return "", false
	}
	return d.data[start:end], true
}

func init() {
	dict := map[string]catalog.Dictionary{
		"ca": &dictionary{index: caIndex, data: caData},
		"en": &dictionary{index: enIndex, data: enData},
		"es": &dictionary{index: esIndex, data: esData},
	}
	fallback := language.MustParse("en")
	cat, err := catalog.NewFromMap(dict, catalog.Fallback(fallback))
	if err != nil {
		panic(err)
	}
	message.DefaultCatalog = cat
}

var messageKeyToIndex = map[string]int{
	"newPurchase":         0,
	"newPurchaseText":     1,
	"paymentPending":      4,
	"paymentPendingText":  5,
	"paymentReceived":     2,
	"paymentReceivedText": 3,
}

var caIndex = []uint32{ // 7 elements
	0x00000000, 0x0000000c, 0x00000025, 0x00000034,
	0x0000004e, 0x00000063, 0x000000cc,
} // Size: 52 bytes

const caData string = "" + // Size: 204 bytes
	"\x02Nova compra\x02Compra de %[1]v a %[2]v.\x02Pagament rebut\x02Has reb" +
	"ut %[1]v de %[2]v.\x02Nou pagament pendent\x02Tens un nou pagament de %[" +
	"1]v per a %[2]v. Sisplau accepta o rebutja el pagament el més aviat poss" +
	"ible."

var enIndex = []uint32{ // 7 elements
	0x00000000, 0x0000000d, 0x0000002b, 0x0000003c,
	0x00000062, 0x00000076, 0x000000d7,
} // Size: 52 bytes

const enData string = "" + // Size: 215 bytes
	"\x02New purchase\x02Purchase of %[1]v from %[2]v.\x02Payment received" +
	"\x02Payment received of %[1]v from %[2]v.\x02New payment request\x02%[2]" +
	"v requests a payment of %[1]v. You should accept or reject this payment " +
	"as soon as possible."

var esIndex = []uint32{ // 7 elements
	0x00000000, 0x0000000d, 0x00000026, 0x00000034,
	0x00000051, 0x00000066, 0x000000d3,
} // Size: 52 bytes

const esData string = "" + // Size: 211 bytes
	"\x02Nueva compra\x02Compra de %[1]v a %[2]v.\x02Pago recibido\x02Has rec" +
	"ibido %[1]v de %[2]v.\x02Nuevo pago pendiente\x02Tienes un nuevo pago de" +
	" %[1]v para %[2]v. Por favor acepta o rechaza la transacción lo más pron" +
	"to posible."

	// Total table size 786 bytes (0KiB); checksum: 1AEC5E69
