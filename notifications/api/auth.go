package api

// Requests access token to komunitin auth API using the client credentials Oauth2 flow.
// This flow grants access to this app to the whole API.
// we're getting komunitin_social_read_all and komunitin_accounting_read_all scopes so
// we can read anything from these APIs but we can't change anything.

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strconv"
	"time"

	"golang.org/x/net/context/ctxhttp"

	"github.com/komunitin/komunitin/notifications/config"
)

var (
	accessToken       string
	accessTokenExpiry time.Time
)

type tokenResponse struct {
	AccessToken string        `json:"access_token"`
	ExpiresIn   intFromString `json:"expires_in"`
	TokenType   string        `json:"token_type"`
	Scope       string        `json:"scope"`
}

type intFromString int64

// Unmarshal expires_in both from string and from int.
func (expires *intFromString) UnmarshalJSON(b []byte) error {
	if b[0] != '"' {
		return json.Unmarshal(b, (*int64)(expires))
	}
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}
	i, err := strconv.Atoi(s)
	if err != nil {
		return err
	}
	*expires = intFromString(i)
	return nil
}

// Return the authorization token to call the social and accounting komunitin API.
// This functions makes an HTTP call the first time is called, and then returns the
// same cached results while they're still valid.
func getAuthorizationToken(ctx context.Context) (string, error) {
	// Return cached access token if it still has a minute of life.
	if accessTokenExpiry.After(time.Now().Add(time.Minute)) {
		return accessToken, nil
	}
	authUrl := fixUrl(config.KomunitinAuthUrl)
	clientId := config.NotificationsClientId
	clientSecret := config.NotificationsClientSecret

	// Otherwise get a new one using client credentials from environment variables.
	res, err := ctxhttp.PostForm(ctx, http.DefaultClient, authUrl+"/token", url.Values{
		"grant_type":    []string{"client_credentials"},
		"client_id":     []string{clientId},
		"client_secret": []string{clientSecret},
		"scope":         []string{"komunitin_social_read_all komunitin_accounting_read_all"},
	})
	if err != nil {
		return "", err
	}
	if res.StatusCode != http.StatusOK {

		resp, _ := httputil.DumpResponse(res, true)
		return "", fmt.Errorf("error getting authorization token:%s\n%s\n%s\n%s", authUrl, clientId, clientSecret, resp)

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
