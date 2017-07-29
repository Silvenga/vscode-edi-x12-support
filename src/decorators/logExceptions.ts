import { container } from '../container';
import { Telemetry } from './../telemetry';

// tslint:disable-next-line:no-any
export function logExceptions(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {

    const originalMethod = descriptor.value;

    descriptor.value = function (...args: Array<{}>) {
        try {
            const result = originalMethod.apply(this, args);

            if (result != null && result['then'] != null) {
                result.then(null, handleError);
            }

            return result;
        } catch (error) {
            handleError(error);
            throw error;
        }
    };

    return descriptor;
}

// tslint:disable-next-line:no-any
function handleError(error: any) {
    const telemetry = container.get<Telemetry>(Telemetry);
    telemetry.captureException(error);
}