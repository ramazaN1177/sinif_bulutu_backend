import mongoose from 'mongoose';
import { env } from '../config/env';

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);

  try {
    const isAtlas = env.MONGODB_URI.startsWith('mongodb+srv://');
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: isAtlas ? 15000 : 3000,
    });
    console.log('✅ MongoDB veritabanına bağlanıldı:', env.MONGODB_URI.replace(/:([^@]+)@/, ':****@'));
  } catch (error) {
    console.warn('⚠️ Belirtilen MongoDB bağlantısı sağlanamadı. In-Memory veritabanı başlatılıyor...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'sinif_bulutu',
        },
      });
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('✅ In-Memory MongoDB hazır ve bağlandı:', uri);
    } catch (memErr) {
      console.error('❌ MongoDB bağlantısı tamamen başarısız oldu:', memErr);
      throw memErr;
    }
  }
}
