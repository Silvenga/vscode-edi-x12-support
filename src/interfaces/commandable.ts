import { IDisposable } from './disposable';

export interface ICommandable extends IDisposable {
    name: string;
    // tslint:disable-next-line:no-any
    command(...args: Array<any>): any;
}