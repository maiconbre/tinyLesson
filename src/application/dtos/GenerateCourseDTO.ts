import { z } from 'zod';

export const GenerateCourseSchema = z.object({
    theme: z.string().min(1, 'O tema é obrigatório e não pode ser vazio.'),
});

// Infered types
export type GenerateCourseRequest = z.infer<typeof GenerateCourseSchema>;
