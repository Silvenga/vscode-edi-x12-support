
export interface IConfiguration {
    readonly languageId: string;
    readonly dataElementSeparator: string;
    readonly componentElementSeparator: string;
    readonly repetitionElementSeparator: string;
    readonly segmentSeparator: string;
    readonly ravenDsn: string;
    readonly piwikSiteId: number;
    readonly piwikUrl: string;
    readonly devMode: boolean;
    readonly vsCodeMachineId: string;
    readonly vscodeLanguage: string;
    readonly vsCodeVersion: string;
    readonly telemetryDisabled: boolean;
    readonly extensionVersion: string;
}