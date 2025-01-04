import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AssassinationPage = () => {
  const { user, money, updateUserData, isAlive, setIsAlive, kills } = useContext(AuthContext);
  const [targets, setTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [weapons, setWeapons] = useState([]);
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [bossItems, setBossItems] = useState([]);
  const [selectedBossItem, setSelectedBossItem] = useState(null);
  const [resultMessage, setResultMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scenarioImage, setScenarioImage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [bulletsUsed, setBulletsUsed] = useState(1);
  const COOLDOWN_TIME = 1 * 60 * 1000;
  const bossItemStats = {
    'Presidential Medal': {
      description: "Increases XP gain by 30% and increases assassination success by 40%. You receive 75% of your opponent's money."
    },
    "Dragon's Hoard": {
      description: "Receive 100% of your opponent's money."
    },
    'Mafia Ring': {
      description: 'Increases assassination success rate by 300% but makes you ten times as vulnerable to retaliation.'
    },
    'Invisible Cloak': {
      description: 'Makes you immune to retaliation and allows you to use bullets for free.'
    },
    "Pirate's Compass": {
      description: "Grants 75% of your opponent's money."
    },
    'Golden Spatula': {
      description: 'Increases XP gain by 200%.'
    },
    'Star Dust': {
      description: 'Grants an additional 3000 XP upon a successful assassination.'
    },
    "Sheriff's Badge": {
      description: 'Reduces the target’s chance to retaliate by 50% and increases assassination success rate by 10%.'
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (data.success) {
          setWeapons(data.userData.inventory.filter((item) => item.attributes && item.attributes.accuracy));
          setBossItems(data.userData.bossItems || []);
          setIsAlive(data.userData.isAlive);
        } else {
          setErrorMessage(data.message || 'Failed to fetch user data.');
        }
      } catch (error) {
        setErrorMessage('Server error occurred.');
      }
    };
    fetchUserData();
  }, [setIsAlive]);

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const response = await fetch('/api/users/targets', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setTargets(data.targets);
        } else {
          setErrorMessage('Failed to fetch targets.');
        }
      } catch (error) {
        setErrorMessage('Server error occurred while fetching targets.');
      }
    };
    fetchTargets();
  }, []);

  useEffect(() => {
    const lastAttempt = localStorage.getItem('lastAssassinationAttempt');
    if (lastAttempt) {
      const timeSinceLastAttempt = Date.now() - new Date(lastAttempt).getTime();
      const remainingCooldown = COOLDOWN_TIME - timeSinceLastAttempt;
      if (remainingCooldown > 0) {
        setCooldown(remainingCooldown);
        const interval = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1000) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);
        return () => clearInterval(interval);
      }
    }
  }, []);

  const attemptAssassination = async () => {
    setResultMessage('');
    setErrorMessage('');
    setIsLoading(true);
    if (cooldown > 0) {
      setErrorMessage(`Please wait ${Math.ceil(cooldown / 60000)} minutes before your next attempt.`);
      setIsLoading(false);
      return;
    }
    if (!selectedTarget || !selectedWeapon) {
      setErrorMessage('You must select a target and a weapon.');
      setIsLoading(false);
      return;
    }
    if (bulletsUsed < 1 || bulletsUsed > 1000) {
      setErrorMessage('Bullets used must be between 1 and 1000.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/assassination/attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          targetId: selectedTarget._id,
          weaponName: selectedWeapon.name,
          bossItemName: selectedBossItem?.name || null,
          bulletsUsed: bulletsUsed
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const newMoney = money - data.actualBulletCost + (data.lootMoney || 0);
        updateUserData({ money: newMoney, kills: data.updatedKills });
        setResultMessage(data.message);
        setScenarioImage('/assets/success.png');
        localStorage.setItem('lastAssassinationAttempt', new Date());
        setCooldown(COOLDOWN_TIME);
      } else {
        setErrorMessage(data.message || 'Assassination attempt failed.');
        setScenarioImage('/assets/failure.png');
        if (data.userDied) {
          setIsAlive(false);
        }
      }
    } catch (error) {
      setErrorMessage('Server error occurred during assassination.');
      setScenarioImage('/assets/error.png');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto p-4 text-white min-h-screen bg-gray-900 pt-20 pb-40 mt-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-red-700">Assassination Mission</h1>
      {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
      <h1 className="text-left p-4 text-lg">
        Welcome to the potato underworld, where you can 'tactfully eliminate' other unsuspecting spuds.
      </h1>
      <div className="text-center mb-4">
        <p className="text-xl">
          Your Assassination Count: <span className="font-bold text-green-400">{kills}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-gray-200">Select Target</h2>
          <select
            value={selectedTarget ? selectedTarget._id : ''}
            onChange={(e) => {
              const target = targets.find((t) => t._id === e.target.value);
              setSelectedTarget(target || null);
            }}
            className="border border-gray-600 rounded px-3 py-2 w-full bg-gray-700 text-white"
          >
            <option value="">Choose a target</option>
            {targets.map((target) => (
              <option key={target._id} value={target._id}>
                {target.username}
              </option>
            ))}
          </select>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-gray-200">Select Weapon</h2>
          <div className="flex flex-wrap">
            {weapons.map((weapon, index) => (
              <div
                key={`${weapon.name}-${index}`}
                onClick={() => {
                  if (selectedWeapon && selectedWeapon.name === weapon.name) {
                    setSelectedWeapon(null);
                  } else {
                    setSelectedWeapon(weapon);
                  }
                }}
                className={`border border-gray-600 rounded px-3 py-2 m-1 cursor-pointer ${
                  selectedWeapon && selectedWeapon.name === weapon.name ? 'bg-gray-600' : 'bg-gray-700'
                }`}
              >
                {weapon.name} - Accuracy: {weapon.attributes.accuracy}%
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-gray-200">Select Boss Item (Optional)</h2>
          <div className="flex flex-wrap">
            {bossItems.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                onClick={() => {
                  if (selectedBossItem && selectedBossItem.name === item.name) {
                    setSelectedBossItem(null);
                  } else {
                    setSelectedBossItem(item);
                  }
                }}
                className={`border border-gray-600 rounded px-3 py-2 m-1 cursor-pointer ${
                  selectedBossItem && selectedBossItem.name === item.name ? 'bg-gray-600' : 'bg-gray-700'
                }`}
              >
                {item.name}
              </div>
            ))}
          </div>
          {selectedBossItem && (
            <p className="text-gray-400 mt-2">
              {bossItemStats[selectedBossItem.name]?.description || 'No special stats'}
            </p>
          )}
        </div>
        <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-gray-200">Bullets to Use</h2>
          <input
            type="number"
            value={bulletsUsed}
            onChange={(e) => setBulletsUsed(Number(e.target.value))}
            className="w-full p-2 border border-gray-700 rounded-md bg-gray-700 text-white"
            min="1"
            max="1000"
          />
        </div>
      </div>
      {resultMessage && (
        <p className="text-green-400 text-center text-lg mb-4 p-3 bg-gray-700 rounded-md">
          {resultMessage}
        </p>
      )}
      {scenarioImage && (
        <div className="flex justify-center mb-6">
          <img src={scenarioImage} alt="Assassination Scenario" className="w-1/2 h-auto rounded-md shadow-md" />
        </div>
      )}
      {cooldown > 0 && (
        <p className="text-center text-red-500 mb-4">
          Next attempt available in: {Math.ceil(cooldown / 60000)} minutes
        </p>
      )}
      <div className="flex justify-center">
        <button
          onClick={attemptAssassination}
          disabled={isLoading || cooldown > 0}
          className={`bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out ${
            isLoading || cooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
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
