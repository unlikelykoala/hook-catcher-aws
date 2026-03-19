BASE_URL="localhost:3000"
BIN_ID="xEGvLuV820"

FULL_URL="http://$BASE_URL/api/hooks/$BIN_ID"
REQUESTS_FILE="./mock_requests.json"

LENGTH=$(jq length "$REQUESTS_FILE")

for ((i = 0; i < LENGTH; i++)); do
  METHOD=$(jq -r ".[$i].method" "$REQUESTS_FILE")
  BODY=$(jq -c ".[$i].body" "$REQUESTS_FILE")

  echo "Sending $METHOD request to $FULL_URL"

  if [ "$BODY" = "null" ]; then
    curl -s -X "$METHOD" "$FULL_URL"
  else
    curl -s -X "$METHOD" -H "Content-Type: application/json" -d "$BODY" "$FULL_URL"
  fi

  echo ""
done

# Check to see if it worked:
curl "http://$BASE_URL/api/bins/$BIN_ID" | jq > ./temp.json
echo "See temp.json for output."
