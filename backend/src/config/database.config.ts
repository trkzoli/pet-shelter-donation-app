// src/config/database.config.ts
// src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'tzadmin1',
  database: process.env.DB_NAME || 'pawner_db',
  synchronize: process.env.NODE_ENV !== 'production',
  autoLoadEntities: true,
  logging: process.env.NODE_ENV === 'development',
});
