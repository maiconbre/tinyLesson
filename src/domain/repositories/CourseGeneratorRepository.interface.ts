import { Course } from '../entities/Course';

export interface CourseGeneratorRepository {
    generateCourse(theme: string): Promise<Course>;
}
