import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsValidServiceType(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isValidServiceType',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const serviceType = value;
                    const categoryId = (args.object as any).categoryId;
                    const commission = (args.object as any).commission;

                    // If serviceType is NORMAL
                    if (serviceType === 'NORMAL') {
                        // categoryId is required
                        if (!categoryId) {
                            return false;
                        }
                        // commission is required
                        if (commission === undefined || commission === null) {
                            return false;
                        }
                    }

                    // If serviceType is KHABEER
                    if (serviceType === 'KHABEER') {
                        // categoryId must be null/undefined
                        if (categoryId !== undefined && categoryId !== null) {
                            return false;
                        }
                        // commission is optional (can be null/undefined)
                    }

                    return true;
                },
                defaultMessage(args: ValidationArguments) {
                    const serviceType = args.value;

                    if (serviceType === 'NORMAL') {
                        return 'NORMAL services require categoryId and commission';
                    }

                    if (serviceType === 'KHABEER') {
                        return 'KHABEER services cannot have categoryId';
                    }

                    return 'Invalid service type configuration';
                }
            }
        });
    };
}
