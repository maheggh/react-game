// CarRaces.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const CarRaces = () => {
  const { user } = useContext(AuthContext);
  const [stolenCars, setStolenCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [raceResult, setRaceResult] = useState(null);
  const [raceCooldown, setRaceCooldown] = useState(false);
  const [cooldownMessage, setCooldownMessage] = useState('');

  // All cars available in the game
  const allCars = [
    { name: 'Luxury Spud Sedan', price: 120000, baseChance: 5, image: '/assets/luxury-spud-sedan.png', type: 'car' },
    { name: 'Sporty Tater Coupe', price: 40000, baseChance: 8, image: '/assets/sporty-tater-coupe.png', type: 'car' },
    { name: 'Potato Convertible', price: 30000, baseChance: 10, image: '/assets/potato-convertible.png', type: 'car' },
    { name: 'SUV Spud', price: 2000, baseChance: 20, image: '/assets/suv-spud.png', type: 'car' },
    { name: 'Hatchback Tuber', price: 1500, baseChance: 20, image: '/assets/hatchback-tuber.png', type: 'car' },
    { name: 'Sedan Yam', price: 20000, baseChance: 10, image: '/assets/sedan-yam.png', type: 'car' },
    { name: 'SUV Tater', price: 25000, baseChance: 8, image: '/assets/suv-tater.png', type: 'car' },
    { name: 'Spudnik Sports', price: 90000, baseChance: 4, image: '/assets/spudnik-sports.png', type: 'car' },
    { name: 'Compact Fry', price: 10000, baseChance: 25, image: '/assets/compact-fry.png', type: 'car' },
    { name: 'Curly Coupe', price: 15000, baseChance: 20, image: '/assets/curly-coupe.png', type: 'car' },
    { name: 'Wedge Wagon', price: 20000, baseChance: 15, image: '/assets/wedge-wagon.png', type: 'car' },
    { name: 'Crispy Convertible', price: 110000, baseChance: 5, image: '/assets/crispy-convertible.png', type: 'car' },
    { name: 'Mashed Mini', price: 500, baseChance: 30, image: '/assets/mashed-mini.png', type: 'car' },
    { name: 'Buttery Buggy', price: 8000, baseChance: 20, image: '/assets/buttery-buggy.png', type: 'car' },
    { name: 'Gravy Sedan', price: 12000, baseChance: 15, image: '/assets/gravy-sedan.png', type: 'car' },
    { name: 'Peeler Pickup', price: 18000, baseChance: 5, image: '/assets/peeler-pickup.png', type: 'car' },
    { name: 'Root Roadster', price: 7000, baseChance: 30, image: '/assets/root-roadster.png', type: 'car' },
    { name: 'Bulb Buggy', price: 10000, baseChance: 25, image: '/assets/bulb-buggy.png', type: 'car' },
    { name: 'Starch Sedan', price: 15000, baseChance: 15, image: '/assets/starch-sedan.png', type: 'car' },
    { name: 'Tuber Truck', price: 60000, baseChance: 5, image: '/assets/tuber-truck.png', type: 'car' },
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
          setStolenCars(data.userData.cars || []);
        } else {
          console.error('Failed to fetch user data:', data.message);
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

    if (!selectedCar) {
      alert('Please select a car to race.');
      return;
    }

    const opponentCar = getRandomCarFromAll();
    let resultMessage = '';
    let imageUrl = '';

    const randomScenario = [
      { chance: 0.02, message: "Your car crashed during the race.", image: '/assets/race2.png' },
      { chance: 0.03, message: "Your car suffered a mechanical failure.", image: '/assets/race3.png' },
      { chance: 0.02, message: "Your car was sabotaged by an opponent.", image: '/assets/race4.png' },
      { chance: 0.01, message: "You took a wrong turn and got disqualified.", image: '/assets/race5.png' },
    ].find((scenario) => Math.random() < scenario.chance);

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
    setCooldownMessage(`The cops are on to you; you have to lay low for ${duration} seconds.`);

    const countdownInterval = setInterval(() => {
      duration -= 1;
      setCooldownMessage(`The cops are on to you; you have to lay low for ${duration} seconds.`);

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
    try {
      const response = await fetch('/api/carraces/removeCar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ carName }),
      });
      const data = await response.json();
      if (response.ok) {
        setStolenCars(data.cars);
      } else {
        console.error('Failed to remove car:', data.message);
      }
    } catch (error) {
      console.error('Error removing car from garage:', error);
    }
  };

  const addCarToGarage = async (car) => {
    try {
      const response = await fetch('/api/carraces/addCar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ car }),
      });
      const data = await response.json();
      if (response.ok) {
        setStolenCars(data.cars);
      } else {
        console.error('Failed to add car:', data.message);
      }
    } catch (error) {
      console.error('Error adding car to garage:', error);
    }
  };

  return (
    <div className="container mx-auto justify-center grid p-4 my-20">
      <h2 className="text-2xl font-bold mb-4">Car Races</h2>
      <img src="/assets/race7.png" className="p-4" alt="Potatoes racing cars" />
      <p>
        Unleash your inner maniac on the asphalt and leave your rivals eating dust! Win the race, and their prized car is yours for the taking.
      </p>
      <br />
      <p>
        But tread carefully—lose, and you'll be handing over your own ride to the victor. High risk, high reward!
      </p>
      <br />

      {/* Car Selection */}
      <select
        className="block w-full p-2 border"
        value={selectedCar ? selectedCar.name : ''}
        onChange={(e) =>
          setSelectedCar(stolenCars.find((car) => car.name === e.target.value))
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
      {cooldownMessage && (
        <p className="mt-4 text-red-500">{cooldownMessage}</p>
      )}
    </div>
  );
};

export default CarRaces;
