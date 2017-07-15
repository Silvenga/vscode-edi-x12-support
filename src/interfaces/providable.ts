import { IDisposable } from './disposable';

export interface IProvidable extends IDisposable {
    registerFunction(): (languageId: string) => IDisposable;
}