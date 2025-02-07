import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseQueryDto } from '../../common/validator/base.query.validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ required: true })
  email: string;
  @IsOptional()
  @ApiProperty({ required: false })
  @Transform(({ value }) => value.trim())
  firstName: string;
  @IsOptional()
  @ApiProperty()
  city: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Пароль має бути не менше 8 символів' })
  @ApiProperty({ required: true })
  password: string;
  @IsNumberString()
  @ApiProperty()
  age: number;
}

export class SingUpDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  createdAt: Date;
}

export class UserItemDto extends SingUpDto {
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  age: number;
}
export class SignInDto {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}
export class UserFilterDto extends BaseQueryDto {
  @IsEmail()
  @IsOptional()
  email?: string;
  @IsOptional()
  firstName?: string;
  @IsOptional()
  age?: string;
  @IsOptional()
  city?: string;
}
