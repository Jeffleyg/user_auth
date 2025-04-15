import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(email: string, password: string, name: string): Promise<Omit<User, 'password'>> {
    try {
      // Verifica se o usuário já existe
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }

      // Cria o hash da senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Cria e salva o usuário
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        name
      });

      const savedUser = await this.userRepository.save(user);
      
      // Remove a senha antes de retornar
      const { password: _, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Reenvia erros conhecidos
      }
      throw new InternalServerErrorException('Falha ao criar usuário');
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'name', 'password'] // Importante incluir password para validação
    });
  }
}