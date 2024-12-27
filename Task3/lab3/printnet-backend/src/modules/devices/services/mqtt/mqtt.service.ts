import { Injectable, OnModuleInit } from "@nestjs/common";
import { connect, MqttClient } from "mqtt";
import { ConfigService } from "@nestjs/config";
import { VendingMachinesService } from "../vending-machines.service";
import { DeviceStatusEnum } from "../../entities/device-status.entity";

@Injectable()
export class MqttService implements OnModuleInit {
  private client: MqttClient;

  constructor(
    private configService: ConfigService,
    private vendingMachinesService: VendingMachinesService,
  ) {}

  onModuleInit() {
    this.client = connect(this.configService.get<string>("MQTT_URL"));

    this.client.on("connect", () => {
      console.log("Connected to MQTT broker");
      this.client.subscribe("devices/+/status");
      this.client.subscribe("devices/+/telemetry");
    });

    this.client.on("message", (topic, message) => {
      this.handleMessage(topic, message);
    });
  }

  private async handleMessage(topic: string, message: Buffer) {
    try {
      const [, deviceId, type] = topic.split("/");
      const data = JSON.parse(message.toString());

      switch (type) {
        case "status":
          await this.handleStatusUpdate(deviceId, data);
          break;
        case "telemetry":
          await this.handleTelemetryUpdate(deviceId, data);
          break;
      }
    } catch (error) {
      console.error("Error handling MQTT message:", error);
    }
  }

  private async handleStatusUpdate(deviceId: string, data: any) {
    await this.vendingMachinesService.updateStatus(
      deviceId,
      data.status as DeviceStatusEnum,
      data.telemetry,
    );
  }

  private async handleTelemetryUpdate(deviceId: string, data: any) {
    // Оновлення телеметрії пристрою
    await this.vendingMachinesService.updateTelemetry(deviceId, data);
  }

  // Метод для відправки конфігурації на пристрій
  async sendConfig(deviceId: string, config: any) {
    this.client.publish(`devices/${deviceId}/config`, JSON.stringify(config));
  }

  // Метод для відправки команди на пристрій
  async sendCommand(deviceId: string, command: string, payload: any = {}) {
    this.client.publish(
      `devices/${deviceId}/command/${command}`,
      JSON.stringify(payload),
    );
  }

  // Метод для керування електронним замком
  async controlLock(deviceId: string, action: "lock" | "unlock") {
    await this.sendCommand(deviceId, "lock", { action });
  }
}
