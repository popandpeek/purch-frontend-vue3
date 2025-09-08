import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/firebase.js';
import type { User, UserLogin, UserRegister } from '@/api/model';

export class AuthService {
  // Email/Password Login
  async login(credentials: UserLogin): Promise<FirebaseUser> {
    const { email, password } = credentials;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  // Email/Password Registration
  async register(userData: UserRegister): Promise<FirebaseUser> {
    const { email, password, first_name, last_name } = userData;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    await updateProfile(userCredential.user, {
      displayName: `${first_name} ${last_name}`
    });
    
    return userCredential.user;
  }

  // Google Sign-In
  async signInWithGoogle(): Promise<FirebaseUser> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  }

  // Logout
  async logout(): Promise<void> {
    await signOut(auth);
  }

  // Password Reset
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  // Auth State Listener
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Convert Firebase User to our User interface
  convertFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      username: firebaseUser.displayName || firebaseUser.email || '',
      first_name: firebaseUser.displayName?.split(' ')[0] || '',
      last_name: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
      phone: firebaseUser.phoneNumber || undefined,
      is_active: !firebaseUser.isAnonymous,
      is_superuser: false, // You can set this based on custom claims
      created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
      updated_at: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
    };
  }
}

export const authService = new AuthService();
