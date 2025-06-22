import { Injectable } from '@nestjs/common';
import { CloudflareService as R2Service, FileManager } from 'cloudflare-r2-kit';

@Injectable()
export class CloudflareService {
  private r2Service: R2Service;
  private fileManager: FileManager;

  constructor() {
    this.r2Service = new R2Service({
      bucketName: process.env.R2_BUCKET!,
      endpoint: process.env.R2_ENDPOINT!,
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    });

    this.fileManager = new FileManager(this.r2Service);
  }

  async getUploadUrl(key: string) {
    return this.r2Service.getUploadUrl(key);
  }

  async getDownloadUrl(key: string) {
    return this.r2Service.getDownloadUrl(key);
  }

  async deleteFile(key: string) {
    return this.r2Service.deleteFile(key);
  }

  async createFilesFromPayload(payload: any, fields: string[]) {
    return this.fileManager.createFilesFromPayload(payload, fields);
  }

  async appendFileUrls(payload: unknown, fields: string[]): Promise<unknown> {
    return this.fileManager.appendFileUrls(payload as any, fields);
  }

  async deleteFilesFromPayload(payload: any, fields: string[]) {
    return this.fileManager.deleteFilesFromPayload(payload, fields);
  }
}
