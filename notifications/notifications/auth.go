package notifications

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"os"
	"time"
)

var (
	clientId          = os.Getenv("NOTIFICATIONS_CLIENT_ID")
	clientSecret      = os.Getenv("NOTIFICATIONS_CLIENT_SECRET")
	authUrl           = os.Getenv("KOMUNITIN_AUTH_URL")
	accessToken       string
	accessTokenExpiry time.Time
)

type tokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int64  `json:"expires_in"`
	TokenType   string `json:"token_type"`
	Scope       string `json:"scope"`
}

// Return the authorization token to call the social and accounting komunitin API.
// This functions makes an HTTP call the first time is called, and then returns the
// same cached results while they're still valid.
func getAuthorizationToken(ctx context.Context) (string, error) {
	// Return cached access token if it still has a minute of life.
	if accessTokenExpiry.After(time.Now().Add(time.Minute)) {
		return accessToken, nil
	}
	// Otherwise get a new one using client credentials from environment variables.
	res, err := http.PostForm(authUrl+"/token", url.Values{
		"grant_type":    []string{"client_credentials"},
		"client_id":     []string{clientId},
		"client_secret": []string{clientSecret},
		"scope":         []string{"komunitin_social_read_all komunitin_accounting_read_all"},
	})
	if err != nil {
		return "", err
	}
	response := new(tokenResponse)
	err = json.NewDecoder(res.Body).Decode(&response)
	if err != nil {
		return "", err
	}
	accessToken = response.AccessToken
	accessTokenExpiry = time.Now().Add(time.Duration(response.ExpiresIn) * time.Second)
	return accessToken, nil
}
