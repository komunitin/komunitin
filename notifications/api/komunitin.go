package api

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"reflect"
	"strings"

	"golang.org/x/net/context/ctxhttp"

	"github.com/komunitin/jsonapi"
	"github.com/komunitin/komunitin/notifications/config"
)

func fixUrl(url string) string {
	// This is for development purposes only.
	url = strings.Replace(url, "localhost", "host.docker.internal", 1)
	return url
}

// TODO make that check errors and add an opt-in cache layer!
func fetchUrl(ctx context.Context, url string) (*http.Response, error) {
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
	return ctxhttp.Do(ctx, http.DefaultClient, req)
}

// Fetch the user object from the social API using the provided token.
// ctx can be any context, it doesn't need to be created by NewContext.
// token is the user Authorization token.
// Uses the social API url as defined in the configuration.
func GetUserByToken(ctx context.Context, token string) (*User, error) {
	url := config.KomunitinSocialUrl + "/users/me"
	res, err := fetchResource(ctx, url, token)
	if err != nil {
		return nil, err
	}
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error fetching user: %s", res.Status)
	}
	user := new(User)
	err = jsonapi.UnmarshalPayload(res.Body, user)
	if err != nil {
		return nil, err
	}
	return user, nil
}

// Get all members of a group.
func GetGroupMembers(ctx context.Context, code string) ([]*Member, error) {
	members := make([]*Member, 0)
	result, err := getResources(ctx, config.KomunitinSocialUrl, code, "members", reflect.TypeOf((*Member)(nil)), nil, nil, nil)
	if err != nil {
		return nil, err
	}
	// Fix Member type
	for _, member := range result {
		members = append(members, member.(*Member))
	}
	return members, nil
}

// Get group with admin users.
func GetGroup(ctx context.Context, code string) (*Group, error) {
	group := new(Group)
	err := getResource(ctx, config.KomunitinSocialUrl, code, "", "", group, []string{"admins"}, nil)
	if err != nil {
		return nil, err
	}
	return group, nil
}

func GetAccountMembers(ctx context.Context, code string, accountIds []string) ([]*Member, error) {
	members := make([]*Member, 0)
	accountsParam := strings.Join(accountIds, ",")
	result, err := getResources(ctx, config.KomunitinSocialUrl, code, "members", reflect.TypeOf((*Member)(nil)), nil, map[string][]string{"account": {accountsParam}}, nil)
	if err != nil {
		return nil, err
	}
	for _, member := range result {
		members = append(members, member.(*Member))
	}
	return members, nil
}

// Get all users associated with a member. This function fetches also
// the user settings.
func GetMemberUsers(ctx context.Context, memberId string) ([]*User, error) {
	users := make([]*User, 0)
	result, err := getResources(ctx, config.KomunitinSocialUrl, "", "users", reflect.TypeOf((*User)(nil)), []string{"settings"}, map[string][]string{"members": {memberId}}, nil)
	if err != nil {
		return nil, err
	}
	// Fix User type
	for _, user := range result {
		users = append(users, user.(*User))
	}
	return users, nil
}

// Get a member object
func GetMember(ctx context.Context, code string, memberId string) (*Member, error) {
	member := new(Member)
	err := getResource(ctx, config.KomunitinSocialUrl, code, "members", memberId, member, nil, nil)
	if err != nil {
		return nil, err
	}
	return member, nil
}

// Get an account object
// ctx needs to be created with NewContext with accounting API as baseUrl.
func GetAccount(ctx context.Context, code string, accountId string) (*Account, error) {
	accountingUrl, err := GetBaseUrlFromContext(ctx)
	if err != nil {
		return nil, err
	}
	account := new(Account)
	err = getResource(ctx, accountingUrl, code, "accounts", accountId, account, nil, nil)
	if err != nil {
		return nil, err
	}
	return account, nil
}

// Get a transfer object with loaded payer and payee accounts and currency.
// ctx needs to be created with NewContext with accounting API as baseUrl.
func GetTransfer(ctx context.Context, code string, transferId string) (*Transfer, error) {
	accountingUrl, err := GetBaseUrlFromContext(ctx)
	if err != nil {
		return nil, err
	}
	transfer := new(Transfer)
	err = getResource(ctx, accountingUrl, code, "transfers", transferId, transfer, []string{"payer", "payee", "currency"}, nil)
	if err != nil {
		return nil, err
	}
	return transfer, nil
}

func addFields(query []string, fields map[string][]string) []string {
	for key, value := range fields {
		query = append(query, "fields["+url.QueryEscape(key)+"]="+url.QueryEscape(strings.Join(value, ",")))
	}
	return query
}
func addInclude(query []string, include []string) []string {
	if include != nil {
		query = append(query, "include="+url.QueryEscape(strings.Join(include, ",")))
	}
	return query
}
func addFilter(query []string, filter map[string][]string) []string {
	for key, value := range filter {
		query = append(query, "filter["+url.QueryEscape(key)+"]="+url.QueryEscape(strings.Join(value, ",")))
	}
	return query
}
func buildUrl(baseUrl string, code string, resourceType string, id string) string {
	url := baseUrl
	if code != "" {
		url += "/" + code
	}
	if resourceType != "" {
		url += "/" + resourceType
	}
	if id != "" {
		url += "/" + id
	}
	return url
}

// Gets a resource by group code and id, allowing to include related resources and filter fields.
// The model parameter must be a pointer to the struct that will hold the resource data.
func getResource(ctx context.Context, baseUrl string, code string, resourceType string, id string, model any, include []string, fields map[string][]string) error {
	// Build URL
	url := buildUrl(baseUrl, code, resourceType, id)

	query := make([]string, 0)

	query = addFields(query, fields)
	query = addInclude(query, include)

	if len(query) > 0 {
		url += "?" + strings.Join(query, "&")
	}
	return GetResourceUrl(ctx, url, model)
}

// The model parameter must be a pointer to the struct that will hold the resource data.
//
//	user := new(User)
//	err := GetResourceUrl(ctx, "https://social.komunitin.org/users/1", user)
func GetResourceUrl(ctx context.Context, url string, model any) error {
	res, err := fetchResource(ctx, url, "")
	if err != nil {
		return err
	}
	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("error fetching resource: %s %s", res.Status, url)
	}
	return jsonapi.UnmarshalPayload(res.Body, model)
}

func getResources(ctx context.Context, baseUrl string, code string, resourceType string, modelType reflect.Type, include []string, filter map[string][]string, fields map[string][]string) ([]any, error) {
	// Build URL
	url := buildUrl(baseUrl, code, resourceType, "")

	query := make([]string, 0)
	query = addInclude(query, include)
	query = addFilter(query, filter)
	query = addFields(query, fields)

	if len(query) > 0 {
		url += "?" + strings.Join(query, "&")
	}

	// Fetch all pages
	resources := make([]any, 0)
	for url != "" {
		// Network request
		res, err := fetchUrl(ctx, url)
		if err != nil {
			return nil, err
		}
		if res.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("error fetching resources of type %s: %s\nURL: %s", resourceType, res.Status, url)
		}
		page, extras, err := jsonapi.UnmarshalManyPayload(res.Body, modelType)
		if err != nil {
			return nil, err
		}
		// Save current page
		resources = append(resources, page...)

		// Prepare next page fetch.
		next, ok := (*extras.Links)["next"]
		if ok && next != nil {
			url = next.(string)
		} else {
			url = ""
		}
	}
	return resources, nil
}
