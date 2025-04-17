import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { setUserRole, UserRoles } from '../models/UserRole';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all users from Firestore
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      // Prepare a map of userId => userData
      const usersMap = {};
      usersSnapshot.forEach(doc => {
        usersMap[doc.id] = {
          id: doc.id,
          email: doc.data().email || '', // Ensure email is always present
          role: doc.data().role || UserRoles.USER,
          attempts: 0,
          totalScore: 0
        };
      });

      // Fetch all quiz attempts for stats
      const attemptsRef = collection(db, 'quizAttempts');
      const attemptsSnapshot = await getDocs(attemptsRef);

      attemptsSnapshot.forEach(doc => {
        const data = doc.data();
        if (usersMap[data.userId]) {
          usersMap[data.userId].attempts++;
          usersMap[data.userId].totalScore += (data.score / data.totalQuestions) * 100;
        }
      });

      // Prepare user list with stats
      const processedUsers = Object.values(usersMap).map(user => ({
        ...user,
        averageScore: user.attempts > 0 ? (user.totalScore / user.attempts).toFixed(1) : 0
      }));

      setUsers(processedUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await setUserRole(userId, newRole);
      // Update local state
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role. Please try again.');
    }
  };

  const filteredUsers = users.filter(user => {
    // Search by email or id for flexibility
    const matchesSearch =
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={loadUsers} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Admins</h3>
          <p>{users.filter(user => user.role === UserRoles.ADMIN).length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Regular Users</h3>
          <p>{users.filter(user => user.role === UserRoles.USER).length}</p>
        </div>
      </div>

      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search by email or user ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Roles</option>
          <option value={UserRoles.USER}>Users</option>
          <option value={UserRoles.ADMIN}>Admins</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Quiz Attempts</th>
              <th>Avg. Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.email || <em>No email</em>}</td>
                <td>{user.role}</td>
                <td>{user.attempts}</td>
                <td>{user.averageScore}%</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className={styles.roleSelect}
                  >
                    <option value={UserRoles.USER}>User</option>
                    <option value={UserRoles.ADMIN}>Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}