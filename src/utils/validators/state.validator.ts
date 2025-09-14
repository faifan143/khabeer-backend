import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { DB_STATES } from '../oman-locations.constants';

/**
 * Custom validator for Omani states
 * Validates that the state value is one of the valid English state names
 */
export function IsValidOmanState(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isValidOmanState',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') {
                        return false;
                    }
                    return DB_STATES.includes(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a valid Omani state. Valid states are: ${DB_STATES.join(', ')}`;
                }
            }
        });
    };
}

/**
 * Custom validator for Omani states with custom error message
 */
export function IsValidOmanStateWithMessage(message?: string) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isValidOmanStateWithMessage',
            target: object.constructor,
            propertyName: propertyName,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') {
                        return false;
                    }
                    return DB_STATES.includes(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return message || `${args.property} must be a valid Omani state`;
                }
            }
        });
    };
}

/**
 * Validates if a string is a valid Omani state
 * @param state - The state string to validate
 * @returns boolean - true if valid, false otherwise
 */
export function isValidOmanState(state: string): boolean {
    return typeof state === 'string' && DB_STATES.includes(state);
}

/**
 * Gets all valid Omani states
 * @returns string[] - Array of all valid state values
 */
export function getValidOmanStates(): string[] {
    return [...DB_STATES];
}

/**
 * Validates multiple states at once
 * @param states - Array of state strings to validate
 * @returns { valid: string[], invalid: string[] } - Object with valid and invalid states
 */
export function validateOmanStates(states: string[]): { valid: string[]; invalid: string[] } {
    const valid: string[] = [];
    const invalid: string[] = [];

    states.forEach(state => {
        if (isValidOmanState(state)) {
            valid.push(state);
        } else {
            invalid.push(state);
        }
    });

    return { valid, invalid };
}
