// pages/AssassinationPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const AssassinationPage = () => {
  const { user, isAlive, setIsAlive } = useContext(AuthContext);
  const [targets, setTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [weapons, setWeapons] = useState([]);
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [resultMessage, setResultMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [userStats, setUserStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user stats and weapons on mount
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
          setUserStats({
            level: data.userData.level,
            rank: data.userData.rank,
          });
          setWeapons(
            data.userData.inventory.filter(
              (item) => item.attributes && item.attributes.accuracy
            )
          );
          // Update isAlive in AuthContext
          setIsAlive(data.userData.isAlive);
        } else {
          setErrorMessage(data.message || 'Failed to fetch user data.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setErrorMessage('Server error occurred.');
      }
    };
    fetchUserData();
  }, [setIsAlive]);

  // Fetch targets
  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const response = await fetch('/api/users/targets', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTargets(data.targets);
        } else {
          setErrorMessage('Failed to fetch targets.');
        }
      } catch (error) {
        console.error('Error fetching targets:', error);
        setErrorMessage('Server error occurred while fetching targets.');
      }
    };
    fetchTargets();
  }, []);

  // Function to attempt assassination
  const attemptAssassination = async () => {
    setResultMessage('');
    setErrorMessage('');
    setIsLoading(true);

    if (!selectedTarget) {
      setErrorMessage('You must select a target.');
      setIsLoading(false);
      return;
    }

    if (!selectedWeapon) {
      setErrorMessage('You must select a weapon.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/assassinate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          targetId: selectedTarget._id,
          weaponName: selectedWeapon.name,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResultMessage(data.message);
        if (data.userDied) { // If attacker died
          setIsAlive(false); // Update context
        }
      } else {
        setErrorMessage(data.message || 'Assassination attempt failed.');
        if (data.userDied) { // If attacker died
          setIsAlive(false); // Update context
        }
      }
    } catch (error) {
      console.error('Error during assassination attempt:', error);
      setErrorMessage('Server error occurred during assassination.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Assassination Page</h1>

      {/* Error Message */}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {/* Result Message */}
      {resultMessage && <p className="text-green-500">{resultMessage}</p>}

      {/* Target Selection */}
      <div className="mb-4">
        <label htmlFor="target-select" className="block font-bold mb-2">
          Select Target:
        </label>
        <select
          id="target-select"
          value={selectedTarget ? selectedTarget._id : ''}
          onChange={(e) => {
            const target = targets.find((t) => t._id === e.target.value);
            setSelectedTarget(target);
          }}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="" disabled>
            Choose a target
          </option>
          {targets.length > 0 ? (
            targets.map((target) => (
              <option key={target._id} value={target._id}>
                {target.username} (Level {target.level})
              </option>
            ))
          ) : (
            <option value="" disabled>No targets available</option>
          )}
        </select>
      </div>

      {/* Weapon Selection */}
      <div className="mb-4">
        <label htmlFor="weapon-select" className="block font-bold mb-2">
          Select Weapon:
        </label>
        <select
          id="weapon-select"
          value={selectedWeapon ? selectedWeapon.name : ''}
          onChange={(e) => {
            const weapon = weapons.find((w) => w.name === e.target.value);
            setSelectedWeapon(weapon);
          }}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="" disabled>
            Choose a weapon
          </option>
          {weapons.length > 0 ? (
            weapons.map((weapon) => (
              <option key={weapon.name} value={weapon.name}>
                {weapon.name} - Accuracy: {weapon.attributes.accuracy}%
              </option>
            ))
          ) : (
            <option value="" disabled>No weapons available</option>
          )}
        </select>
      </div>

      {/* Assassination Button */}
      <button
        onClick={attemptAssassination}
        disabled={isLoading}
        className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Attempting...' : 'Attempt Assassination'}
      </button>
    </div>
  );
};

export default AssassinationPage;
