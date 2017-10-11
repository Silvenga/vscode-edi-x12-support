import * as Crypto from 'crypto';
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
    private _throwErrors: boolean;

    private _actionCount: number = 0;

    public constructor( @inject('IConfiguration') configuration: IConfiguration) {
        this._configuration = configuration;
    }

    public install(ravenOverride: Raven.RavenStatic = null, piwikTrackerOverride: PiwikTracker = null, throwErrors: boolean = false) {
        this._disabled = this._configuration.telemetryDisabled;
        this._throwErrors = throwErrors;

        if (!this._disabled) {
            this._ravenStatic = ravenOverride != null ? ravenOverride : Raven.config(this._configuration.ravenDsn, {
                release: this._configuration.extensionVersion,
                tags: {
                    vsCodeVersion: this._configuration.vsCodeVersion
                }
            });
            this._piwikTracker = piwikTrackerOverride != null ? piwikTrackerOverride : new PiwikTracker(this._configuration.piwikSiteId, this._configuration.piwikUrl);
        } else {
            console.log('Telemetry now disabled.');
        }
    }

    // tslint:disable-next-line:no-any
    public captureException(error: any) {
        if (this._disabled) {
            return;
        }

        this._ravenStatic.captureException(error);
    }

    public captureEvent(action: string, filePath: string = null): void {
        if (this._disabled) {
            return;
        }

        try {
            let query = new Array<{ key: string, value: string }>();

            query.push({
                key: 'action',
                value: encodeURIComponent(action)
            });

            if (filePath != null) {
                query.push({
                    key: 'filePath',
                    value: this.hashData(filePath)
                });
            }

            let count = ++this._actionCount;

            let queryString = query.map((i) => `${i.key}=${i.value}`).join('&');

            this._piwikTracker.track({
                url: `https://vscode.silvenga.com/edi-support?${queryString}`,
                action_name: action,
                ua: `VSCode v${this._configuration.vsCodeVersion} - Extension v${this._configuration.extensionVersion}`,
                uid: this.hashData(this._configuration.vsCodeMachineId),
                lang: this._configuration.vscodeLanguage,
                _idvc: count.toString(),
                rand: new Date().valueOf().toString()
            });
            console.log(`Captured event ${action}.`);
        } catch (error) {
            this.captureException(error);
            if (this._throwErrors) {
                throw error;
            }
        }
    }

    private hashData(data: {}): string {
        let json: string;
        if (data == null || (json = JSON.stringify(data)) == null) {
            return null;
        }

        return Crypto.createHash('md5').update(json).digest('hex');
    }
}