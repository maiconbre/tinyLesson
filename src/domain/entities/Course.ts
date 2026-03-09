export interface CourseLesson {
    lesson_title: string;
    content: string;
    example: string;
}

export interface CourseQuizQuestion {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

export interface CourseModule {
    module_title: string;
    introduction: string;
    lessons: CourseLesson[];
    quiz: CourseQuizQuestion[];
}

export interface GlossaryItem {
    term: string;
    definition: string;
}

export interface Course {
    title: string;
    objectives: string[];
    modules: CourseModule[];
    glossary: GlossaryItem[];
    study_tips: string[];
    final_summary: string;
}
