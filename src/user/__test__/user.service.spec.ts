import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { UserService } from '../user.service';
import * as bcrypt from 'bcryptjs';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: any;

  beforeEach(async () => {
    // Mock do repositório TypeORM
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('deve criar um usuário com sucesso', async () => {
      const mockUser = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash' as any).mockResolvedValue('hashedpassword');

      const result = await service.createUser('test@example.com', 'password123', 'Test User');
      
      expect(result).toEqual({
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', expect.any(String));
    });

    it('deve lançar ConflictException se email já existir', async () => {
      mockUserRepository.findOne.mockResolvedValue({ email: 'test@example.com' });

      await expect(
        service.createUser('test@example.com', 'password123', 'Test User')
      ).rejects.toThrow(ConflictException);
    });

    it('deve lançar InternalServerErrorException em caso de erro desconhecido', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createUser('test@example.com', 'password123', 'Test User')
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findUserByEmail', () => {
    it('deve retornar usuário se encontrado', async () => {
      const mockUser = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findUserByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: ['id', 'email', 'name', 'password'],
      });
    });

    it('deve retornar null se usuário não for encontrado', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findUserByEmail('test@example.com');
      expect(result).toBeNull();
    });
  });
});