export class DomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
    }
}

export class GenerateCourseError extends DomainError {
    constructor(message: string = 'Erro interno ao gerar curso.') {
        super(message);
    }
}

export class InvalidThemeError extends DomainError {
    constructor(message: string = 'O tema fornecido é inválido ou vazio.') {
        super(message);
    }
}

export class CourseValidationError extends DomainError {
    constructor(message: string = 'Os dados do curso gerado são inválidos.') {
        super(message);
    }
}
