import { SessionController } from '@/module/session/session.controller';
import { SessionService } from '@/module/session/session.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('SessionController', () => {
  let controller: SessionController;

  const mockSessionService = {
    // Mock methods as needed
    createSession: jest.fn(),
    getSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
      ],
    }).compile();

    controller = module.get<SessionController>(SessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
