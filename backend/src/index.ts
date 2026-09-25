import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 CivicPulse API running on http://localhost:${PORT}`);
});

export default app;

