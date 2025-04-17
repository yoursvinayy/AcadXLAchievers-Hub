import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../config/firebase';
import { isAdmin } from '../models/UserRole';
import Loading from './Loading';

export default function AdminRoute({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (!user) {
          console.log('No user found, redirecting to login');
          router.push('/login');
          return;
        }

        const adminStatus = await isAdmin(user.uid);
        if (!adminStatus) {
          console.log('User is not an admin, redirecting to home');
          router.push('/');
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <Loading message="Checking authorization..." />;
  }

  return authorized ? children : null;
} 