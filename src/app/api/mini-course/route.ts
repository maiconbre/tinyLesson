import { NextResponse } from 'next/server';
import { N8nCourseGenerator } from '@/infra/services/N8nCourseGenerator';
import { GenerateMiniCourseUseCase } from '@/application/use-cases/GenerateMiniCourseUseCase';
import { CourseController } from '@/infra/http/controllers/CourseController';
import { GenerateCourseSchema } from '@/application/dtos/GenerateCourseDTO';
import { DomainError } from '@/domain/errors/DomainError';

// IoC (Inversion of Control) Setup
const repository = new N8nCourseGenerator();
const useCase = new GenerateMiniCourseUseCase(repository);
const controller = new CourseController(useCase);

/**
 * Handles HTTP POST requests to generate a mini course from the request JSON payload.
 *
 * @param request - Incoming HTTP request containing the course generation payload as JSON
 * @returns A JSON HTTP response: the created course data on success; a 400 response with a validation or domain error message if input is invalid or a domain error occurs; a 500 response with `Erro interno do servidor` for other errors.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationResult = GenerateCourseSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    // Controller receives explicitly clean validated DTO
    const data = await controller.create(validationResult.data);

    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
