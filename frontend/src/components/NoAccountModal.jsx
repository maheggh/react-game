import React from 'react';
import { Link } from 'react-router-dom';

const NoAccountModal = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-4">Account Required</h2>
      <p className="mb-6">You must create an account before accessing this feature.</p>
      <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Go to Registration
      </Link>
    </div>
  </div>
);

export default NoAccountModal;
