import { AuthConfig } from '@/auth/config/auth-config.type';
import { FileConfig } from '@/files/config/file-config.type';
import { MailConfig } from '@/mail/config/mail-config.type';
import { AppConfig } from './app-config.type';
import { DatabaseConfig } from './database/database-config.type';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  file: FileConfig;
  mail: MailConfig;
  auth: AuthConfig;
};
