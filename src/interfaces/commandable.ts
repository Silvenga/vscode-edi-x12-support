export interface ICommandable {
    name: string;
    // tslint:disable-next-line:no-any
    command(...args: Array<any>): any;
}