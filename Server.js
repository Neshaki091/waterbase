const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./src/configs/db.config');
const authRoutes = require('./src/routes/auth.route');
const userRoutes = require('./src/routes/user.route');
const fileRoutes = require('./src/routes/file.route');
const appRoutes = require('./src/routes/app.route');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/manager', fileRoutes);
app.use('/apps', appRoutes);
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

