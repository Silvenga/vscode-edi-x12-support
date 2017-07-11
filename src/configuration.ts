import { injectable } from 'inversify';
import { workspace } from 'vscode';

import { IConfiguration } from './interfaces/configuration';

const workspaceConfiguration = workspace.getConfiguration();

@injectable()
export class Configuration implements IConfiguration {
    public languageId: string = 'edi';
    public get dataElementSeparator(): string {
        return workspaceConfiguration.get<string>('edi-x12.separator.data', '*');
    }
    public get componentElementSeparator(): string {
        return workspaceConfiguration.get<string>('edi-x12.separator.component', ':');
    }
    public get repetitionElementSeparator(): string {
        return workspaceConfiguration.get<string>('edi-x12.separator.repetition', '>');
    }
    public get segmentSeparator(): string {
        return workspaceConfiguration.get<string>('edi-x12.separator.segment', '~');
    }
}