import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// A simple, local JSON-based database perfect for this assignment
const dbPath = path.join(process.cwd(), 'db.json');

// Initialize with default structure if it doesn't exist
if (!fs.existsSync(dbPath)) {
  const initialData = {
    users: [],
    profiles: [],
    favorites: []
  };
  fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
}

const readDB = () => {
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
};

// Database queries
export const db = {
  // Users
  getUserByEmail: (email) => {
    const data = readDB();
    return data.users.find(u => u.email === email);
  },
  getUserById: (id) => {
    const data = readDB();
    return data.users.find(u => u.id === id);
  },
  createUser: ({ email, passwordHash }) => {
    const data = readDB();
    const newUser = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      hasPaid: false,
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    writeDB(data);
    return newUser;
  },
  
  markUserAsPaid: (userId) => {
    const data = readDB();
    const index = data.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      data.users[index].hasPaid = true;
      writeDB(data);
      return data.users[index];
    }
    return null;
  },
  
  // Profiles
  getProfileByUserId: (userId) => {
    const data = readDB();
    return data.profiles.find(p => p.userId === userId);
  },
  createProfile: (userId, name) => {
    const data = readDB();
    const newProfile = {
      id: crypto.randomUUID(),
      userId,
      name,
      createdAt: new Date().toISOString()
    };
    data.profiles.push(newProfile);
    writeDB(data);
    return newProfile;
  },
  updateProfile: (userId, updates) => {
    const data = readDB();
    const index = data.profiles.findIndex(p => p.userId === userId);
    if (index !== -1) {
      data.profiles[index] = { ...data.profiles[index], ...updates };
      writeDB(data);
      return data.profiles[index];
    }
    return null;
  },

  // Favorites
  getFavoritesByUserId: (userId) => {
    const data = readDB();
    return data.favorites.filter(f => f.userId === userId);
  },
  addFavorite: (userId, symbol, companyName) => {
    const data = readDB();
    // Don't add duplicate
    if (data.favorites.some(f => f.userId === userId && f.symbol === symbol)) {
      return null;
    }
    const newFav = {
      id: crypto.randomUUID(),
      userId,
      symbol,
      companyName,
      addedAt: new Date().toISOString()
    };
    data.favorites.push(newFav);
    writeDB(data);
    return newFav;
  },
  removeFavorite: (userId, symbol) => {
    const data = readDB();
    data.favorites = data.favorites.filter(f => !(f.userId === userId && f.symbol === symbol));
    writeDB(data);
  }
};
