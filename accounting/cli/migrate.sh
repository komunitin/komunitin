usage() {
    echo "Usage: $0 <user> <password> <group> [ICES_URL] [KOMUNITIN_ACCOUNTING_URL]"
    exit
}

if [ $# -lt 3 ]; then
    usage
fi

USERNAME=$1
PASSWORD=$2
GROUP=$3
DEFAULT_ICES_URL=${ICES_URL:-http://localhost:2029}
ICES_URL=${4:-$DEFAULT_ICES_URL}
DEFAULT_KOMUNITIN_ACCOUNTING_URL=${KOMUNITIN_ACCOUNTING_URL:-http://localhost:2025}
KOMUNITIN_ACCOUNTING_URL=${5:-$DEFAULT_KOMUNITIN_ACCOUNTING_URL}


echo "Getting access token from $ICES_URL..."
cd "$(dirname "$0")"
ACCESS_TOKEN=$(./access.sh $USERNAME $PASSWORD $ICES_URL)

echo "Migrating group $GROUP from $ICES_URL to $KOMUNITIN_ACCOUNTING_URL..."

JSON_DATA=$(cat <<EOF
{
  "data": {
    "type": "migrations",
    "attributes": {
      "code": "$GROUP",
      "source": {
        "platform": "integralces",
        "url": "$ICES_URL",
        "access_token": "$ACCESS_TOKEN"
      }
    }
  }
}
EOF
)

RESPONSE=$(curl -s -X POST $KOMUNITIN_ACCOUNTING_URL/migrations \
  -H "Content-Type: application/vnd.api+json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "$JSON_DATA")

echo $RESPONSE