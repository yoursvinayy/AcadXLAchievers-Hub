'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '../components/AdminDashboard';
import { getUserRole, UserRoles } from '../models/UserRole';
import { auth } from '../config/firebase';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const role = await getUserRole(user.uid);
      if (role !== UserRoles.ADMIN) {
        router.push('/');
      }
    };

    checkAdminAccess();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <AdminDashboard />
    </div>
  );
} 