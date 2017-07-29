import { inject, injectable } from 'inversify';
import PiwikTracker = require('piwik-tracker');
import * as Raven from 'raven';

import { IConfiguration } from './interfaces/configuration';

@injectable()
export class Telemetry {

    private _ravenStatic: Raven.RavenStatic;
    private _configuration: IConfiguration;
    private _piwikTracker: PiwikTracker;

    public constructor( @inject('IConfiguration') configuration: IConfiguration) {
        this._configuration = configuration;
    }

    public install() {
        this._ravenStatic = Raven.config(this._configuration.ravenDsn);
        this._piwikTracker = new PiwikTracker(this._configuration.piwikSiteId, this._configuration.piwikUrl);
    }

    // tslint:disable-next-line:no-any
    public captureException(error: any) {
        this._ravenStatic.captureException(error);
    }

    public captureEvent(action: string) {
        return new Promise((resolve, reject) => {
            try {
                this._piwikTracker.track({
                    url: `https://vscode.silvenga.com/edi-support?action=${encodeURIComponent(action)}`,
                    action_name: action,
                    ua: `VSCode v${this._configuration.vsCodeVersion}`,
                    uid: this._configuration.vsCodeMachineId,
                    lang: this._configuration.vscodeLanguage
                });
                console.log(`Captured event ${action}.`);
            } catch (error) {
                this.captureException(error);
            }
        });
    }
}