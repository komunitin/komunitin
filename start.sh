# parse args
# Function to display usage
usage() {
    echo "Usage: $0 [--up] [--ices] [--demo] [--public]"
    exit
}

# Parse arguments
ices=false
demo=false
public=false
up=false

while [[ "$1" != "" ]]; do
    case "$1" in
        --up)
            up=true
            ;;
        --ices)
            ices=true
            ;;
        --demo)
            demo=true
            ;;
        --public)
            public=true
            ;;
        *)
            usage
            ;;
    esac
    shift
done

# Load .env file.
set -a
. .env
set +a

# Start the services
if [ "$up" = true ]; then

if [ "$public" = true ]; then
  docker compose -f compose.yml -f compose.public.yml up -d --build
else
  docker compose up -d --build
fi

echo "Waiting for the services to start..."
sleep 10
  
fi

# Install IntegralCES

if [ "$ices" = true ]; then
  export BASE_URL=$ICES_URL
  if [ "$demo" = true ]; then
    . ../ices/install.sh --demo
  else
    . ../ices/install.sh
  fi
fi

# Migrate NET1 and NET2 to the accounting service

if [ "$demo" = true ]; then
docker compose exec integralces drush scr sites/all/modules/ices/ces_develop/drush_set_exchange_data.php --code=NET1 --registration_offers=1 --registration_wants=0
docker compose exec integralces drush scr sites/all/modules/ices/ces_develop/drush_set_exchange_data.php --code=NET2 --registration_offers=0 --registration_wants=0

# Install Accounting service

docker compose exec accounting pnpm prisma migrate reset --force

migrate() {

local USERNAME=$1
local PASSWORD=$2
local CODE=$3

RESPONSE=$(curl -s -X POST $ICES_URL/oauth2/token \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "grant_type=password" \
-d "client_id=komunitin-app" \
-d "username=$USERNAME" \
-d "password=$PASSWORD" \
-d "scope=openid email profile komunitin_social komunitin_accounting offline_access komunitin_social_read_all")

ACCESS_TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

JSON_DATA=$(cat <<EOF
{
  "data": {
    "type": "migrations",
    "attributes": {
      "code": "$CODE",
      "source": {
        "platform": "integralces",
        "url": "http://integralces:2029",
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
}

# Migrate NET1 and NET2 to the accounting service
migrate "riemann@komunitin.org" "komunitin" "NET1"
migrate "fermat@komunitin.org" "komunitin" "NET2"

# Configure NET1 and NET2 in integralces to use the accounting service
docker compose exec integralces drush scr sites/all/modules/ices/ces_develop/drush_set_exchange_data.php --code=NET1 --registration_offers=1 --registration_wants=0 --komunitin_accounting_api_url=$KOMUNITIN_ACCOUNTING_URL --komunitin_app_url=$KOMUNITIN_APP_URL
docker compose exec integralces drush scr sites/all/modules/ices/ces_develop/drush_set_exchange_data.php --code=NET2 --registration_offers=0 --registration_wants=0 --komunitin_accounting_api_url=$KOMUNITIN_ACCOUNTING_URL --komunitin_app_url=$KOMUNITIN_APP_URL
docker compose exec integralces drush vset ces_komunitin_app_url $KOMUNITIN_APP_URL

fi
