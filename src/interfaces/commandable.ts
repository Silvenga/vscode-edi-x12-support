export interface ICommandable {
    name: string;
    command(...args: any[]): any;
}