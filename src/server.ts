import app from './app';
import { env } from './config/env';
import { connectDB } from './db/connect';

async function bootstrap() {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`🚀 Sınıf Bulutu Backend sunucusu http://localhost:${env.PORT} üzerinde çalışıyor.`);
    });
  } catch (error) {
    console.error('Sunucu başlatılırken hata oluştu:', error);
    process.exit(1);
  }
}

bootstrap();
