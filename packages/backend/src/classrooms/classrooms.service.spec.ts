import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomsService } from './classrooms.service';

describe('ClassroomsService', () => {
  let service: ClassroomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassroomsService],
    }).compile();

    service = module.get<ClassroomsService>(ClassroomsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
