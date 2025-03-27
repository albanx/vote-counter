# Vote Counter Application

## Overview
A vote counting application designed for electoral commissioners in Albania. The application allows for real-time vote counting with offline capabilities and live dashboard updates.

## Technical Stack

### Frontend
- **Framework**: Next.js with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: React Context + Firebase Realtime Database
- **PWA Features**: Service Workers for offline functionality
- **Language**: Albanian (with i18n support for maintainability)

### Backend & Infrastructure
- **Authentication**: Firebase Authentication
- **Database**: 
  - MongoDB: Main database for vote storage
  - Firebase Realtime Database: Real-time sync and offline capabilities
- **API**: Next.js API routes
- **Hosting**: Vercel (for Next.js) + MongoDB Atlas

## Core Features

### 1. Authentication System
- Admin-controlled user registration
- Secure login for commissioners
- Role-based access control
- Session management
- Password recovery

### 2. Location Hierarchy
```mermaid
graph TD
    A[Region] --> B[City]
    B --> C[KZAZ/Voting Center]
    C --> D[Ballot Box Number]
```

### 3. Vote Counting Interface
- Three main action buttons:
  - Positive Vote ✅
  - Negative Vote ❌
  - Invalid Vote ⚠️
- Mobile-optimized UI
- Large, easy-to-tap buttons
- Current count display
- Ballot box identifier
- Offline status indicator
- Vote finalization:
  - Votes are final once entered
  - No editing capability to ensure integrity
- Dispute handling:
  - Ability to add comments for disputed votes
  - Dispute flag visible in dashboard
  - Dispute resolution tracking

### 4. Offline Functionality
- Complete offline operation capability
- Local storage of votes
- Automatic synchronization when online
- Conflict resolution strategy
- Sync status indicators

### 5. Dashboard
- Real-time vote totals
- Breakdown by region/city/KZAZ
- Progress indicators
- Export capabilities
- Administrative controls

## Data Models

### User
```typescript
interface User {
  id: string;
  username: string;
  role: 'admin' | 'commissioner';
  assignedKZAZ?: string[];
  lastActive: Date;
}
```

### Location
```typescript
interface Location {
  id: string;
  type: 'region' | 'city' | 'kzaz';
  name: string;
  parentId?: string;
  code: string;
}
```

### VoteEntry
```typescript
interface VoteEntry {
  id: string;
  kzazId: string;
  ballotBoxNumber: string;
  userId: string;
  timestamp: Date;
  voteType: 'positive' | 'negative' | 'invalid';
  syncStatus: 'pending' | 'synced';
  hasDispute: boolean;
}
```

### DisputeEntry
```typescript
interface DisputeEntry {
  id: string;
  voteEntryId: string;
  userId: string;
  timestamp: Date;
  comment: string;
  status: 'open' | 'under_review' | 'resolved';
  resolution?: string;
}
```

## Security Considerations
1. End-to-end data encryption
2. Rate limiting for API endpoints
3. Input validation and sanitization
4. Audit logging
5. Session timeout management

## Performance Optimizations
1. Efficient offline data storage
2. Batch synchronization
3. Optimistic UI updates
4. Caching strategies
5. Progressive loading

## Development Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd vote-counter
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
MONGODB_URI=
```

4. Run development server:
```bash
npm run dev
```

## Deployment

The application is optimized for deployment on Vercel's platform.

### Prerequisites
1. Set up MongoDB Atlas cluster:
   - Create a new cluster
   - Configure network access
   - Create database user
   - Get connection string

2. Configure Firebase project:
   - Set up Authentication
   - Configure Realtime Database
   - Get Firebase configuration
   
3. Configure Vercel Project:
   - Connect GitHub repository
   - Add environment variables:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
     MONGODB_URI=your_mongodb_connection_string
     ```

### Deployment Steps
1. Automatic Deployments:
   - Push to main branch will trigger automatic deployment
   - Vercel will handle build and deployment
   - Preview deployments for pull requests

2. Manual Deployment:
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Deploy to production
   vercel --prod
   ```

3. Post-Deployment:
   - Verify environment variables
   - Test authentication flow
   - Confirm database connections
   - Check offline functionality
   - Test real-time updates

### Monitoring
- Use Vercel Analytics for performance monitoring
- Set up MongoDB Atlas monitoring
- Configure Firebase Analytics
- Enable error tracking and reporting

## Future Enhancements
1. Multi-language support
2. Advanced analytics dashboard
3. Real-time communication between commissioners
4. Enhanced offline capabilities
5. Automated testing suite
6. Backup and recovery procedures

## Contributing
[Contributing guidelines will be added here]

## License
[License information will be added here]