const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

// const contactRoutes = require('./routes/contact');
const contactSaveRoutes = require("./routes/contactRoutes");
const app = express();
app.use(cors());
app.use(express.json());

// app.use('/api/contacts', contactRoutes);
app.use("/api/contact", contactSaveRoutes);

app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.log('DB Error:', err));

app.get('/', (req, res) => {
  res.send('D-SERVICES Backend is Live 🚀');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
