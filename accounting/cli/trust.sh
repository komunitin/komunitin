usage() {
  echo "Usage: $0 <user> <password> <currency_code> <trusted_code> <amount> [ICES_URL] [KOMUNITIN_ACCOUNTING_URL]"
  exit 1
}

if [ $# -lt 5 ]; then
    usage
fi

DEFAULT_ICES_URL=${ICES_URL:-http://localhost:2029}
ICES_URL=${6:-$DEFAULT_ICES_URL}
DEFAULT_KOMUNITIN_ACCOUNTING_URL=${KOMUNITIN_ACCOUNTING_URL:-http://localhost:2025}
KOMUNITIN_ACCOUNTING_URL=${7:-$DEFAULT_KOMUNITIN_ACCOUNTING_URL}

echo "Getting access token from $ICES_URL..."
cd "$(dirname "$0")"
ACCESS_TOKEN=$(./access.sh $1 $2 $ICES_URL)
echo $ACCESS_TOKEN

echo "Getting currency id for trusted currency $4..."
RESPONSE=$(curl -s -X GET $KOMUNITIN_ACCOUNTING_URL/$4/currency)
TRUSTED_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
echo "Trusted currency id: $TRUSTED_ID"

AMOUNT=$(($5*1000000))
echo "Trusting $4 for a total amount of $AMOUNT..."

JSON_DATA=$(cat <<EOF
{
  "data": {
    "type": "trustlines",
    "attributes": {
      "limit": $AMOUNT
    },
    "relationships": {
      "trusted": {
        "data": {
          "type": "currencies", 
          "id": "$TRUSTED_ID",
          "meta": {
            "external": true,
            "href": "$KOMUNITIN_ACCOUNTING_URL/$4/currency"
          }
        }
      }
    }
  }
}
EOF
)

echo $JSON_DATA

RESPONSE=$(curl -s -X POST $KOMUNITIN_ACCOUNTING_URL/$3/trustlines \
  -H "Content-Type: application/vnd.api+json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "$JSON_DATA")

echo $RESPONSE







