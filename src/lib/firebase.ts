import {
  doc,
  getDoc,
  increment,
  writeBatch,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  Unsubscribe,
  FirestoreDataConverter,
  WithFieldValue,
  DocumentData,
  SnapshotOptions,
  collection,
  QuerySnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Vote {
  id: string;
  userId: string;
  boxNumber: string;
  userEmail: string;
  type: 'positive' | 'negative' | 'invalid';
  subType?: 'incremented' | 'decremented';
  timestamp: Timestamp;
  region: string;
  city: string;
  metadata: {
    userAgent: string;
    browser: string;
    platform: string;
    createdBy: string;
  };
}

interface VoteCount {
  positive: number;
  negative: number;
  invalid: number;
  createdAt?: Timestamp | number;
  updatedAt?: Timestamp | number;
}

// Firestore data converter for Vote
const voteConverter: FirestoreDataConverter<Vote> = {
  toFirestore(vote: WithFieldValue<Vote>): DocumentData {
    return vote;
  },
  fromFirestore(snapshot: DocumentData, options?: SnapshotOptions): Vote {
    const data = snapshot.data(options);
    return {
      id: data.id,
      userId: data.userId,
      boxNumber: data.boxNumber || '',
      userEmail: data.userEmail || '',
      type: data.type,
      subType: data.subType,
      timestamp: data.timestamp,
      region: data.region,
      city: data.city,
      metadata: {
        userAgent: data.metadata?.userAgent || '',
        browser: data.metadata?.browser || '',
        platform: data.metadata?.platform || '',
        createdBy: data.metadata?.createdBy || ''
      }
    };
  },
};

// Firestore data converter for VoteCount
const voteCountConverter: FirestoreDataConverter<VoteCount> = {
  toFirestore(voteCount: WithFieldValue<VoteCount>): DocumentData {
    return voteCount;
  },
  fromFirestore(snapshot: DocumentData, options?: SnapshotOptions): VoteCount {
    const data = snapshot.data(options);
    return {
      positive: data.positive || 0,
      negative: data.negative || 0,
      invalid: data.invalid || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};

// Validate location parameters
const validateLocationParams = (region?: string, city?: string, boxNumber?:string): boolean => {
  return Boolean(boxNumber && region && city && region.trim() && city.trim() && boxNumber.trim());
};

/**
 * Create initial count documents if they don't exist
 * Uses batch operations for better offline support
 */
const initializeCountDocuments = async (region: string, city: string, boxNumber: string) => {
  if (!validateLocationParams(region, city, boxNumber)) {
    console.error('Invalid location parameters');
    return false;
  }

  const initialData = {
    positive: 0,
    negative: 0,
    invalid: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    // Get references with converters
    const regionCountRef = doc(db, `regionCounts/${region}`).withConverter(voteCountConverter);
    const locationCountRef = doc(db, `locationCounts/${region}/kzaz/${city}`).withConverter(voteCountConverter);
    const boxCountRef = doc(db, `locationCounts/${region}/kzaz/${city}/box/${boxNumber}`).withConverter(voteCountConverter);
    const globalCountRef = doc(db, 'globalCounts/totals').withConverter(voteCountConverter);

    // Check if documents exist
    const [regionDoc, locationDoc, globalDoc, boxCountDoc] = await Promise.all([
      getDoc(regionCountRef),
      getDoc(locationCountRef),
      getDoc(globalCountRef),
      getDoc(boxCountRef),
    ]);

    // Create a batch for better offline support
    const batch = writeBatch(db);

    if (!regionDoc.exists()) {
      batch.set(regionCountRef, initialData);
    }

    if (!locationDoc.exists()) {
      batch.set(locationCountRef, initialData);
    }

    if (!globalDoc.exists()) {
      batch.set(globalCountRef, initialData);
    }

    if (!boxCountDoc.exists()) {
      batch.set(boxCountRef, initialData);
    }

    // Only commit if there are changes to make
    if (!regionDoc.exists() || !locationDoc.exists() || !globalDoc.exists() || !boxCountDoc.exists()) {
      await batch.commit();
    }

    return true;
  } catch (error) {
    console.error('Error initializing count documents:', error);
    return false;
  }
};

/**
 * Create a vote and update counts using batch operations
 * This provides better offline support
 */
export const saveIncrementVote = async (vote: Vote, incrementStep = 1) => {
  const { region, city, userId, type, boxNumber } = vote;

  if (!validateLocationParams(region, city, boxNumber)) {
    console.error('Invalid location parameters in vote');
    return false;
  }

  try {
    // Ensure count documents exist before batch operation
    await initializeCountDocuments(region, city, vote.boxNumber);

    // Create a batch
    const batch = writeBatch(db);
    const voteRef = doc(db, `locationCounts/${region}/kzaz/${city}/box/${boxNumber}/votes/${vote.id}`).withConverter(voteConverter);
    const boxCountRef = doc(db, `locationCounts/${region}/kzaz/${city}/box/${boxNumber}`).withConverter(voteCountConverter);
    const locationCountRef = doc(db, `locationCounts/${region}/kzaz/${city}`).withConverter(voteCountConverter);
    const regionCountRef = doc(db, `regionCounts/${region}`).withConverter(voteCountConverter);
    const globalCountRef = doc(db, 'globalCounts/totals').withConverter(voteCountConverter);

    // Set vote with incremented subType
    batch.set(voteRef, {
      ...vote,
      subType: 'incremented'
    });

    batch.update(regionCountRef, {
      [type]: increment(incrementStep),
      updatedAt: serverTimestamp(),
    });

    batch.update(boxCountRef, {
      [type]: increment(incrementStep),
      updatedAt: serverTimestamp(),
    });

    batch.update(locationCountRef, {
      [type]: increment(incrementStep),
      updatedAt: serverTimestamp(),
    });

    batch.update(globalCountRef, {
      [type]: increment(incrementStep),
      updatedAt: serverTimestamp(),
    });

    // Commit the batch
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error saving vote:', error);
    return false;
  }
};

/**
 * Decrement vote counts using batch operations
 * This provides better offline support
 */
export const saveDecrementVote = async (vote: Vote) => {
  const { region, city, userId, type, boxNumber } = vote;
  if (!validateLocationParams(region, city, boxNumber)) {
    console.error('Invalid location parameters for decrement');
    return false;
  }

  try {
    // Ensure count documents exist
    await initializeCountDocuments(region, city, boxNumber);
    
    // References with converters
    const voteRef = doc(db, `locationCounts/${region}/kzaz/${city}/box/${boxNumber}/votes/${vote.id}`).withConverter(voteConverter);
    const boxCountRef = doc(db, `locationCounts/${region}/kzaz/${city}/box/${boxNumber}`).withConverter(voteCountConverter);
    const locationCountRef = doc(db, `locationCounts/${region}/kzaz/${city}`).withConverter(voteCountConverter);
    const regionCountRef = doc(db, `regionCounts/${region}`).withConverter(voteCountConverter);
    const globalCountRef = doc(db, 'globalCounts/totals').withConverter(voteCountConverter);

    // Get current counts to check if they're positive
    const [regionDoc, locationDoc, globalDoc, boxCountDoc] = await Promise.all([
      getDoc(regionCountRef),
      getDoc(locationCountRef),
      getDoc(globalCountRef),
      getDoc(boxCountRef),
    ]);

    const regionCount = regionDoc.data()?.[type] || 0;
    const boxCount = boxCountDoc.data()?.[type] || 0;
    const locationCount = locationDoc.data()?.[type] || 0;
    const globalCount = globalDoc.data()?.[type] || 0;

    // Create a batch
    const batch = writeBatch(db);

    // Only decrement if counts are greater than 0
    if (boxCount > 0) {
      batch.set(voteRef, {
        ...vote,
        subType: 'decremented'
      });
      
      batch.update(boxCountRef, {
        [type]: increment(-1),
        updatedAt: serverTimestamp(),
      });

      if (regionCount > 0) {
        batch.update(regionCountRef, {
          [type]: increment(-1),
          updatedAt: serverTimestamp(),
        });
      }


      if (locationCount > 0) {
        batch.update(locationCountRef, {
          [type]: increment(-1),
          updatedAt: serverTimestamp(),
        });
      }
  
      if (globalCount > 0) {
        batch.update(globalCountRef, {
          [type]: increment(-1),
          updatedAt: serverTimestamp(),
        });
      }
    }

    // Commit the batch
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error in batch decrement:', error);
    return false;
  }
};

/**
 * Get real-time updates for location counts
 * Uses data converters for type safety and converts Timestamps to serializable values for Redux
 */
export const subscribeToLocationBoxCounts = (
  region: string,
  city: string,
  boxNumber: string,
  callback: (counts: VoteCount) => void
): Promise<Unsubscribe> => {
  return new Promise((resolve, reject) => {
    if (!validateLocationParams(region, city, boxNumber)) {
      console.error('Invalid location parameters for subscription');
      callback({ positive: 0, negative: 0, invalid: 0 });
      return reject(new Error('Invalid location parameters'));
    }

    // Initialize documents before setting up subscription
    initializeCountDocuments(region, city, boxNumber)
      .then(() => {
        // Use converter for type safety
        const locationRef = doc(db, `locationCounts/${region}/kzaz/${city}/box/${boxNumber}`).withConverter(voteCountConverter);

        const unsubscribe = onSnapshot(
          locationRef,
          (snapshot) => {
            if (snapshot.exists()) {
              // Data is already typed through the converter
              const data = snapshot.data();

              // Convert Timestamp objects to serializable values for Redux
              const serializableData = {
                positive: data.positive,
                negative: data.negative,
                invalid: data.invalid,
                // Convert Timestamps to milliseconds if they exist
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
                updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : data.updatedAt,
              };

              callback(serializableData);
            } else {
              callback({ positive: 0, negative: 0, invalid: 0 });
            }
          },
          (error) => {
            console.error('Error in location counts subscription:', error);
            callback({ positive: 0, negative: 0, invalid: 0 });
          }
        );
        resolve(unsubscribe);
      })
      .catch((error) => {
        console.error('Error setting up location counts subscription:', error);
        callback({ positive: 0, negative: 0, invalid: 0 });
        reject(error);
      });
  });
};

/**
 * Get real-time updates for all cities in a region
 * Uses data converters for type safety and converts Timestamps to serializable values
 */
export const subscribeToCityLevelCounts = (
  region: string,
  callback: (counts: { [city: string]: VoteCount }) => void
): Unsubscribe => {
  // Use converter for type safety
  const citiesRef = collection(db, `locationCounts/${region}/kzaz`).withConverter(voteCountConverter);
  
  return onSnapshot(citiesRef,
    (snapshot: QuerySnapshot<VoteCount>) => {
      const allCityCounts: { [city: string]: VoteCount } = {};
      
      snapshot.forEach((doc: QueryDocumentSnapshot<VoteCount>) => {
        const data = doc.data();
        allCityCounts[doc.id] = {
          positive: data.positive,
          negative: data.negative,
          invalid: data.invalid,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : data.updatedAt
        };
      });
      
      callback(allCityCounts);
    },
    (error: Error) => {
      console.error(`Error listening to city counts for region ${region}:`, error);
      callback({});
    }
  );
};

/**
 * Get real-time updates for global counts
 * Uses data converters for type safety and converts Timestamps to serializable values for Redux
 */
/**
 * Get real-time updates for all regions' counts
 * Uses data converters for type safety and converts Timestamps to serializable values for Redux
 */
export const subscribeToAllRegionCounts = (
  callback: (counts: { [region: string]: VoteCount }) => void
): Unsubscribe => {
  // Use converter for type safety
  const regionCountsRef = collection(db, 'regionCounts').withConverter(voteCountConverter);
  
  return onSnapshot(regionCountsRef,
    (snapshot: QuerySnapshot<VoteCount>) => {
      const allRegionCounts: { [region: string]: VoteCount } = {};
      
      snapshot.forEach((doc: QueryDocumentSnapshot<VoteCount>) => {
        const data = doc.data();
        // Convert Timestamp objects to serializable values for Redux
        allRegionCounts[doc.id] = {
          positive: data.positive,
          negative: data.negative,
          invalid: data.invalid,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : data.updatedAt
        };
      });
      
      callback(allRegionCounts);
    },
    (error: Error) => {
      console.error('Error listening to region counts:', error);
      callback({});
    }
  );
};

export const subscribeToGlobalCounts = (callback: (counts: VoteCount) => void): Unsubscribe => {
  // Use converter for type safety
  const globalRef = doc(db, 'globalCounts/totals').withConverter(voteCountConverter);

  return onSnapshot(
    globalRef,
    (snapshot) => {
      if (snapshot.exists()) {
        // Data is already typed through the converter
        const data = snapshot.data();

        // Convert Timestamp objects to serializable values for Redux
        const serializableData = {
          positive: data.positive,
          negative: data.negative,
          invalid: data.invalid,
          // Convert Timestamps to milliseconds if they exist
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : data.updatedAt,
        };

        callback(serializableData);
      } else {
        callback({ positive: 0, negative: 0, invalid: 0 });
      }
    },
    (error) => {
      console.error('Error listening to global counts:', error);
      callback({ positive: 0, negative: 0, invalid: 0 });
    }
  );
};
