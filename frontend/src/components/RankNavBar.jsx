import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import styles from './RankNavBar.module.css';

const RankNavbar = () => {
  const { user, xp, rank } = useContext(AuthContext); 
  const [nextRankThreshold, setNextRankThreshold] = useState(1000);
  const [xpForNextLevel, setXpForNextLevel] = useState(0);
  const [collapsed, setCollapsed] = useState(true); 

  const progressToNextRank = xp && nextRankThreshold
    ? ((xp / nextRankThreshold) * 100).toFixed(2)
    : 0;

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No token found in localStorage.');
            return;
          }
    
          const response = await fetch('/api/users/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          const data = await response.json();
    
          if (response.ok && data.success) {
            setNextRankThreshold(data.userData.nextRankThreshold);
            setXpForNextLevel(data.userData.xpForNextLevel);
          } else {
            console.error('Failed to fetch user data:', data.message);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
    
      fetchUserData();
    }, [xp]);
    

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`${styles.navbar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.toggleButton} onClick={toggleCollapse}>
        {collapsed ? 'Show Rank' : 'Hide Rank'}
      </div>
      {!collapsed && (
        <div className={styles.rankInfo}>
          <p>Your Rank: {rank}</p>
          <p>XP: {xp}/{nextRankThreshold} (Next Rank in {xpForNextLevel} XP)</p>
          <div className={styles.progressBar}>
            <div className={styles.progress} style={{ width: `${progressToNextRank}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankNavbar;
