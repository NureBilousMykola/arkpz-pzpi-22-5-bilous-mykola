import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
  ) {}

  @OnEvent("monitoring.alert")
  async handleMonitoringAlert(payload: any) {
    const admins = await this.getAdminUsers();
    const notification = {
      type: "ALERT",
      title: `Сповіщення системи: ${payload.type}`,
      message: this.getAlertMessage(payload),
      timestamp: new Date(),
    };

    await this.notifyUsers(admins, notification);
  }

  async notifyUsers(users: User[], notification: any) {
    for (const user of users) {
      await Promise.all([
        this.sendEmail(user, notification),
        this.sendPushNotification(user, notification),
      ]);
    }
  }

  private async getAdminUsers(): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.roles", "role")
      .where("role.role = :role", { role: "admin" })
      .getMany();
  }

  private getAlertMessage(payload: any): string {
    const messages = {
      OFFLINE: "Машина втратила з'єднання",
      MAINTENANCE_REQUIRED: "Потрібне технічне обслуговування",
      LOW_MATERIALS: "Низький рівень матеріалів",
      ERROR: "Виникла помилка в роботі машини",
    };

    return messages[payload.type] || "Невідома помилка";
  }

  private async sendEmail(user: User, notification: any) {
    // Реалізація відправки email
    console.log(`Sending email to ${user.email}:`, notification);
  }

  private async sendPushNotification(user: User, notification: any) {
    // Реалізація відправки push-сповіщення
    console.log(`Sending push notification to user ${user.id}:`, notification);
  }
}
