import { CourseGeneratorRepository } from '../../src/domain/repositories/CourseGeneratorRepository.interface';
import { Course } from '../../src/domain/entities/Course';

export class FakeCourseGeneratorRepository implements CourseGeneratorRepository {
    async generateCourse(theme: string): Promise<Course> {
        if (theme === 'error_trigger') {
            throw new Error('Simulated generator error');
        }

        return {
            title: `Curso de ${theme}`,
            objectives: ['Objetivo 1', 'Objetivo 2'],
            modules: [],
            glossary: [],
            study_tips: [],
            final_summary: 'Conclusão.'
        };
    }
}
