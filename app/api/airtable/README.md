# Airtable API Endpoints

This directory contains API endpoints for interacting with Airtable. All endpoints require an Airtable access token that can be provided in the request body or query parameters.

## Authentication

All requests must include an Airtable access token. You can provide it in two ways:

1. **Query Parameters (for GET requests):** `?token=YOUR_AIRTABLE_ACCESS_TOKEN`
2. **Request Body (for POST requests):** Include `token` in the JSON body

## Endpoints

### 1. Get All Bases

**Endpoint:** `GET /api/airtable/bases`

**Description:** Retrieves all bases accessible with the provided access token.

**Query Parameters:**
- `token` (required): Your Airtable access token

**Example Request:**
```bash
curl "http://localhost:3000/api/airtable/bases?token=YOUR_TOKEN"
```

**Alternative POST Request:**
```bash
curl -X POST "http://localhost:3000/api/airtable/bases" \
-H "Content-Type: application/json" \
--data '{"token": "YOUR_TOKEN"}'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "bases": [
      {
        "id": "appXXXXXXXXXXXXXX",
        "name": "My Base",
        "permissionLevel": "create"
      }
    ]
  }
}
```

### 2. Get Tables from a Base

**Endpoint:** `GET /api/airtable/tables`

**Description:** Retrieves all tables from a specific base.

**Query Parameters:**
- `token` (required): Your Airtable access token
- `baseId` (required): The ID of the base to get tables from

**Example Request:**
```bash
curl "http://localhost:3000/api/airtable/tables?token=YOUR_TOKEN&baseId=appXXXXXXXXXXXXXX"
```

**Alternative POST Request:**
```bash
curl -X POST "http://localhost:3000/api/airtable/tables" \
-H "Content-Type: application/json" \
--data '{
  "token": "YOUR_TOKEN",
  "baseId": "appXXXXXXXXXXXXXX"
}'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "tables": [
      {
        "id": "tblXXXXXXXXXXXXXX",
        "name": "My Table",
        "description": "Table description",
        "fields": [...]
      }
    ]
  }
}
```

### 3. Create Records

**Endpoint:** `POST /api/airtable/records`

**Description:** Creates new records in a specified table.

**Headers:**
- `Content-Type: application/json` (required)

**Request Body:**
```json
{
  "token": "YOUR_TOKEN",
  "baseId": "appXXXXXXXXXXXXXX",
  "tableIdOrName": "tblXXXXXXXXXXXXXX",
  "records": [
    {
      "fields": {
        "Name": "John Doe",
        "Email": "john@example.com",
        "Status": "Active"
      }
    },
    {
      "fields": {
        "Name": "Jane Smith",
        "Email": "jane@example.com",
        "Status": "Inactive"
      }
    }
  ]
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/airtable/records" \
-H "Content-Type: application/json" \
--data '{
  "token": "YOUR_TOKEN",
  "baseId": "appXXXXXXXXXXXXXX",
  "tableIdOrName": "tblXXXXXXXXXXXXXX",
  "records": [
    {
      "fields": {
        "Name": "John Doe",
        "Email": "john@example.com"
      }
    }
  ]
}'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "recXXXXXXXXXXXXXX",
        "fields": {
          "Name": "John Doe",
          "Email": "john@example.com"
        },
        "createdTime": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 4. Get Records

**Endpoint:** `GET /api/airtable/records`

**Description:** Retrieves records from a specified table with optional filtering and pagination.

**Query Parameters:**
- `token` (required): Your Airtable access token
- `baseId` (required): The ID of the base
- `tableIdOrName` (required): The ID or name of the table
- `pageSize` (optional): Number of records per page (max 100)
- `offset` (optional): Pagination offset
- `filterByFormula` (optional): Airtable formula for filtering
- `sort` (optional): JSON array of sort objects
- `view` (optional): View name to use

**Example Request:**
```bash
curl "http://localhost:3000/api/airtable/records?token=YOUR_TOKEN&baseId=appXXXXXXXXXXXXXX&tableIdOrName=tblXXXXXXXXXXXXXX&pageSize=10"
```

## Error Handling

All endpoints return consistent error responses:

**Missing Token Error (400):**
```json
{
  "success": false,
  "message": "token query parameter is required"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "message": "baseId is required in request body"
}
```

**API Error:**
```json
{
  "success": false,
  "message": "Failed to fetch bases from Airtable",
  "error": { ... },
  "status": 400
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

## Getting Your Airtable Access Token

1. Go to [Airtable Account](https://airtable.com/account)
2. Navigate to the "API" section
3. Generate a new personal access token
4. Use this token in your requests

## Rate Limits

Be aware of Airtable's API rate limits:
- 5 requests per second per base
- 100,000 requests per month per workspace

## Notes

- All endpoints proxy requests to the official Airtable API
- Error responses from Airtable are preserved and returned to the client
- The endpoints include proper error handling and validation
- CORS headers are handled by Next.js automatically
- Tokens are passed in request body or query parameters for flexibility 