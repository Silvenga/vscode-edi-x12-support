import { inject, injectable } from 'inversify';
import * as Raven from 'raven';
import { Error } from 'tslint/lib/error';

import { IConfiguration } from './interfaces/configuration';

@injectable()
export class Telemetry {

    private _ravenStatic: Raven.RavenStatic;
    private _configuration: IConfiguration;

    public constructor( @inject('IConfiguration') configuration: IConfiguration) {
        this._configuration = configuration;
    }

    public install() {
        this._ravenStatic = Raven.config(this._configuration.ravenDsn);
    }

    // tslint:disable-next-line:no-any
    public captureException(error: any) {
        this._ravenStatic.captureException(error);
    }
}