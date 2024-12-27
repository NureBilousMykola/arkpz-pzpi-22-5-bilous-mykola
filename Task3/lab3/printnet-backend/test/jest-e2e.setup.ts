import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { getTypeOrmConfig } from "../src/config/typeorm.config";

global.beforeAll(async () => {
  // Завантаження змінних середовища для тестів
  process.env.NODE_ENV = "test";
  process.env.DB_HOST = "localhost";
  process.env.DB_PORT = "5432";
  process.env.DB_USERNAME = "postgres";
  process.env.DB_PASSWORD = "postgres";
  process.env.DB_DATABASE = "printnet_test";
  process.env.JWT_SECRET = "test_secret";
});

global.beforeEach(async () => {
  // Очищення бази даних перед кожним тестом
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
      }),
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: getTypeOrmConfig,
      }),
    ],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  // Отримання з'єднання з базою даних
  const connection = app.get("TypeOrmModuleConnectionToken");

  // Очищення всіх таблиць
  const entities = connection.entityMetadatas;
  for (const entity of entities) {
    const repository = connection.getRepository(entity.name);
    await repository.query(`TRUNCATE ${entity.tableName} CASCADE;`);
  }

  await app.close();
});

global.afterAll(async () => {
  // Додаткове очищення після всіх тестів
});
