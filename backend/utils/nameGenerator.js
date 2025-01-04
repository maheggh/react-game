// utils/nameGenerator.js
const adjectives = [
  'Mashed', 'Crispy', 'Baked', 'Russet', 'Sweet', 'Tater', 'Spudly', 'Lumpy', 'Fryin\'', 'Cheesy', 'Buttery',
  'Gravy-Lovin\'', 'Golden', 'Hashbrown', 'Greasy', 'Peelin\'', 'Sour Creamed', 'Potato Skinned', 'Starchy',
  'Curly', 'Chippy', 'Smashed', 'Fluffy', 'Hot Potato', 'Dirt-Dusted', 'Spudacious', 'Chub', 'Tot-Tossin\'',
  'Double-Fried', 'Boiled', 'Burnt', 'Garlic-Infused', 'Loaded', 'Salty', 'Spud-Tacular', 'Crunchy', 'Overcooked',
  'Smothered', 'Saucy', 'Deep-Fried', 'Whipped', 'Carb-Loaded', 'Muddy', 'Salt-Shaker', 'Couch-Potato', 'Rooted',
  'Potato-Tornado', 'Griddle', 'Spuddy-Duddy', 'Golden-Gravy', 'Twice-Baked', 'Fried-to-Crisp', 'Fork-Tender'
];

const firstNames = [
  'Chip', 'Fry', 'Tater', 'Rus', 'Yukon', 'Mash', 'Crispy Joe', 'Spuddy', 'Hash', 'Tubby', 'Wedge', 
  'Curly', 'Gravy', 'Peel', 'Roast', 'Tot', 'Chipper', 'Butterball', 'Spudwick', 'Crinkle', 'Fritter', 
  'Scallop', 'Waffle', 'Gratin', 'Chowder', 'Croquette', 'Rus-Ty', 'Tato', 'Mr. Spud', 'Waxy', 'Frenchy', 
  'Au Gratin', 'Mister Tot', 'Bub', 'Grill', 'Tuber', 'Tuber Jack', 'Fritter-Tot', 'Banger', 'Homefry', 
  'Mister Peel', 'Smash', 'Gravy Joe', 'Kettle', 'Skinny Fry', 'Shoestring', 'Alfredo', 'Gravy Pete', 'Chunky'
];

const lastNames = [
  'Montana', 'Corleone', 'Capone', 'Gambino', 'Luciano', 'Gotti', 'Lombardi', 'Moretti', 'Falcone', 'Santini',
  'Totolino', 'Taterelli', 'Spudetti', 'Mashino', 'Hasholini', 'Friesetti', 'Gravyardo', 'Fritterini', 'Pommefry', 
  'Russetini', 'Fryson', 'Spuddington', 'Gravinski', 'Boilino', 'Croquetti', 'Scallopini', 'Taterino', 'Sourcreami',
  'Crispo', 'Hashberg', 'Chowderelli', 'Chipolini', 'Tornado', 'Frittero', 'AuGratinelli', 'Waffleton', 'Roastini', 
  'Tuberoni', 'Carbotti', 'Crinkleo', 'Potatovich', 'Totlini', 'Muddoni', 'Frito', 'Hashby', 'Chippyton', 'Chowderson'
];


// Function to generate random gangster name
const generateRandomGangsterName = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${adjective} ${firstName} ${lastName}`;
};

function generateRandomPassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 9; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

module.exports = { generateRandomGangsterName, generateRandomPassword };
