// התצורה לחיבור ל-MongoDB Atlas

import mongoose from 'mongoose';

// URI לחיבור מסד הנתונים (לשנות את הערך בהתאם לנתוני החיבור שלך)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/family-app?retryWrites=true&w=majority';

// מונע אזהרות וגרסאות מיושנות
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// מצב החיבור למסד הנתונים
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// פונקציה ליצירת חיבור למסד הנתונים
async function connectDb() {
  if (cached.conn) {
    console.log('🟢 Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔄 Creating new MongoDB connection...');
    cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
      console.log('✅ MongoDB connected successfully!');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }

  return cached.conn;
}

// יצוא החיבור
export default connectDb; 