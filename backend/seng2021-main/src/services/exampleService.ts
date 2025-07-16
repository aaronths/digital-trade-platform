import CreateError from "http-errors";

export function checkValidEmail(email: string): void {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailPattern.test(email) == false) {
        throw CreateError(400, 'Invalid Email');
    };
}