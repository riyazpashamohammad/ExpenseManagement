import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AppUser } from '../types/user';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await AsyncStorage.setItem('authUser', JSON.stringify(firebaseUser));
        // Fetch or create user profile in Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        let userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          // Prompt for first name on first login
          let firstName = '';
          if (firebaseUser.displayName) {
            firstName = firebaseUser.displayName.split(' ')[0];
          } else {
            // eslint-disable-next-line no-alert
            firstName = prompt('Enter your first name:') || '';
          }
          const newUser: AppUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            firstName,
            role: 'user',
            groupIds: [],
          };
          await setDoc(userRef, newUser);
          setAppUser(newUser);
        } else {
          setAppUser(userSnap.data() as AppUser);
        }
      } else {
        setAppUser(null);
        await AsyncStorage.removeItem('authUser');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setAppUser(null);
    await AsyncStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
