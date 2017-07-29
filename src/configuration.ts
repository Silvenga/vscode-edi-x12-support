import { injectable } from 'inversify';
import { workspace } from 'vscode';

import { IConfiguration } from './interfaces/configuration';

const workspaceConfiguration = workspace.getConfiguration();

@injectable()
export class Configuration implements IConfiguration {
    public languageId: string = 'edi';
    public ravenDsn: string = 'https://164272356e3b481f824212f7be48febc:3aff12ab1e3548f3a61f3b00bcdd5985@sentry.io/192167';
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