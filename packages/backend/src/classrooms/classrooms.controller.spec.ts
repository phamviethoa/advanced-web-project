import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomsController } from './classrooms.controller';
import { ClassroomsService } from './classrooms.service';

describe('ClassroomsController', () => {
  let controller: ClassroomsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassroomsController],
      providers: [ClassroomsService],
    }).compile();

    controller = module.get<ClassroomsController>(ClassroomsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
