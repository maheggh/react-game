import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import styles from './RankNavBar.module.css';

const RankNavbar = () => {
  const { user, xp, rank, updateUserData } = useContext(AuthContext); // Get the user data and updater function from context
  const [nextRankThreshold, setNextRankThreshold] = useState(1000);
  const [xpForNextLevel, setXpForNextLevel] = useState(0);

  // Calculate the progress to the next rank
  const progressToNextRank = xp && nextRankThreshold
    ? ((xp / nextRankThreshold) * 100).toFixed(2)
    : 0;

  // Fetch or update user data when the component mounts or when user XP changes
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
          updateUserData({
            xp: data.userData.xp,
            rank: data.userData.rank,
            nextRankThreshold: data.userData.nextRankThreshold,
            xpForNextLevel: data.userData.xpForNextLevel,
          });
          setNextRankThreshold(data.userData.nextRankThreshold);
          setXpForNextLevel(data.userData.xpForNextLevel);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData(); // Fetch user data initially
  }, [xp]); // Re-fetch when XP changes

  return (
    <div style={styles.navbar}>
      <div style={styles.rankInfo}>
        <p>Your Rank: {rank}</p>
        <p>XP: {xp}/{nextRankThreshold} (Next Rank in {xpForNextLevel} XP)</p>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progress, width: `${progressToNextRank}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default RankNavbar;
