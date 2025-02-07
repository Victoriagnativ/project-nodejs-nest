import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ required: true })
  email?: string;
  @IsOptional()
  @ApiProperty({ required: false })
  @Transform(({ value }) => value.trim())
  firstName?: string;
  @IsOptional()
  @ApiProperty()
  city?: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Пароль має бути не менше 8 символів' })
  @ApiProperty({ required: true })
  password?: string;
  @IsNumberString()
  @ApiProperty()
  age?: number;
}
