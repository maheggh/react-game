import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const AssassinationPage = () => {
  const { user, money, cars, updateUserData, isAlive, setIsAlive } = useContext(AuthContext);
  const [targets, setTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [weapons, setWeapons] = useState([]);
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [resultMessage, setResultMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [userStats, setUserStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [scenarioImage, setScenarioImage] = useState('');
  const [cooldown, setCooldown] = useState(null); 

  const COOLDOWN_TIME = 0; // 30 * 60 * 1000; 

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
            accuracy: data.userData.accuracy,
            kills: data.userData.kills, // Fetch the user's assassination kills
          });
          setWeapons(
            data.userData.inventory.filter(
              (item) => item.attributes && item.attributes.accuracy
            )
          );
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

  // Check cooldown status
  useEffect(() => {
    const lastAttempt = localStorage.getItem('lastAssassinationAttempt');
    if (lastAttempt) {
      const remainingTime = COOLDOWN_TIME - (Date.now() - new Date(lastAttempt));
      if (remainingTime > 0) {
        setCooldown(remainingTime);
        const interval = setInterval(() => {
          setCooldown((prev) => (prev > 1000 ? prev - 1000 : 0));
        }, 1000);
        return () => clearInterval(interval);
      }
    }
  }, []);

  // Function to calculate random outcome
  const calculateOutcome = (accuracy) => {
    const randomFactor = Math.random();
    return randomFactor < accuracy / 100; // success if randomFactor is within accuracy range
  };

  // Function to attempt assassination
  const attemptAssassination = async () => {
    setResultMessage('');
    setErrorMessage('');
    setIsLoading(true);
  
    if (cooldown > 0) {
      setErrorMessage(`Please wait ${Math.ceil(cooldown / 60000)} minutes before your next attempt.`);
      setIsLoading(false);
      return;
    }
  
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
  
    if (money < 50000) {
      setErrorMessage('Not enough money. Assassination costs $50,000.');
      setIsLoading(false);
      return;
    }
  
    const success = calculateOutcome(selectedWeapon.attributes.accuracy);
  
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
        const newMoney = money - 50000 + (data.lootMoney || 0);
  
        // Ensure 'cars' is always an array
        const newCars = [...(cars || []), ...(data.lootCars || [])]; // If 'cars' or 'lootCars' is undefined, default to an empty array
        const newInventory = [...(user.inventory || []), ...(data.lootInventory || [])]; // Same check for inventory
  
        // Update the user data with new money, cars, and inventory
        updateUserData({ money: newMoney, cars: newCars, inventory: newInventory });
  
        setResultMessage(success ? `You assassinated ${selectedTarget.username} and looted all their possessions!` : 'Assassination failed, try again.');
        setScenarioImage(success ? '/assets/success.png' : '/assets/failure.png');
        localStorage.setItem('lastAssassinationAttempt', new Date());
        setCooldown(COOLDOWN_TIME);
  
        if (data.userDied) {
          setIsAlive(false);
        }
      } else {
        setErrorMessage(data.message || 'Assassination attempt failed.');
        setScenarioImage('/assets/failure.png');
        if (data.userDied) {
          setIsAlive(false); 
        }
      }
    } catch (error) {
      console.error('Error during assassination attempt:', error);
      setErrorMessage('Server error occurred during assassination.');
      setScenarioImage('/assets/error.png');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 text-white min-h-screen bg-gray-900 pt-20 pb-40 mt-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-red-700">Assassination Mission</h1>

      {/* Error Message */}
      {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
      <h1 className='text-left p-4 text-lg'>Welcome to the potato underworld, where you can 'tactfully eliminate' other unsuspecting spuds. 
        But beware! Not every potato goes down without a fight—some have eyes on the back of their heads and might fry you instead. 
        Proceed with caution, or you might just be the one mashed!</h1>

      {/* Display the user's current kills */}
      <div className="text-center mb-4">
        <p className="text-xl">Your Assassination Count: <span className="font-bold text-green-400">{userStats.kills || 0}</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Target Selection */}
        <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-gray-200">Select Target</h2>
          <select
            id="target-select"
            value={selectedTarget ? selectedTarget._id : ''}
            onChange={(e) => {
              const target = targets.find((t) => t._id === e.target.value);
              setSelectedTarget(target);
            }}
            className="border border-gray-600 rounded px-3 py-2 w-full bg-gray-700 text-white"
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
        <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-gray-200">Select Weapon</h2>
          <select
            id="weapon-select"
            value={selectedWeapon ? selectedWeapon.name : ''}
            onChange={(e) => {
              const weapon = weapons.find((w) => w.name === e.target.value);
              setSelectedWeapon(weapon);
            }}
            className="border border-gray-600 rounded px-3 py-2 w-full bg-gray-700 text-white"
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
      </div>

      {/* Result Message */}
      {resultMessage && <p className="text-green-400 text-center text-lg mb-4 p-3 bg-gray-700 rounded-md">{resultMessage}</p>}

      {/* Display Scenario Image */}
      {scenarioImage && (
        <div className="flex justify-center mb-6">
          <img src={scenarioImage} alt="Assassination Scenario" className="w-1/2 h-auto rounded-md shadow-md" />
        </div>
      )}

      {/* Cooldown Timer */}
      {cooldown > 0 && (
        <p className="text-center text-red-500 mb-4">Next attempt available in: {Math.floor(cooldown / 60000)} minutes</p>
      )}

      {/* Assassination Button */}
      <div className="flex justify-center">
        <button
          onClick={attemptAssassination}
          disabled={isLoading || cooldown > 0}
          className={`bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out ${isLoading || cooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full"></div>
          ) : (
            'Attempt Assassination'
          )}
        </button>
      </div>
    </div>
  );
};

export default AssassinationPage;
