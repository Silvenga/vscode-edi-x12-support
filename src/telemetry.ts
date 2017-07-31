import { inject, injectable } from 'inversify';
import PiwikTracker = require('piwik-tracker');
import * as Raven from 'raven';

import { IConfiguration } from './interfaces/configuration';

@injectable()
export class Telemetry {

    private _ravenStatic: Raven.RavenStatic;
    private _configuration: IConfiguration;
    private _piwikTracker: PiwikTracker;
    private _disabled: boolean;

    public constructor( @inject('IConfiguration') configuration: IConfiguration) {
        this._configuration = configuration;
    }

    public install() {
        this._disabled = this._configuration.telemetryDisabled;

        this._ravenStatic = Raven.config(this._configuration.ravenDsn, {
            release: this._configuration.extensionVersion,
            tags: {
                vsCodeVersion: this._configuration.vsCodeVersion
            }
        });
        this._piwikTracker = new PiwikTracker(this._configuration.piwikSiteId, this._configuration.piwikUrl);
    }

    // tslint:disable-next-line:no-any
    public captureException(error: any) {
        if (this._disabled) {
            return;
        }

        this._ravenStatic.captureException(error);
    }

    public captureEvent(action: string): void {
        if (this._disabled) {
            return;
        }
        Promise.resolve().then(() => {

            this._piwikTracker.track({
                url: `https://vscode.silvenga.com/edi-support?action=${encodeURIComponent(action)}`,
                action_name: action,
                ua: `VSCode v${this._configuration.vsCodeVersion}`,
                uid: this._configuration.vsCodeMachineId,
                lang: this._configuration.vscodeLanguage
            });
            console.log(`Captured event ${action}.`);

        }).catch((error) => {
            this.captureException(error);
        });
    }
}