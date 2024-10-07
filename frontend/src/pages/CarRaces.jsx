import React, { useState, useEffect } from 'react';

const CarRaces = () => {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [raceResult, setRaceResult] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);

  useEffect(() => {
    // Fetch car data from backend API
    const fetchCars = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/cars');
        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error('Error fetching car data:', error);
      }
    };
    fetchCars();
  }, []);

  const startRace = () => {
    if (!selectedCar) {
      setRaceResult('Please select a car.');
      return;
    }

    setCountdown(30);
    setIsCooldown(true);

    const raceOutcome = Math.random() > 0.5 ? 'win' : 'lose';
    if (raceOutcome === 'win') {
      setRaceResult(`You won the race with ${selectedCar.name}!`);
    } else {
      setRaceResult(`You lost the race with ${selectedCar.name}.`);
    }

    setTimeout(() => {
      setIsCooldown(false);
      setRaceResult('');
    }, 30000);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Car Races</h1>
      <div className="mb-4">
        <label htmlFor="car-selection" className="block text-lg font-semibold mb-2">
          Select a car for the race:
        </label>
        <select
          id="car-selection"
          className="w-full p-2 border border-gray-300 rounded-md"
          onChange={(e) => setSelectedCar(cars.find(car => car.name === e.target.value))}
        >
          <option value="">Select a car...</option>
          {cars.map((car) => (
            <option key={car.name} value={car.name}>
              {car.name} - ${car.price}
            </option>
          ))}
        </select>
      </div>

      <button
        className={`w-full p-2 bg-blue-600 text-white rounded-md ${isCooldown ? 'opacity-50' : ''}`}
        onClick={startRace}
        disabled={isCooldown}
      >
        {isCooldown ? `Race in progress... ${countdown}s left` : 'Start Race'}
      </button>

      <div className="mt-4 text-lg">
        {raceResult && (
          <div className="bg-gray-100 p-4 rounded-md shadow-md">
            {raceResult}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarRaces;
