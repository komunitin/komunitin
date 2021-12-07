package store

import (
	"context"
	"encoding/json"
	"reflect"
	"time"

	"github.com/go-redis/redis/v8"
)

type Store struct {
	client redis.Client
}

func NewStore() (*Store, error) {
	store := &Store{
		// Store and Stream ara using the same Redis instance. That's fine but incidental.
		// They could perfectly use different instances if needed for scalability.
		client: *redis.NewClient(&redis.Options{
			Addr:     "redis:6379",
			Password: "", // no password set
			DB:       0,  // use default database
		}),
	}
	return store, nil
}
func (store *Store) Set(ctx context.Context, class string, id string, value interface{}, indexes map[string]string, expire time.Duration) error {
	// Set value and indexes in a single transaction.
	_, err := store.client.TxPipelined(ctx, func(pipe redis.Pipeliner) error {
		// Set value
		encoded, err := json.Marshal(value)
		if err != nil {
			return err
		}
		err = pipe.Set(ctx, key(class, id), string(encoded), expire).Err()
		if err != nil {
			return err
		}
		// Add indexes
		for index, indexId := range indexes {
			err = pipe.SAdd(ctx, indexKey(class, index, indexId), id).Err()
			if err != nil {
				return err
			}
		}

		return nil
	})
	return err
}
func (store *Store) Get(ctx context.Context, class string, id string) (interface{}, error) {
	return store.client.Get(ctx, key(class, id)).Result()
}

// Return the values of given store class that match the given index and unmarshal them using the provided struct type with json annotations.
func (store *Store) GetByIndex(ctx context.Context, class string, t reflect.Type, index string, id string) ([]interface{}, error) {
	// Get data using the index.
	var encoded []interface{}
	_, err := store.client.TxPipelined(ctx, func(pipe redis.Pipeliner) error {
		ids, err := pipe.SMembers(ctx, indexKey(class, index, id)).Result()
		if err != nil {
			return err
		}
		encoded, err = pipe.MGet(ctx, ids...).Result()
		return err
	})
	if err != nil {
		return nil, err
	}
	// Decode data
	values := []interface{}{}
	for _, v := range encoded {
		item := reflect.New(t.Elem())
		err := json.Unmarshal([]byte(v.(string)), &item)
		if err != nil {
			return nil, err
		}
		values = append(values, item)
	}
	return values, nil
}
func key(class string, id string) string {
	return "object" + ":" + class + ":" + id
}
func indexKey(class string, index string, id string) string {
	return "index" + ":" + class + ":" + index + ":" + id
}
