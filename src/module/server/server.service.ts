import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ServerService {
  getServer(): string {
    // Use process.cwd() to get the project root, which works in both dev & build
    const filePath = path.join(process.cwd(), 'src', 'templates', 'index.html');

    if (!fs.existsSync(filePath)) {
      throw new Error(`Template file not found at ${filePath}`);
    }

    let html = fs.readFileSync(filePath, 'utf-8');

    // Replace placeholders with environment variables
    html = html
      .replace(/{{APP_NAME}}/g, process.env.APP_NAME || 'Server')
      .replace(/{{APP_DESCRIPTION}}/g, process.env.APP_DESCRIPTION || '');

    return html;
  }
}
