# parse args
# Function to display usage
usage() {
    echo "Usage: $0 [--ices] [--demo] [--public]"
    exit 1
}

# Parse arguments
ices=false
demo=false
public=false

while [[ "$1" != "" ]]; do
    case "$1" in
        --ices)
            ices=true
            ;;
        --demo)
            demo=true
            ;;
        --public)
            demo=public
            ;;
        --)
            shift
            break
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
if [ "$public" = true ]; then
  docker compose -f docker-compose.yml -f docker-compose.public.yml up -d
else
  docker compose up -d
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
  
docker compose exec integralces drush sql-query "UPDATE ces_exchange SET data='a:4:{s:19:\"registration_offers\";i:1;s:18:\"registration_wants\";i:0;}' WHERE code='NET1'"
docker compose exec integralces drush sql-query "UPDATE ces_exchange SET data='a:4:{s:19:\"registration_offers\";i:0;s:18:\"registration_wants\";i:0;}' WHERE code='NET2'"

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
}

# Migrate NET1 and NET2 to the accounting service
migrate "riemann@integralces.net" "integralces" "NET1"
migrate "fermat@integralces.net" "integralces" "NET2"

# Configure NET1 and NET2 in integralces to use the accounting service
docker compose exec integralces drush vset ces_komunitin_app_url $KOMUNITIN_APP_URL
docker compose exec integralces drush sql-query "UPDATE ces_exchange SET data='a:4:{s:19:\"registration_offers\";i:1;s:18:\"registration_wants\";i:0;s:28:\"komunitin_accounting_api_url\";s:21:\"http://localhost:2025\";s:17:\"komunitin_app_url\";s:22:\"https://localhost:2030\";}' WHERE code='NET1'"
docker compose exec integralces drush sql-query "UPDATE ces_exchange SET data='a:4:{s:19:\"registration_offers\";i:0;s:18:\"registration_wants\";i:0;s:28:\"komunitin_accounting_api_url\";s:21:\"http://localhost:2025\";s:17:\"komunitin_app_url\";s:22:\"https://localhost:2030\";}' WHERE code='NET2'"

fi
