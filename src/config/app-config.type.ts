export type AppConfig = {
  nodeEnv: string;
  name: string;
  description: string;
  version: string;
  workingDirectory: string;
  frontendDomain?: string;
  backendDomain: string;
  port: number;
  apiPrefix: string;
};
