import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { UserRole, UserRoleEnum } from "../entities/user-role.entity";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
  ) {}

  async create(createDto: CreateUserDto): Promise<User> {
    // Перевірка на унікальність email
    const existingUser = await this.usersRepository.findOne({
      where: { email: createDto.email },
    });

    if (existingUser) {
      throw new ConflictException("Користувач з таким email вже існує");
    }

    // Хешування пароля
    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    const user = this.usersRepository.create({
      ...createDto,
      password_hash: hashedPassword,
      is_active: true,
    });

    await this.usersRepository.save(user);

    // Створення ролі користувача
    await this.assignRole(user.id, UserRoleEnum.CLIENT);

    return this.findOne(user.id);
  }

  async update(id: string, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Перевірка унікальності email при зміні
    if (updateDto.email && updateDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateDto.email },
      });

      if (existingUser) {
        throw new ConflictException("Користувач з таким email вже існує");
      }
    }

    // Оновлення пароля якщо він наданий
    if (updateDto.password) {
      updateDto.password_hash = await bcrypt.hash(updateDto.password, 10);
      delete updateDto.password;
    }

    Object.assign(user, updateDto);
    await this.usersRepository.save(user);

    return this.findOne(id);
  }

  async deactivate(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.is_active = false;
    await this.usersRepository.save(user);
  }

  async activate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.is_active = true;
    return await this.usersRepository.save(user);
  }

  async assignRole(userId: string, role: UserRoleEnum): Promise<void> {
    const user = await this.findOne(userId);

    const existingRole = await this.userRolesRepository.findOne({
      where: { user: { id: userId }, role },
    });

    if (!existingRole) {
      const userRole = this.userRolesRepository.create({
        user,
        role,
      });
      await this.userRolesRepository.save(userRole);
    }
  }

  async removeRole(userId: string, role: UserRoleEnum): Promise<void> {
    const userRole = await this.userRolesRepository.findOne({
      where: { user: { id: userId }, role },
    });

    if (userRole) {
      await this.userRolesRepository.remove(userRole);
    }
  }

  async findAll(filters?: any): Promise<User[]> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.roles", "roles")
      .leftJoinAndSelect("user.orders", "orders")
      .leftJoinAndSelect("user.wallets", "wallets");

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere("user.is_active = :isActive", {
        isActive: filters.isActive,
      });
    }

    if (filters?.role) {
      queryBuilder.andWhere("roles.role = :role", { role: filters.role });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        "(user.email LIKE :search OR user.first_name LIKE :search OR user.last_name LIKE :search)",
        { search: `%${filters.search}%` },
      );
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["roles", "orders", "wallets"],
    });

    if (!user) {
      throw new NotFoundException(`Користувача з ID "${id}" не знайдено`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ["roles"],
    });

    if (!user) {
      throw new NotFoundException(`Користувача з email "${email}" не знайдено`);
    }

    return user;
  }

  async getUserStatistics(userId: string) {
    const user = await this.findOne(userId);

    return {
      userId: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.role),
      totalOrders: user.orders?.length || 0,
      activeWallets: user.wallets?.filter((w) => w.balance > 0).length || 0,
      registrationDate: user.created_at,
      lastActivity: user.updated_at,
      isActive: user.is_active,
    };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findOne(userId);

    // Перевірка старого пароля
    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException("Неправильний поточний пароль");
    }

    // Оновлення пароля
    user.password_hash = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);
  }
}
