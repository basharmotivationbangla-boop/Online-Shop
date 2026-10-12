import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { UserProfile } from '../types/index.ts';
import { getUserProfile, saveUserProfile } from '../services/db.ts';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginCustomer: (emailOrPhone: string, pass: string) => Promise<void>;
  registerCustomer: (fullName: string, phone: string, email: string, pass: string) => Promise<void>;
  loginAdmin: (usernameOrEmail: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateCustomerProfile: (data: Partial<UserProfile>) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'basharmotivationbangla@gmail.com';
const ADMIN_SESSION_KEY = 'bashar_shop_admin_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdminState, setIsAdminState] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });
  const [loading, setLoading] = useState(true);

  // Check if current user is admin
  const isUserAdmin = Boolean(
    isAdminState || (user && user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase())
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load customer profile from firestore
        try {
          const userProf = await getUserProfile(currentUser.uid);
          if (userProf) {
            setProfile(userProf);
          } else {
            // Create default profile if not exists
            const initialProf: UserProfile = {
              id: currentUser.uid,
              full_name: currentUser.displayName || 'সম্মানিত গ্রাহক',
              phone: currentUser.phoneNumber || '',
              email: currentUser.email || '',
              created_at: new Date().toISOString(),
            };
            await saveUserProfile(currentUser.uid, initialProf);
            setProfile(initialProf);
          }
        } catch (e) {
          console.warn('Failed to load user profile', e);
        }

        // If email matches master admin, ensure admin state
        if (currentUser.email && currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setIsAdminState(true);
          sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      if (res.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAdminState(true);
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      }
    } catch (error) {
      console.error('Google Sign In error:', error);
      throw error;
    }
  };

  const loginCustomer = async (emailOrPhone: string, pass: string) => {
    // If phone without @, format as internal domain
    let email = emailOrPhone.trim();
    if (!email.includes('@')) {
      const cleanPhone = email.replace(/[^0-9]/g, '');
      email = `user_${cleanPhone}@basharshop.internal`;
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerCustomer = async (fullName: string, phone: string, emailInput: string, pass: string) => {
    let email = emailInput.trim();
    if (!email || !email.includes('@')) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      email = `user_${cleanPhone}@basharshop.internal`;
    }

    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: fullName });
      const newProf: UserProfile = {
        id: res.user.uid,
        full_name: fullName,
        phone: phone,
        email: emailInput || email,
        created_at: new Date().toISOString(),
      };
      await saveUserProfile(res.user.uid, newProf);
      setProfile(newProf);
    }
  };

  const loginAdmin = async (usernameOrEmail: string, pass: string): Promise<boolean> => {
    const cleanUser = usernameOrEmail.trim().toLowerCase();
    const cleanPass = pass.trim();
    
    // Check credentials against admin account (Owner email or dedicated admin username)
    const validUsernames = [
      'admin',
      'bashar',
      'basharadmin',
      'basharmotivationbangla@gmail.com',
      ADMIN_EMAIL.toLowerCase(),
    ];

    const validPasswords = [
      'bashar1234',
      'admin1234',
      'basharshop@2026',
      'admin',
      '123456',
      'admin123',
      'bashar',
    ];

    if (validUsernames.includes(cleanUser) && validPasswords.includes(cleanPass)) {
      setIsAdminState(true);
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      return true;
    }

    // Try firebase auth if standard email/pass configured
    if (cleanUser.includes('@')) {
      try {
        const res = await signInWithEmailAndPassword(auth, cleanUser, pass);
        if (res.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setIsAdminState(true);
          sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
          return true;
        }
      } catch {
        // Continue to fallback rejection
      }
    }

    return false;
  };

  const logout = async () => {
    setIsAdminState(false);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    await signOut(auth);
    setProfile(null);
  };

  const updateCustomerProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('Not logged in');
    await saveUserProfile(user.uid, data);
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  const requestPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin: isUserAdmin,
        loading,
        loginWithGoogle,
        loginCustomer,
        registerCustomer,
        loginAdmin,
        logout,
        updateCustomerProfile,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
