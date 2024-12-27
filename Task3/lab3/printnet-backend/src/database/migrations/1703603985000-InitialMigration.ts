import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1703603985000 implements MigrationInterface {
  name = "InitialMigration1703603985000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Створення extension для UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Створення enum типів
    await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM ('client', 'admin')
        `);

    await queryRunner.query(`
            CREATE TYPE "public"."device_status_enum" AS ENUM ('online', 'offline', 'maintenance', 'error')
        `);

    await queryRunner.query(`
            CREATE TYPE "public"."order_status_enum" AS ENUM ('created', 'pending', 'paid', 'printing', 'completed', 'cancelled', 'failed')
        `);

    await queryRunner.query(`
            CREATE TYPE "public"."payment_status_enum" AS ENUM ('pending', 'completed', 'failed')
        `);

    // Створення таблиці користувачів
    await queryRunner.query(`
        CREATE TABLE "users"
        (
            "id"            uuid PRIMARY KEY   DEFAULT uuid_generate_v4(),
            "email"         varchar   NOT NULL UNIQUE,
            "password_hash" varchar   NOT NULL,
            "first_name"    varchar,
            "last_name"     varchar,
            "phone"         varchar,
            "is_active"     boolean   NOT NULL DEFAULT true,
            "created_at"    TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at"    TIMESTAMP NOT NULL DEFAULT now()
        )
    `);

    // Створення таблиці ролей користувачів
    await queryRunner.query(`
        CREATE TABLE "user_roles"
        (
            "id"         uuid PRIMARY KEY                   DEFAULT uuid_generate_v4(),
            "role"       "public"."user_role_enum" NOT NULL,
            "user_id"    uuid REFERENCES "users" ("id") ON DELETE CASCADE,
            "created_at" TIMESTAMP                 NOT NULL DEFAULT now()
        )
    `);

    // Створення таблиці вендингових машин
    await queryRunner.query(`
        CREATE TABLE "vending_machines"
        (
            "id"                   uuid PRIMARY KEY   DEFAULT uuid_generate_v4(),
            "maintenance_required" boolean   NOT NULL DEFAULT false,
            "serial_number"        varchar   NOT NULL UNIQUE,
            "location"             varchar   NOT NULL,
            "is_active"            boolean   NOT NULL DEFAULT true,
            "created_at"           TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at"           TIMESTAMP NOT NULL DEFAULT now()
        )
    `);

    // Створення таблиці статусів пристроїв
    await queryRunner.query(`
        CREATE TABLE "device_statuses"
        (
            "id"         uuid PRIMARY KEY                       DEFAULT uuid_generate_v4(),
            "status"     "public"."device_status_enum" NOT NULL,
            "duration"   integer                       NOT NULL,
            "telemetry"  jsonb                         NOT NULL,
            "created_at" TIMESTAMP                     NOT NULL DEFAULT now(),
            "machine_id" uuid REFERENCES "vending_machines" ("id") ON DELETE CASCADE
        )
    `);

    // Створення таблиці конфігурацій принтерів
    await queryRunner.query(`
        CREATE TABLE "printer_configs"
        (
            "id"            uuid PRIMARY KEY   DEFAULT uuid_generate_v4(),
            "printer_model" varchar   NOT NULL,
            "configuration" jsonb     NOT NULL,
            "updated_at"    TIMESTAMP NOT NULL DEFAULT now(),
            "machine_id"    uuid REFERENCES "vending_machines" ("id") ON DELETE CASCADE
        )
    `);

    // Створення таблиці запитів на обслуговування
    await queryRunner.query(`
        CREATE TABLE "maintenance_requests"
        (
            "id"           uuid PRIMARY KEY   DEFAULT uuid_generate_v4(),
            "request_date" TIMESTAMP NOT NULL,
            "created_at"   TIMESTAMP NOT NULL DEFAULT now(),
            "machine_id"   uuid REFERENCES "vending_machines" ("id") ON DELETE CASCADE
        )
    `);

    // Створення таблиці замовлень
    await queryRunner.query(`
        CREATE TABLE "orders"
        (
            "id"             uuid PRIMARY KEY        DEFAULT uuid_generate_v4(),
            "model_file_url" varchar        NOT NULL,
            "print_settings" jsonb          NOT NULL,
            "cost"           decimal(10, 2) NOT NULL,
            "created_at"     TIMESTAMP      NOT NULL DEFAULT now(),
            "updated_at"     TIMESTAMP      NOT NULL DEFAULT now(),
            "user_id"        uuid           REFERENCES "users" ("id") ON DELETE SET NULL,
            "machine_id"     uuid           REFERENCES "vending_machines" ("id") ON DELETE SET NULL
        )
    `);

    // Створення таблиці статусів замовлень
    await queryRunner.query(`
        CREATE TABLE "order_statuses"
        (
            "id"          uuid PRIMARY KEY                      DEFAULT uuid_generate_v4(),
            "status"      "public"."order_status_enum" NOT NULL,
            "description" text,
            "created_at"  TIMESTAMP                    NOT NULL DEFAULT now(),
            "order_id"    uuid REFERENCES "orders" ("id") ON DELETE CASCADE
        )
    `);

    // Створення таблиці гаманців
    await queryRunner.query(`
        CREATE TABLE "wallets"
        (
            "id"               uuid PRIMARY KEY        DEFAULT uuid_generate_v4(),
            "balance"          decimal(10, 2) NOT NULL DEFAULT 0,
            "last_transaction" TIMESTAMP,
            "created_at"       TIMESTAMP      NOT NULL DEFAULT now(),
            "updated_at"       TIMESTAMP      NOT NULL DEFAULT now(),
            "user_id"          uuid REFERENCES "users" ("id") ON DELETE CASCADE
        )
    `);

    // Створення таблиці платежів
    await queryRunner.query(`
        CREATE TABLE "payments"
        (
            "id"             uuid PRIMARY KEY                        DEFAULT uuid_generate_v4(),
            "payment_method" varchar                        NOT NULL,
            "amount"         decimal(10, 2)                 NOT NULL,
            "status"         "public"."payment_status_enum" NOT NULL,
            "created_at"     TIMESTAMP                      NOT NULL DEFAULT now(),
            "order_id"       uuid                           REFERENCES "orders" ("id") ON DELETE SET NULL,
            "user_id"        uuid                           REFERENCES "users" ("id") ON DELETE SET NULL
        )
    `);

    // Створення індексів
    await queryRunner.query(
      `CREATE INDEX "idx_user_email" ON "users" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_machine_serial" ON "vending_machines" ("serial_number")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_order_created" ON "orders" ("created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payment_status" ON "payments" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Видалення індексів
    await queryRunner.query(`DROP INDEX "idx_payment_status"`);
    await queryRunner.query(`DROP INDEX "idx_order_created"`);
    await queryRunner.query(`DROP INDEX "idx_machine_serial"`);
    await queryRunner.query(`DROP INDEX "idx_user_email"`);

    // Видалення таблиць
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "wallets"`);
    await queryRunner.query(`DROP TABLE "order_statuses"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "maintenance_requests"`);
    await queryRunner.query(`DROP TABLE "printer_configs"`);
    await queryRunner.query(`DROP TABLE "device_statuses"`);
    await queryRunner.query(`DROP TABLE "vending_machines"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Видалення enum типів
    await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."device_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);

    // Видалення extension
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
