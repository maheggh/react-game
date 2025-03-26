// frontend/src/components/Home.jsx

import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Register from '../components/Register';
import Login from '../components/Login';
import UserStatus from '../components/UserStatus';
import styles from './Home.module.css';

const Home = () => {
  const { isLoggedIn } = useContext(AuthContext); 

  return (
    <div className="min-h-screen bg-gray-100 grid bg-gray-200 items-center justify-center p-6 md:p-12">
      {/* Banner Section */}
      <div className="w-full max-w-5xl py-5">
        <img
          src="/assets/potatoqueen_banner.png"
          className={`w-full h-auto object-cover rounded-lg ${styles.potatoQueenImage}`}
          alt="Potato Queen Banner"
        />
      </div>

      {/* Content Grid */}
      <div className={`w-full max-w-5xl bg-white p-8 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-8 ${styles.gameDescriptionContainer}`}>
        {/* Welcome Text */}
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
            Welcome to the Game!
          </h1>
          <p className={`text-lg text-gray-600 ${styles.gameText}`}>
            Enter the world of underground crime, where your ultimate goal is to ascend the throne as the Potato Queen. Strategize your moves, steal valuable items, and build your empire in this thrilling simulation.
          </p>
        </div>

        {/* Illustration/Image */}
        <div className="flex items-center justify-center">
          <img
            src="/assets/potatopleb.png"
            className={`w-30 h-30 md:w-40 md:h-40 object-contain rounded-md shadow-md ${styles.potatoQueenImage}`}
            alt="Potato Pleb"
          />
        </div>

        {/* Authentication Section */}
        <div className="col-span-2">
          {!isLoggedIn ? (
            <div className="flex flex-col space-y-6">
            </div>
          ) : (
            <UserStatus />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
