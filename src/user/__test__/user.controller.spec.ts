import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { BadRequestException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: any;

  beforeEach(async () => {
    mockUserService = {
      createUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('register', () => {
    it('deve chamar userService.createUser com os parâmetros corretos', async () => {
      const mockResult = {
        email: 'test@example.com',
        name: 'Test User',
      };

      mockUserService.createUser.mockResolvedValue(mockResult);

      const result = await controller.register(
        'test@example.com',
        'password123',
        'Test User'
      );

      expect(result).toEqual(mockResult);
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'Test User'
      );
    });

    it('deve lançar BadRequestException se email for inválido', async () => {
      await expect(
        controller.register('invalid-email', 'password123', 'Test User')
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se senha for muito curta', async () => {
      await expect(
        controller.register('test@example.com', '123', 'Test User')
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se algum campo estiver faltando', async () => {
      await expect(
        controller.register('', 'password123', 'Test User')
      ).rejects.toThrow(BadRequestException);
    });
  });
});