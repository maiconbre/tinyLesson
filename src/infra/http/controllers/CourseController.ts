import { GenerateMiniCourseUseCase } from '@/application/use-cases/GenerateMiniCourseUseCase';
import { GenerateCourseRequest } from '@/application/dtos/GenerateCourseDTO';

export class CourseController {
    constructor(private readonly generateMiniCourseUseCase: GenerateMiniCourseUseCase) { }

    async create(dto: GenerateCourseRequest) {
        return await this.generateMiniCourseUseCase.execute(dto);
    }
}
