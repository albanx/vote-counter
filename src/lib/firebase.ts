import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  increment,
  writeBatch,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  Unsubscribe,
  DocumentReference
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Vote {
  id: string;
  userId: string;
  type: 'positive' | 'negative' | 'invalid';
  timestamp: Timestamp;
  region: string;
  city: string;
  kzaz: string;
}

interface VoteCount {
  positive: number;
  negative: number;
  invalid: number;
}

// Validate location parameters
const validateLocationParams = (region?: string, city?: string, kzaz?: string): boolean => {
  return Boolean(region && city && kzaz && region.trim() && city.trim() && kzaz.trim());
};

// Create initial count documents if they don't exist
const initializeCountDocuments = async (region: string, city: string, kzaz: string) => {
  if (!validateLocationParams(region, city, kzaz)) {
    console.error('Invalid location parameters');
    return false;
  }

  const initialData = {
    positive: 0,
    negative: 0,
    invalid: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    // Initialize region counts if they don't exist
    const regionCountRef = doc(db, `locations/${region}`);
    const regionDoc = await getDoc(regionCountRef);
    if (!regionDoc.exists()) {
      await setDoc(regionCountRef, initialData);
    }

    // Initialize location counts if they don't exist
    const locationCountRef = doc(db, `locations/${region}/${city}/${kzaz}`);
    const locationDoc = await getDoc(locationCountRef);
    if (!locationDoc.exists()) {
      await setDoc(locationCountRef, initialData);
    }

    // Initialize global counts if they don't exist
    const globalCountRef = doc(db, 'globalCounts/totals');
    const globalDoc = await getDoc(globalCountRef);
    if (!globalDoc.exists()) {
      await setDoc(globalCountRef, initialData);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing count documents:', error);
    return false;
  }
};

// Create a vote and update counts using batch write
export const saveVote = async (vote: Vote) => {
  const { region, city, kzaz, userId, type } = vote;

  if (!validateLocationParams(region, city, kzaz)) {
    console.error('Invalid location parameters in vote');
    return false;
  }

  try {
    // Ensure count documents exist before batch operation
    await initializeCountDocuments(region, city, kzaz);

    // Create a batch
    const batch = writeBatch(db);

    // References
    const voteRef = doc(db, `locations/${region}/${city}/${kzaz}/votes/${vote.id}`);
    const regionCountRef = doc(db, `locations/${region}`);
    const locationCountRef = doc(db, `locations/${region}/${city}/${kzaz}`);
    const globalCountRef = doc(db, 'globalCounts/totals');

    // Add vote document
    batch.set(voteRef, vote);

    // Update counters
    batch.update(regionCountRef, {
      [type]: increment(1),
      updatedAt: serverTimestamp()
    });

    batch.update(locationCountRef, { 
      [type]: increment(1),
      updatedAt: serverTimestamp()
    });
    
    batch.update(globalCountRef, { 
      [type]: increment(1),
      updatedAt: serverTimestamp()
    });

    // Commit the batch
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error saving vote:', error);
    
    // Try direct updates if batch fails
    try {
      // Save individual vote
      const voteRef = doc(db, `locations/${region}/${city}/${kzaz}/votes/${vote.id}`);
      await setDoc(voteRef, vote);
      
      // Update counters individually
      const locationCountRef = doc(db, `locations/${region}/${city}/${kzaz}`);
      await updateDoc(locationCountRef, { 
        [type]: increment(1),
        updatedAt: serverTimestamp()
      });
      
      const globalCountRef = doc(db, 'globalCounts/totals');
      await updateDoc(globalCountRef, { 
        [type]: increment(1),
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (fallbackError) {
      console.error('Error in fallback vote save:', fallbackError);
      return false;
    }
  }
};

// Decrement vote counts using direct updates
export const decrementVote = async (type: 'positive' | 'negative' | 'invalid', region: string, city: string, kzaz: string) => {
  if (!validateLocationParams(region, city, kzaz)) {
    console.error('Invalid location parameters for decrement');
    return false;
  }

  try {
    // Ensure count documents exist
    await initializeCountDocuments(region, city, kzaz);

    // Get current counts to check if they're positive
    const regionCountRef = doc(db, `locations/${region}`);
    const locationCountRef = doc(db, `locations/${region}/${city}/${kzaz}`);
    const globalCountRef = doc(db, 'globalCounts/totals');
    
    const [regionDoc, locationDoc, globalDoc] = await Promise.all([
      getDoc(regionCountRef),
      getDoc(locationCountRef),
      getDoc(globalCountRef)
    ]);

    const regionCount = regionDoc.data()?.[type] || 0;
    const locationCount = locationDoc.data()?.[type] || 0;
    const globalCount = globalDoc.data()?.[type] || 0;

    // Create a batch
    const batch = writeBatch(db);

    // Only decrement if counts are greater than 0
    if (regionCount > 0) {
      batch.update(regionCountRef, {
        [type]: increment(-1),
        updatedAt: serverTimestamp()
      });
    }

    if (locationCount > 0) {
      batch.update(locationCountRef, { 
        [type]: increment(-1),
        updatedAt: serverTimestamp()
      });
    }

    if (globalCount > 0) {
      batch.update(globalCountRef, { 
        [type]: increment(-1),
        updatedAt: serverTimestamp()
      });
    }

    // Commit the batch
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error in batch decrement:', error);
    
    // Try direct updates if batch fails
    try {
      // Get current counts
      const regionCountRef = doc(db, `locations/${region}`);
      const locationCountRef = doc(db, `locations/${region}/${city}/${kzaz}`);
      const globalCountRef = doc(db, 'globalCounts/totals');
      
      const [regionDoc, locationDoc, globalDoc] = await Promise.all([
        getDoc(regionCountRef),
        getDoc(locationCountRef),
        getDoc(globalCountRef)
      ]);

      const regionCount = regionDoc.data()?.[type] || 0;
      const locationCount = locationDoc.data()?.[type] || 0;
      const globalCount = globalDoc.data()?.[type] || 0;

      // Update individually
      if (regionCount > 0) {
        await updateDoc(regionCountRef, {
          [type]: increment(-1),
          updatedAt: serverTimestamp()
        });
      }

      if (locationCount > 0) {
        await updateDoc(locationCountRef, { 
          [type]: increment(-1),
          updatedAt: serverTimestamp()
        });
      }

      if (globalCount > 0) {
        await updateDoc(globalCountRef, { 
          [type]: increment(-1),
          updatedAt: serverTimestamp()
        });
      }
      
      return true;
    } catch (fallbackError) {
      console.error('Error in fallback decrement:', fallbackError);
      return false;
    }
  }
};

// Get real-time updates for location counts
export const subscribeToLocationCounts = (
  region: string,
  city: string,
  kzaz: string,
  callback: (counts: VoteCount) => void
): Promise<Unsubscribe> => {
  return new Promise((resolve, reject) => {
    if (!validateLocationParams(region, city, kzaz)) {
      console.error('Invalid location parameters for subscription');
      callback({ positive: 0, negative: 0, invalid: 0 });
      return reject(new Error('Invalid location parameters'));
    }
    // Initialize documents before setting up subscription
    initializeCountDocuments(region, city, kzaz)
      .then(() => {
        const locationRef = doc(db, `locations/${region}/${city}/${kzaz}`);
        const unsubscribe = onSnapshot(locationRef, 
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              callback({
                positive: data.positive || 0,
                negative: data.negative || 0,
                invalid: data.invalid || 0
              });
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

// Get real-time updates for global counts
// Get real-time updates for region counts
export const subscribeToRegionCounts = (
  region: string,
  callback: (counts: VoteCount) => void
): Promise<Unsubscribe> => {
  return new Promise((resolve, reject) => {
    if (!region?.trim()) {
      console.error('Invalid region parameter');
      callback({ positive: 0, negative: 0, invalid: 0 });
      return reject(new Error('Invalid region parameter'));
    }

    const regionRef = doc(db, `locations/${region}`);
    const unsubscribe = onSnapshot(regionRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          callback({
            positive: data.positive || 0,
            negative: data.negative || 0,
            invalid: data.invalid || 0
          });
        } else {
          callback({ positive: 0, negative: 0, invalid: 0 });
        }
      },
      (error) => {
        console.error('Error in region counts subscription:', error);
        callback({ positive: 0, negative: 0, invalid: 0 });
      }
    );
    resolve(unsubscribe);
  });
};

export const subscribeToGlobalCounts = (callback: (counts: VoteCount) => void): Unsubscribe => {
  const globalRef = doc(db, 'globalCounts/totals');
  
  return onSnapshot(globalRef, 
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          positive: data.positive || 0,
          negative: data.negative || 0,
          invalid: data.invalid || 0
        });
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
