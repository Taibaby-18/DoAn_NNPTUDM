require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('./models/Role');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    const roles = ['Admin', 'Publisher', 'Gamer'];
    for (const name of roles) {
      const existing = await Role.findOne({ name });
      if (!existing) {
        await Role.create({ name });
        console.log(`Created role: ${name}`);
      }
    }

    mongoose.connection.close();
    console.log('Seeding complete');
  })
  .catch(err => console.error(err));

