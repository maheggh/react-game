import React, { useContext } from 'react';
import { AuthContext } from '/context/AuthContext'; // Make sure the path is correct
import Register from '../components/Register';
import Login from '../components/Login';
import UserStatus from '../components/UserStatus';

const Home = () => {
  const { isLoggedIn } = useContext(AuthContext); // Check login status

  return (
    <div className="bg-pink-100 p-6 md:p-12">
      <div className="text-center my-8">
        <img
          src="/assets/potatoqueen_banner.png"
          className="mx-auto w-full h-auto max-w-10xl object-cover"
          alt="Potato Queen Banner"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-md shadow-md">
        <div>
          <h1 className="text-4xl font-bold text-purple-900 mb-4">
            Welcome to the game!
          </h1>
          <p className="text-lg text-gray-700 mb-4">
            Enter the world of underground crime, where your ultimate goal is to
            ascend the throne as the Potato Queen.
          </p>
        </div>

        <div className="flex justify-center">
          <img
            src="/assets/potatopleb.png"
            className="w-48 h-48 md:w-72 md:h-72"
            alt="Potato Pleb"
          />
        </div>

        <div className="col-span-2">
          {!isLoggedIn ? (
            <>
              <Register />
              <Login />
            </>
          ) : (
            <UserStatus />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
