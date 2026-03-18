import { useEffect, useRef } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

export function useFirebaseSync(
  userProfile: any, setUserProfile: (data: any) => void,
  history: any[], setHistory: (data: any[]) => void,
  vows: any[], setVows: (data: any[]) => void,
  scriptureGoals: any, setScriptureGoals: (data: any) => void,
  count: number, setCount: (data: number) => void,
  userExp: number, setUserExp: (data: number) => void,
  personalVow: string, setPersonalVow: (data: string) => void,
  selectedChant: string, setSelectedChant: (data: string) => void,
  volume: number, setVolume: (data: number) => void,
  soundType: string, setSoundType: (data: any) => void,
  woodenFishAppearance: string, setWoodenFishAppearance: (data: any) => void
) {
  const { user, isAuthReady } = useFirebase();
  const isInitialSyncDone = useRef(false);
  const isSyncing = useRef(false);

  // Initial fetch from Firebase when user logs in
  useEffect(() => {
    if (!isAuthReady) return;
    
    if (user && !isInitialSyncDone.current) {
      const fetchUserData = async () => {
        isSyncing.current = true;
        try {
          // Fetch Profile
          const profileDoc = await getDoc(doc(db, 'users', user.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            if (data.name) setUserProfile((prev: any) => ({ ...prev, name: data.name, avatar: data.avatar }));
            if (data.personalVow !== undefined) setPersonalVow(data.personalVow);
            if (data.totalMerit !== undefined) setCount(data.totalMerit);
            if (data.userExp !== undefined) setUserExp(data.userExp);
            if (data.selectedChant !== undefined) setSelectedChant(data.selectedChant);
            if (data.volume !== undefined) setVolume(data.volume);
            if (data.soundType !== undefined) setSoundType(data.soundType);
            if (data.woodenFishAppearance !== undefined) setWoodenFishAppearance(data.woodenFishAppearance);
            if (data.scriptureGoals) setScriptureGoals(data.scriptureGoals);
          }

          // Fetch History
          const historySnapshot = await getDocs(collection(db, `users/${user.uid}/history`));
          const historyData = historySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          if (historyData.length > 0) {
            setHistory(historyData);
            localStorage.setItem('zen_history', JSON.stringify(historyData));
          }

          // Fetch Vows
          const vowsSnapshot = await getDocs(collection(db, `users/${user.uid}/vows`));
          const vowsData = vowsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          if (vowsData.length > 0) {
            setVows(vowsData);
            localStorage.setItem('zen_vows', JSON.stringify(vowsData));
          }

          // Fetch Deeds
          const deedsSnapshot = await getDocs(collection(db, `users/${user.uid}/goodDeeds`));
          const deedsData = deedsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          if (deedsData.length > 0) {
            localStorage.setItem('good_deed_history', JSON.stringify(deedsData));
          }

          // Fetch Thoughts
          const thoughtsSnapshot = await getDocs(collection(db, `users/${user.uid}/thoughts`));
          const thoughtsData = thoughtsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          if (thoughtsData.length > 0) {
            localStorage.setItem('zen_thoughts', JSON.stringify(thoughtsData));
          }

          isInitialSyncDone.current = true;
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        } finally {
          isSyncing.current = false;
        }
      };
      fetchUserData();
    } else if (!user) {
      isInitialSyncDone.current = false;
    }
  }, [user, isAuthReady]);

  // Sync Profile changes to Firebase
  useEffect(() => {
    if (!user || !isInitialSyncDone.current || isSyncing.current) return;
    
    const syncProfile = async () => {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          name: userProfile.name || '',
          avatar: userProfile.avatar || '',
          personalVow: personalVow || '',
          totalMerit: count || 0,
          userExp: userExp || 0,
          selectedChant: selectedChant || '',
          volume: volume || 0.8,
          soundType: soundType || 'standard',
          woodenFishAppearance: woodenFishAppearance || 'standard',
          scriptureGoals: scriptureGoals || {},
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      }
    };

    const timeoutId = setTimeout(syncProfile, 2000); // Debounce
    return () => clearTimeout(timeoutId);
  }, [
    user, isInitialSyncDone, userProfile, personalVow, count, userExp, selectedChant, 
    volume, soundType, woodenFishAppearance, scriptureGoals
  ]);
}
