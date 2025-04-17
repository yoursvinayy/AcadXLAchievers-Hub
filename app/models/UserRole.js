import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { httpsCallable, getFunctions } from 'firebase/functions';

// User roles enum
export const UserRoles = {
  USER: 'user',
  ADMIN: 'admin'
};

// Check if user is admin
export async function isAdmin(userId) {
  try {
    if (!userId) return false;
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() && userDoc.data().role === UserRoles.ADMIN;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Set user role
export async function setUserRole(userId, role) {
  try {
    await setDoc(doc(db, 'users', userId), { role }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error setting user role:', error);
    return false;
  }
}

// Get user role
export async function getUserRole(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().role || UserRoles.USER;
    }
    return UserRoles.USER;
  } catch (error) {
    console.error('Error getting user role:', error);
    return UserRoles.USER;
  }
}

// Set up admin user - simplified version
export async function setupAdminUser(userId) {
  if (!userId) {
    console.error('No user ID provided');
    return false;
  }

  try {
    // Simple direct write approach
    await setDoc(doc(db, 'users', userId), {
      role: UserRoles.ADMIN,
      email: auth.currentUser?.email || '',
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error in setupAdminUser:', error);
    throw error;
  }
} 