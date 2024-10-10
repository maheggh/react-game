import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const CarRaces = () => {
  const { user } = useContext(AuthContext);
  const [stolenCars, setStolenCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [raceResult, setRaceResult] = useState('');
  const [raceCooldown, setRaceCooldown] = useState(null);
  const [cooldownMessage, setCooldownMessage] = useState('');

  const allCars = [
    { name: 'Luxury Spud Sedan', price: 120000, baseChance: 5, image: '/assets/luxury-spud-sedan.png', type: 'car' },
    { name: 'Sporty Tater Coupe', price: 40000, baseChance: 8, image: '/assets/sporty-tater-coupe.png', type: 'car' },
    { name: 'Potato Convertible', price: 30000, baseChance: 10, image: '/assets/potato-convertible.png', type: 'car' },
    { name: 'SUV Spud', price: 2000, baseChance: 20, image: '/assets/suv-spud.png', type: 'car' },
    // Other car definitions
  ];

  // Fetch stolen cars from the backend
  useEffect(() => {
    const fetchStolenCars = async () => {
      try {
        const response = await fetch('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setStolenCars(data.userData.cars);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchStolenCars();

    const cooldownEnd = parseInt(localStorage.getItem('raceCooldownEnd'), 10);
    if (cooldownEnd) {
      const now = Date.now();
      if (now < cooldownEnd) {
        startCooldown(Math.ceil((cooldownEnd - now) / 1000));
      } else {
        localStorage.removeItem('raceCooldownEnd');
      }
    }
  }, []);

  const calculateSpeed = (car) => {
    return car.price / 1000 + Math.random() * 20; // Speed based on car price with randomness
  };

  const getRandomCarFromAll = () => {
    return allCars[Math.floor(Math.random() * allCars.length)]; // Random opponent car
  };

  const handleRace = () => {
    if (raceCooldown) return;

    const opponentCar = getRandomCarFromAll();
    let resultMessage = '';
    let imageUrl = '';

    const randomScenario = [
      { chance: 0.02, message: "Your car crashed during the race.", image: '/assets/race2.png' },
      { chance: 0.03, message: "Your car suffered a mechanical failure.", image: '/assets/race3.png' },
      { chance: 0.02, message: "Your car was sabotaged by an opponent.", image: '/assets/race4.png' },
      { chance: 0.01, message: "You took a wrong turn and got disqualified.", image: '/assets/race5.png' }
    ].find(scenario => Math.random() < scenario.chance);

    if (randomScenario) {
      removeCarFromGarage(selectedCar.name);
      resultMessage = randomScenario.message;
      imageUrl = randomScenario.image;
    } else {
      const playerSpeed = calculateSpeed(selectedCar);
      const opponentSpeed = calculateSpeed(opponentCar);

      if (playerSpeed > opponentSpeed) {
        const winningCar = getRandomCarFromAll();
        addCarToGarage(winningCar);
        resultMessage = `You won the race and gained a ${winningCar.name}!`;
        imageUrl = '/assets/race6.png';
      } else {
        removeCarFromGarage(selectedCar.name);
        resultMessage = `You lost the race and your ${selectedCar.name}.`;
        imageUrl = '/assets/race8.png';
      }
    }

    setRaceResult({ message: resultMessage, image: imageUrl });
    startCooldown(30);
    setSelectedCar(null); // Reset car selection after race
  };

  const startCooldown = (duration) => {
    setRaceCooldown(true);
    setCooldownMessage(`The cops are on to you, you have to lay low for ${duration} seconds.`);

    const countdownInterval = setInterval(() => {
      duration -= 1;
      setCooldownMessage(`The cops are on to you, you have to lay low for ${duration} seconds.`);

      if (duration <= 0) {
        clearInterval(countdownInterval);
        setRaceCooldown(false);
        setCooldownMessage('');
        localStorage.removeItem('raceCooldownEnd');
      }
    }, 1000);

    localStorage.setItem('raceCooldownEnd', Date.now() + duration * 1000);
  };

  const removeCarFromGarage = async (carName) => {
    const updatedCars = stolenCars.filter(car => car.name !== carName);
    setStolenCars(updatedCars);
    await updateUserCars(updatedCars);
  };

  const addCarToGarage = async (car) => {
    const updatedCars = [...stolenCars, car];
    setStolenCars(updatedCars);
    await updateUserCars(updatedCars);
  };

  const updateUserCars = async (updatedCars) => {
    try {
      await fetch('/api/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ cars: updatedCars }),
      });
    } catch (error) {
      console.error('Error updating user cars:', error);
    }
  };

  return (
    <div className="container mx-auto justify-center grid p-4 my-40">
      <h2 className="text-2xl font-bold mb-4">Car Races</h2>
      <img src="/assets/race7.png" className="p-4" alt="image of potatos racing cars" />
      <p>Unleash your inner maniac on the asphalt and leave your rivals eating dust! Win the race, and their prized car is yours for the taking.</p>
      <br />
      <p>But tread carefully—lose, and you'll be handing over your own ride to the victor. High risk, high reward!</p>
      <br />

      {/* Car Selection */}
      <select
        className="block w-full p-2 border"
        value={selectedCar ? selectedCar.name : ''}
        onChange={(e) =>
          setSelectedCar(stolenCars.find(car => car.name === e.target.value))
        }
      >
        <option value="">Select a car to race</option>
        {stolenCars.map((car, index) => (
          <option key={index} value={car.name}>
            {car.name}
          </option>
        ))}
      </select>

      {/* Race Button */}
      <button
        className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-md"
        onClick={handleRace}
        disabled={!selectedCar || raceCooldown}
      >
        Start Race
      </button>

      {/* Race Result */}
      {raceResult && (
        <div className="mt-4">
          <p>{raceResult.message}</p>
          <img src={raceResult.image} alt="Race outcome" className="h-auto mt-2" />
        </div>
      )}

      {/* Cooldown Message */}
      {cooldownMessage && <p className="mt-4 text-red-500">{cooldownMessage}</p>}
    </div>
  );
};

export default CarRaces;
