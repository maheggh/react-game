import React from 'react';

const DeadPage = () => {
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-4xl font-bold mb-6">You Are Dead</h1>
      <img src="/assets/dead.png" alt="You Are Dead" className="mb-4 w-2/5 ml-auto mr-auto" />
      <p className="text-xl">Unfortunately, you have been assassinated.</p>
    </div>
  );
};

export default DeadPage;