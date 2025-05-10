# Vote Counter Application

A Next.js application for vote counting with offline support and MongoDB integration.

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Copy `.env.example` to `.env` and fill in your configuration values:
```bash
cp .env.example .env
```

## Environment Variables

- `MONGODB_URI`: Your MongoDB connection string
- `NEXT_PUBLIC_FIREBASE_*`: Firebase configuration for authentication

## Backend Architecture

The application uses:
- Next.js API routes for backend endpoints
- MongoDB for data storage
- Firebase for authentication
- IndexedDB for offline support

### Database Schema

#### Vote Collection
```typescript
interface Vote {
  userId: string;
  type: 'positive' | 'negative' | 'invalid';
  timestamp: number;
  region: string;
  city: string;
  kzaz: string;
  deviceInfo: {
    ip: string;
    userAgent: string;
    browser: string;
    os: string;
  };
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints

#### POST /api/votes
Creates a new vote record.

Request Body:
```json
{
  "userId": "string",
  "type": "positive|negative|invalid",
  "timestamp": "number",
  "region": "string",
  "city": "string",
}
```

Response:
```json
{
  "message": "Vote recorded successfully",
  "vote": Vote
}
```

#### GET /api/votes
Retrieves votes with optional filtering.

Query Parameters:
- `region`: Filter by region
- `city`: Filter by city / kzaz
- `userId`: Filter by user ID

Response:
```json
[
  {
    "userId": "string",
    "type": "positive|negative|invalid",
    "timestamp": "number",
    "region": "string",
    "city": "string",
    "deviceInfo": {
      "ip": "string",
      "userAgent": "string",
      "browser": "string",
      "os": "string"
    },
    "synced": "boolean",
    "createdAt": "Date",
    "updatedAt": "Date"
  }
]
```

### Offline Support
The application uses IndexedDB for offline storage:
1. When offline, votes are stored locally
2. When connection is restored, pending votes are synced to the server
3. Local vote counts are maintained in Redux store

## Development

Run the development server:
```bash
npm run dev
```

## Production

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
