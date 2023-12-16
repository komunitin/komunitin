package notifications

import (
	"context"
	"fmt"
	"net/http"
	"reflect"
	"strings"

	"github.com/komunitin/jsonapi"
	"github.com/komunitin/komunitin/notifications/model"
)

func fixUrl(url string) string {
	// This is for development purposes only.
	url = strings.Replace(url, "/localhost:2029/", "/integralces/", 1)
	return url
}

// TODO make that check errors and add an opt-in cache layer!
func getResource(ctx context.Context, url string) (*http.Response, error) {
	token, err := getAuthorizationToken(ctx)
	if err != nil {
		return nil, err
	}
	return fetchResource(ctx, url, token)
}

func fetchResource(ctx context.Context, url string, token string) (*http.Response, error) {
	url = fixUrl(url)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", token))
	return http.DefaultClient.Do(req)
}

func getUserByToken(ctx context.Context, token string) (*model.User, error) {
	url := socialUrl + "/users/me"
	res, err := fetchResource(ctx, url, token)
	if err != nil {
		return nil, err
	}
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error fetching user: %s", res.Status)
	}
	user := new(model.User)
	err = jsonapi.UnmarshalPayload(res.Body, user)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func getGroupMembers(ctx context.Context, code string) ([]*model.Member, error) {
	url := socialUrl + "/" + code + "/members"
	res, err := getResource(ctx, url)
	if err != nil {
		return nil, err
	}
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error fetching members: %s", res.Status)
	}
	members, err := jsonapi.UnmarshalManyPayload(res.Body, reflect.TypeOf((*model.Member)(nil)))
	if err != nil {
		return nil, err
	}
	// Fix members type.
	result := make([]*model.Member, len(members))
	for i, member := range members {
		result[i] = member.(*model.Member)
	}
	return result, nil
}
