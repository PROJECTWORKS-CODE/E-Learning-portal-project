import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import profileRoutes from './routes/profile.js';
import courseRoutes from './routes/course.js';
import contentRoute from './routes/content.js';
import userRoutes from './routes/user.routes.js';
import User from './models/user.model.js';
import  authenticate  from './utils/authMiddleware.js';

const app = express();

mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
 .then(() => {
    console.log('MongoDB connected');
  })
 .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Terminate the script with an error code
  });

app.use(cors());
app.use(express.json());

// Authentication middleware should come before other routes
app.use('/api/auth', async (req, res, next) => {
  try {
    await authenticate(req, res, next);
  } catch (err) {
    next(err);
  }
});

app.use('/api/profile', profileRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/user.routes', userRoutes);
app.use('/api/content', contentRoute);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

app.post('/', async (req, res) => {
  const userData = req.body;
  console.log('UserData:', userData);
  const user = new User(userData);
  try {
    await user.save();
    res.send('User created successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating user');
  }
});

app.post('/api/auth', async (req, res) => {
  const userData = req.body;
  const user = new User(userData);
  try {
    await user.save();
    res.send('User created successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating user');
  }
});

app.post('/api/content', async (req, res) => {
  const contentData = req.body;
  console.log('ContentData:', contentData);

  // Check if userId is provided in the request body
  let userId = contentData.userId;
  delete contentData.userId; // Remove userId from contentData

  const content = new Content(contentData);

  if (userId) {
    // Associate content with a user
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }
      content.userId = user._id;
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error finding user');
    }
  }

  try {
    await content.save();
    res.send('Content created successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating content');
  }
});
