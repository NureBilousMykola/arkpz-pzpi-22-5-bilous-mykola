import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";

config(); // Завантаження змінних середовища

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ["dist/**/*.entity{.ts,.js}"],
  migrations: ["dist/database/migrations/*{.ts,.js}"],
  synchronize: false,
  ssl: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
