import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { dataSourceOptions } from "../database/data-source";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  ...dataSourceOptions,
  autoLoadEntities: true,
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: configService.get<string>("NODE_ENV") === "development",
});
