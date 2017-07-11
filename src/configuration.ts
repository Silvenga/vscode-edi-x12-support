import { injectable } from 'inversify';
import { workspace } from 'vscode';

import { IConfiguration } from './interfaces/configuration';

const workspaceConfiguration = workspace.getConfiguration();

@injectable()
export class Configuration implements IConfiguration {
    public languageId: string = 'edi';
    get dataElementSeparator(): string {
        return workspaceConfiguration.get<string>('edi-x12.separator.data', '*');
    }
    get componentElementSeparator(): string {
        return workspaceConfiguration.get<string>('edi-x12.separator.component', ':');
    }
    get repetitionElementSeparator(): string {
        return workspaceConfiguration.get<string>('edi-x12.separator.repetition', '>');
    }
    get segmentSeparator(): string {
        return workspaceConfiguration.get<string>('edi-x12.separator.segment', '~');
    }
}