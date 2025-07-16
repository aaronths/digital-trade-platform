import createError from 'http-errors';

export function validateApiKey(apiKey: string | undefined, apiKeyArray: string[]): boolean {
    if (apiKey == undefined) {
        throw createError(401, 'Supply a valid API Key')
    } else if (!apiKeyArray.includes(apiKey)) {
        throw createError(401, 'Invalid API Key');
    }
    return true;
}