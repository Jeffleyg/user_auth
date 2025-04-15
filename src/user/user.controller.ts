import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('name') name: string,
  ) {
    // Validação básica dos campos
    if (!email || !password || !name) {
      throw new BadRequestException('Todos os campos (email, password, name) são obrigatórios');
    }

    // Validação simples do email
    if (!email.includes('@')) {
      throw new BadRequestException('Email inválido');
    }

    // Validação simples da senha
    if (password.length < 6) {
      throw new BadRequestException('A senha deve ter pelo menos 6 caracteres');
    }

    return this.userService.createUser(email, password, name);
  }
}