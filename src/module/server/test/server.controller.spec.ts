import { Test, TestingModule } from '@nestjs/testing';
import { ServerController } from '@/module/server/server.controller';
import { ServerModule } from '@/module/server/server.module';

describe('ServerController', () => {
  let controller: ServerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ServerModule],
      controllers: [ServerController],
    }).compile();

    controller = module.get<ServerController>(ServerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
