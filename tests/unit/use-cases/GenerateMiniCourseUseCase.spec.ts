import { describe, it, expect, beforeEach } from 'vitest';
import { GenerateMiniCourseUseCase } from '../../../src/application/use-cases/GenerateMiniCourseUseCase';
import { FakeCourseGeneratorRepository } from '../../fakes/FakeCourseGeneratorRepository';
import { InvalidThemeError } from '../../../src/domain/errors/DomainError';

describe('GenerateMiniCourseUseCase', () => {
    let repository: FakeCourseGeneratorRepository;
    let useCase: GenerateMiniCourseUseCase;

    beforeEach(() => {
        repository = new FakeCourseGeneratorRepository();
        useCase = new GenerateMiniCourseUseCase(repository);
    });

    it('should generate a successful course given a valid theme', async () => {
        const response = await useCase.execute({ theme: 'Typescript' });

        expect(response).toBeDefined();
        expect(response.title).toBe('Curso de Typescript');
        expect(response.objectives.length).toBeGreaterThan(0);
    });

    it('should throw InvalidThemeError when theme is empty', async () => {
        await expect(useCase.execute({ theme: '' })).rejects.toThrow(InvalidThemeError);
    });

    it('should throw InvalidThemeError when theme has only spaces', async () => {
        await expect(useCase.execute({ theme: '   ' })).rejects.toThrow(InvalidThemeError);
    });
});
