import { injectable } from 'inversify';
import { env, version } from 'vscode';
import { workspace } from 'vscode';

import { IConfiguration } from './interfaces/configuration';

const workspaceConfiguration = workspace.getConfiguration();

@injectable()
export class Configuration implements IConfiguration {
    public extensionVersion: string = '0.10.5'; // TODO Un-hard-code this.
    public languageId: string = 'edi';
    public ravenDsn: string = 'https://164272356e3b481f824212f7be48febc:3aff12ab1e3548f3a61f3b00bcdd5985@sentry.io/192167';
    public piwikSiteId: number = 9;
    public piwikUrl: string = 'https://piwik.silvenga.com/piwik.php';
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
    public get vsCodeMachineId(): string {
        return env.machineId;
    }
    public get vscodeLanguage(): string {
        return env.language;
    }
    public get vsCodeVersion(): string {
        return version;
    }
    public get devMode(): boolean {
        // https://github.com/Microsoft/vscode/issues/10272
        return this.vsCodeMachineId == 'someValue.machineId';
    }
    public get telemetryDisabled(): boolean {
        return workspaceConfiguration.get<boolean>('edi-x12.telemetry.disabled', false);
    }
}