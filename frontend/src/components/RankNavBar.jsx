import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import styles from './RankNavBar.module.css';

const RankNavbar = () => {
  const { user } = useContext(AuthContext);
  const [rank, setRank] = useState('Homeless Potato');
  const [xp, setXp] = useState(0);
  const nextRankThreshold = 1000;
  const progressToNextRank = xp !== null ? ((xp / nextRankThreshold) * 100).toFixed(2) : 0;

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setRank(data.userData.rank || 'Homeless Potato');
          setXp(data.userData.xp || 0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div style={styles.navbar}>
      <div style={styles.rankInfo}>
        <p>Your Rank: {rank}</p>
        <p>XP: {xp}</p>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progress, width: `${progressToNextRank}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default RankNavbar;
