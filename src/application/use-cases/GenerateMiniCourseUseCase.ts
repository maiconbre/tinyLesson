import { Course } from '../../domain/entities/Course';
import { CourseGeneratorRepository } from '../../domain/repositories/CourseGeneratorRepository.interface';
import { GenerateCourseRequest } from '../dtos/GenerateCourseDTO';
import { InvalidThemeError } from '../../domain/errors/DomainError';

export class GenerateMiniCourseUseCase {
    constructor(private readonly courseGeneratorRepository: CourseGeneratorRepository) { }

    async execute(request: GenerateCourseRequest): Promise<Course> {
        const theme = request.theme?.trim();

        if (!theme) {
            throw new InvalidThemeError('O tema é obrigatório e não pode ser vazio.');
        }

        const course = await this.courseGeneratorRepository.generateCourse(theme);

        return course;
    }
}
