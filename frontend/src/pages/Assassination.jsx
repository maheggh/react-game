import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AssassinationPage = () => {
  const { user, money, updateUserData, isAlive, kills } = useContext(AuthContext);

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

  const COOLDOWN_TIME = 60 * 1000;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        if (data.success) {
          setWeapons(data.userData.inventory.filter(item => item.attributes?.accuracy));
          setBossItems(data.userData.bossItems || []);
        } else {
          setErrorMessage(data.message || 'Failed to fetch user data.');
        }
      } catch {
        setErrorMessage('Server error occurred.');
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const response = await fetch('/api/users/targets', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setTargets(data.targets);
          if (data.targets.length === 0) {
            setErrorMessage('No valid targets are currently available.');
          }
        } else {
          setErrorMessage(data.message || 'Failed to fetch targets.');
        }
      } catch {
        setErrorMessage('Server error occurred while fetching targets.');
      }
    };
    fetchTargets();
  }, []);

  useEffect(() => {
    const lastAttempt = localStorage.getItem('lastAssassinationAttempt');
    if (lastAttempt) {
      const remainingCooldown = COOLDOWN_TIME - (Date.now() - new Date(lastAttempt).getTime());
      if (remainingCooldown > 0) {
        setCooldown(remainingCooldown);
        const interval = setInterval(() => {
          setCooldown(prev => (prev <= 1000 ? clearInterval(interval) || 0 : prev - 1000));
        }, 1000);
        return () => clearInterval(interval);
      }
    }
  }, []);

  const attemptAssassination = async () => {
    setResultMessage('');
    setErrorMessage('');
    setIsLoading(true);

    if (targets.length === 0) {
      setErrorMessage('No targets available.');
      setIsLoading(false);
      return;
    }

    if (!selectedTarget || !selectedWeapon) {
      setErrorMessage('You must select a target and a weapon.');
      setIsLoading(false);
      return;
    }

    if (bulletsUsed < 1 || bulletsUsed > 1000) {
      setErrorMessage('Bullets must be between 1 and 1000.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/assassination/attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          targetId: selectedTarget._id,
          weaponName: selectedWeapon.name,
          bossItemName: selectedBossItem?.name || null,
          bulletsUsed,
        }),
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
      }
    } catch {
      setErrorMessage('Server error occurred during assassination.');
      setScenarioImage('/assets/error.png');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto p-6 text-white min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 pt-20 pb-40 mt-8 font-mono">
      <h1 className="text-5xl font-black mb-10 text-center text-red-500 drop-shadow-lg">Assassination Mission</h1>

      {errorMessage && <p className="text-red-400 text-center mb-4 bg-red-900 p-3 rounded-lg shadow-md">{errorMessage}</p>}
      {resultMessage && <p className="text-green-400 text-center mb-6 bg-green-900 p-3 rounded-lg shadow-md">{resultMessage}</p>}

      <div className="text-center mb-6">
        <p className="text-2xl">Kills: <span className="font-extrabold text-green-300">{kills}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-5 bg-gray-800 rounded-xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-3">Select Target</h2>
          <select
            value={selectedTarget?._id || ''}
            onChange={e => setSelectedTarget(targets.find(t => t._id === e.target.value))}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3"
          >
            <option value="">Choose a target</option>
            {targets.map(target => (
              <option key={target._id} value={target._id}>{target.username}</option>
            ))}
          </select>
        </div>

        <div className="p-5 bg-gray-800 rounded-xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-3">Select Weapon</h2>
          <div className="flex flex-wrap gap-2">
            {weapons.map((weapon, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedWeapon(selectedWeapon?.name === weapon.name ? null : weapon)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  selectedWeapon?.name === weapon.name ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'
                }`}
              >
                {weapon.name} ({weapon.attributes.accuracy}%)
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 bg-gray-800 rounded-xl shadow-xl mb-6">
        <h2 className="text-2xl font-semibold mb-3">Bullets to Use</h2>
        <input
          type="number"
          value={bulletsUsed}
          onChange={e => setBulletsUsed(Number(e.target.value))}
          className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
          min="1"
          max="1000"
        />
      </div>

      {scenarioImage && (
        <div className="flex justify-center mb-6">
          <img src={scenarioImage} alt="Scenario" className="w-full max-w-lg rounded-2xl shadow-2xl border-4 border-gray-700" />
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={attemptAssassination}
          disabled={isLoading || cooldown > 0}
          className={`text-lg px-6 py-3 rounded-full font-bold transition-all ${
            isLoading || cooldown > 0
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
          }`}
        >
          {isLoading ? 'Calculating...' : 'Assassinate Target'}
        </button>
      </div>

      {cooldown > 0 && (
        <div className="text-center mt-6 text-yellow-400">
          Please wait {Math.ceil(cooldown / 1000)} seconds before trying again.
        </div>
      )}
    </div>
  );
};

export default AssassinationPage;