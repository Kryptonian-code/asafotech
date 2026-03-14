import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { syncFirebaseCustomer, type CustomerUser } from "@/lib/api";
import { auth, firebaseConfigError, googleProvider, prefersRedirectAuth } from "@/lib/firebase";

interface CustomerAuthContextValue {
  user: CustomerUser | null;
  loading: boolean;
  configError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { fullName: string; email: string; phone?: string; password: string; }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendResetLink: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

function isGoogleUser() {
  return auth?.currentUser?.providerData.some((provider) => provider.providerId === "google.com") ?? false;
}

function mapFirebaseUser(): CustomerUser | null {
  if (!auth?.currentUser) {
    return null;
  }

  const currentUser = auth.currentUser;

  return {
    id: 0,
    fullName: currentUser.displayName ?? currentUser.email?.split("@")[0] ?? "Customer",
    email: currentUser.email ?? "",
    phone: currentUser.phoneNumber ?? null,
    firebaseUid: currentUser.uid,
  };
}

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncCustomerProfile = async (
    firebaseUser: FirebaseUser,
    phoneOverride?: string | null,
  ): Promise<CustomerUser> => {
    if (!firebaseUser.email) {
      throw new Error("A valid email address is required for customer sync.");
    }

    const response = await syncFirebaseCustomer({
      firebaseUid: firebaseUser.uid,
      fullName: firebaseUser.displayName ?? firebaseUser.email.split("@")[0] ?? "Customer",
      email: firebaseUser.email,
      phone: phoneOverride ?? firebaseUser.phoneNumber ?? null,
      emailVerified: firebaseUser.emailVerified,
    });

    return response.user;
  };

  const refresh = useCallback(async () => {
    if (!auth) {
      setUser(null);
      setLoading(false);
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    await currentUser.reload();

    if (!currentUser.emailVerified && !isGoogleUser()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setUser(await syncCustomerProfile(currentUser));
    } catch {
      setUser(mapFirebaseUser());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      await firebaseUser.reload();

      const signedInWithGoogle = firebaseUser.providerData.some((provider) => provider.providerId === "google.com");

      if (!firebaseUser.emailVerified && !signedInWithGoogle) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setUser(await syncCustomerProfile(firebaseUser));
      } catch {
        setUser({
          id: 0,
          fullName: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "Customer",
          email: firebaseUser.email ?? "",
          phone: firebaseUser.phoneNumber ?? null,
          firebaseUid: firebaseUser.uid,
        });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<CustomerAuthContextValue>(() => ({
    user,
    loading,
    configError: firebaseConfigError,
    login: async (email, password) => {
      if (!auth) {
        throw new Error(firebaseConfigError ?? "Firebase auth is not configured.");
      }

      const response = await signInWithEmailAndPassword(auth, email, password);

      if (!response.user.emailVerified) {
        await sendEmailVerification(response.user);
        await signOut(auth);
        throw new Error("Please verify your email first. We sent a fresh verification link to your inbox.");
      }

      setUser(await syncCustomerProfile(response.user));
    },
    register: async (payload) => {
      if (!auth) {
        throw new Error(firebaseConfigError ?? "Firebase auth is not configured.");
      }

      const response = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
      await updateProfile(response.user, {
        displayName: payload.fullName,
      });
      await sendEmailVerification(response.user);
      await signOut(auth);
      setUser(null);
    },
    loginWithGoogle: async () => {
      if (!auth || !googleProvider) {
        throw new Error(firebaseConfigError ?? "Firebase auth is not configured.");
      }

      if (prefersRedirectAuth()) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      const response = await signInWithPopup(auth, googleProvider);
      setUser(await syncCustomerProfile(response.user));
    },
    sendResetLink: async (email) => {
      if (!auth) {
        throw new Error(firebaseConfigError ?? "Firebase auth is not configured.");
      }

      await sendPasswordResetEmail(auth, email);
    },
    logout: async () => {
      if (!auth) {
        setUser(null);
        return;
      }

      await signOut(auth);
      setUser(null);
    },
    refresh,
  }), [loading, refresh, user]);

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);

  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }

  return context;
};
