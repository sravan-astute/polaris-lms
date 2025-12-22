import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreatePassageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string; // The HTML story text

  @IsString()
  @IsOptional()
  mediaUrl?: string; // 👈 ADDED: Image URL

  @IsString()
  @IsOptional()
  genre?: string;

  @IsString()
  @IsOptional()
  lexile?: string;

  @IsInt()
  @IsOptional()
  wordCount?: number;
}