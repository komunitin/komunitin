package api

import (
	"context"
	"fmt"
)

// Create a Context value to solve the problem of having different accounting URLs
// (for groups in the new Accounting service and groups still in IntegralCES).
// The idea is to save the URL in the context from the "source" field of the event.
// The delicate part is that the api method accessing the URL cant be sure that the
// event indeed originated from the accounting service.

type key int

var baseUrlKey key

// Create a new context with the baseUrl value from the Source field of the event.
// This URL is used to fetch related event resources.
func NewContext(ctx context.Context, baseUrl string) (context.Context, error) {
	// Add includes to the user URL
	return context.WithValue(ctx, baseUrlKey, baseUrl), nil
}

// Get the baseUrl value from the context created with NewContext.
func GetBaseUrlFromContext(ctx context.Context) (string, error) {
	baseUrl, ok := ctx.Value(baseUrlKey).(string)
	if !ok {
		return "", fmt.Errorf("baseUrl not found in context")
	}
	return baseUrl, nil
}
