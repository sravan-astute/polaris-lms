import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsArray, IsBoolean, IsObject } from 'class-validator';

// Enums must match your Prisma Schema
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  MULTIPLE_SELECT = 'MULTIPLE_SELECT',
  FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK',
  MATCHING = 'MATCHING',
  MATH_RESPONSE = 'MATH_RESPONSE',
  ORDERING = 'ORDERING',
}

export enum ContentStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export class CreateQuestionDto {
  // --- Core Content ---
  @IsString()
  @IsNotEmpty()
  text: string; // The prompt

  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType;

  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;

  @IsInt()
  @IsOptional()
  points?: number;

  @IsString()
  @IsOptional()
  code?: string;

  // --- Meta Data ---
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsArray()
  @IsOptional()
  gradeLevels?: string[];

  @IsArray()
  @IsOptional()
  standards?: string[];

  @IsString()
  @IsOptional()
  difficulty?: string;

  @IsString()
  @IsOptional()
  bloomsTaxonomy?: string;

  @IsString()
  @IsOptional()
  dokLevel?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  explanation?: string;

  // --- Media & Tools ---
  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsString()
  @IsOptional()
  mediaType?: string;

  @IsString()
  @IsOptional()
  mediaAltText?: string;

  @IsBoolean()
  @IsOptional()
  calculator?: boolean;

  // --- The Options (Stored as JSON in DB) ---
  @IsArray()
  @IsOptional()
  options?: any[]; 
}