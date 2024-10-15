import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const BossesPage = () => {
  const { user } = useContext(AuthContext);
  const [money, setMoney] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [selectedWeapon, setSelectedWeapon] = useState('');
  const [bulletsUsed, setBulletsUsed] = useState(1);
  const [bossImage, setBossImage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');

  // Define the bosses and their loot
  const bosses = {
    'Potato President': {
      name: 'Presidential Medal',
      image: '/assets/potato-president.png',
      loot: { name: 'Presidential Medal', image: '/assets/presidential-medal.png' },
    },
    'Potato Dragon': {
      name: "Dragon's Hoard",
      image: '/assets/potato-dragon.png',
      loot: { name: "Dragon's Hoard", image: '/assets/dragon-hoard.png' },
    },
    'Potato Don': {
      name: 'Mafia Ring',
      image: '/assets/potato-boss.png',
      loot: { name: 'Mafia Ring', image: '/assets/mafia-fortune.png' },
    },
    'Spud Spy': {
      name: 'Invisible Cloak',
      image: '/assets/spud-spy.png',
      loot: { name: 'Invisible Cloak', image: '/assets/invisible-cloak.png' },
    },
    'Potato Pirate': {
      name: "Pirate's Compass",
      image: '/assets/potato-pirate.png',
      loot: { name: "Pirate's Compass", image: '/assets/pirate-compass.png' },
    },
    'Gourmet Chef Tater': {
      name: 'Golden Spatula',
      image: '/assets/gourmet-chef.png',
      loot: { name: 'Golden Spatula', image: '/assets/golden-spatula.png' },
    },
    'Astronaut Spudnik': {
      name: 'Star Dust',
      image: '/assets/potato-astronaut.png',
      loot: { name: 'Star Dust', image: '/assets/star-dust.png' },
    },
    'Sheriff Tater': {
      name: "Sheriff's Badge",
      image: '/assets/sheriff-tater.png',
      loot: { name: "Sheriff's Badge", image: '/assets/sheriffs-badge.png' },
    },
  };

  const bossItemNames = Object.values(bosses).map((boss) => boss.loot.name);

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
          setInventory(data.userData.inventory || []);
          setMoney(data.userData.money || 0);
        } else {
          setFailureMessage(data.message || 'Failed to fetch user data.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setFailureMessage('Server error occurred.');
      }
    };
    fetchUserData();
  }, []);

  // Handle boss selection and display boss image
  const handleSelectBoss = (e) => {
    const boss = e.target.value;
    setSelectedTarget(boss);
    setBossImage(bosses[boss]?.image || '');
  };

  // Handle weapon selection
  const handleSelectWeapon = (e) => {
    setSelectedWeapon(e.target.value);
  };

  const calculateSuccessChance = (weaponAccuracy, bulletsUsed, targetChance) => {
    return Math.min(1, (weaponAccuracy * bulletsUsed) / 100 / targetChance);
  };

  const getTargetChance = (targetName) => {
    const chances = {
      'Potato President': 500,
      'Potato Dragon': 1000,
      'Potato Don': 700,
      'Spud Spy': 700,
      'Potato Pirate': 100,
      'Gourmet Chef Tater': 50,
      'Astronaut Spudnik': 200,
      'Sheriff Tater': 900,
    };
    return chances[targetName] || 5000;
  };

  const attemptBossFight = async () => {
    setSuccessMessage('');
    setFailureMessage('');

    const selectedWeaponItem = inventory.find((item) => item.name === selectedWeapon);

    if (!selectedWeaponItem || !selectedWeaponItem.attributes.accuracy) {
      setFailureMessage("You don't have a valid weapon selected.");
      return;
    }

    if (!selectedTarget) {
      setFailureMessage('You have not selected a boss.');
      return;
    }

    const bulletsCost = bulletsUsed * 100; // Adjust the cost per bullet if needed
    if (money < bulletsCost) {
      setFailureMessage('You do not have enough money to execute the assassination.');
      return;
    }

    const targetChance = getTargetChance(selectedTarget);
    const successChance = calculateSuccessChance(
      selectedWeaponItem.attributes.accuracy,
      bulletsUsed,
      targetChance
    );

    // Deduct the cost of bullets from money
    const updatedMoney = money - bulletsCost;

    // Update money in the backend
    await updateUserMoney(updatedMoney);

    if (Math.random() < successChance) {
      const loot = bosses[selectedTarget].loot;

      // Add loot to inventory
      const updatedInventory = [...inventory];
      const existingLoot = updatedInventory.find((item) => item.name === loot.name);

      if (existingLoot) {
        existingLoot.quantity += 1;
      } else {
        updatedInventory.push({
          name: loot.name,
          quantity: 1,
          price: 0, // Set appropriate price if needed
          attributes: {}, // Add any attributes if necessary
          image: loot.image,
        });
      }

      setInventory(updatedInventory);

      // Update inventory in backend
      await updateUserInventory(updatedInventory);

      setSuccessMessage(`You defeated ${selectedTarget} and earned ${loot.name}!`);
    } else {
      setFailureMessage(`The fight with ${selectedTarget} failed or the target escaped.`);
    }
  };

  const updateUserMoney = async (updatedMoney) => {
    try {
      const response = await fetch('/api/users/updateMoney', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ money: updatedMoney }),
      });
  
      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }
  
      const data = await response.json();
      setMoney(data.money);
    } catch (error) {
      setFailureMessage('Server error occurred while updating money.');
      console.error('Error:', error);
    }
  };

  const updateUserInventory = async (updatedInventory) => {
    try {
      const response = await fetch('/api/inventory/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ inventory: updatedInventory }),
      });
      if (!response.ok) {
        const data = await response.json();
        setFailureMessage(data.message || 'Failed to update inventory.');
      }
    } catch (error) {
      setFailureMessage('Server error occurred while updating inventory.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Boss Fights</h1>

      {/* Display User's Money */}
      <div className="mb-6 text-xl">
        <p>
          Money: <span className="font-bold text-green-600">${money}</span>
        </p>
      </div>

      {/* Boss selection */}
      <div className="mb-6">
        <label htmlFor="targets" className="block text-xl font-bold mb-2">
          Choose a Boss:
        </label>
        <select id="targets" className="w-full p-2 border rounded-md" onChange={handleSelectBoss}>
          <option value="">Select a Boss</option>
          {Object.keys(bosses).map((boss) => (
            <option key={boss} value={boss}>
              {boss}
            </option>
          ))}
        </select>
        {bossImage && (
          <img src={bossImage} alt="Boss" className="w-64 h-64 my-4 mx-auto object-contain" />
        )}
      </div>

      {/* Weapon selection */}
      <div className="mb-6">
        <label htmlFor="weapon-dropdown" className="block text-xl font-bold mb-2">
          Select a Weapon:
        </label>
        <select
          id="weapon-dropdown"
          className="w-full p-2 border rounded-md"
          onChange={handleSelectWeapon}
        >
          <option value="">Please select a weapon</option>
          {inventory
            .filter((item) => item.attributes && item.attributes.accuracy)
            .map((weapon, index) => (
              <option key={index} value={weapon.name}>
                {weapon.name} - Accuracy: {weapon.attributes.accuracy}%
              </option>
            ))}
        </select>
      </div>

      {/* Bullet input */}
      <div className="mb-6">
        <label htmlFor="bullets" className="block text-xl font-bold mb-2">
          Bullets to use:
        </label>
        <input
          type="number"
          id="bullets"
          name="bullets"
          min="1"
          max="10000"
          value={bulletsUsed}
          onChange={(e) => setBulletsUsed(Number(e.target.value))}
          className="w-full p-2 border rounded-md"
        />
      </div>

      {/* Execute button */}
      <button
        onClick={attemptBossFight}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Execute
      </button>

      {/* Success / Failure Messages */}
      {successMessage && <div className="text-green-500 mt-4">{successMessage}</div>}
      {failureMessage && <div className="text-red-500 mt-4">{failureMessage}</div>}

      {/* Display Boss Items */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Boss Items</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-40">
          {inventory.filter((item) => bossItemNames.includes(item.name)).length > 0 ? (
            inventory
              .filter((item) => bossItemNames.includes(item.name))
              .map((item, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md text-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-contain mx-auto mb-2"
                  />
                  <p className="font-semibold">{item.name}</p>
                </div>
              ))
          ) : (
            <p>No boss items in your inventory.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BossesPage;
