import './index';

import test from 'ava';
import * as faker from 'faker';
import PiwikTracker = require('piwik-tracker');
import * as td from 'testdouble';

import { Telemetry } from '../src/telemetry';
import { IConfiguration } from './../src/interfaces/configuration';

const configuration = td.object('IConfiguration') as IConfiguration;
configuration.telemetryDisabled = false;
configuration.vsCodeMachineId = 'vsCodeMachineId';
configuration.vscodeLanguage = 'vscodeLanguage';
configuration.vsCodeVersion = 'vsCodeVersion';
configuration.extensionVersion = 'extensionVersion';

test('Capture event should specify action_name.', t => {

    const ravenMock = <PiwikTracker>td.object('Raven');
    const trackerMock = <PiwikTracker>td.object('PiwikTracker');

    const action = faker.lorem.word();

    const telemtry = new Telemetry(configuration);
    telemtry.install(ravenMock, trackerMock);

    // // Act
    telemtry.captureEvent(action);

    // Assert
    // tslint:disable-next-line:no-any
    td.verify(trackerMock.track(td.matchers.argThat((x: any) => {
        return x.action_name == action;
    })));
    t.pass();
});

test('Capture event should hash file path.', t => {

    const ravenMock = <PiwikTracker>td.object('Raven');
    const trackerMock = <PiwikTracker>td.object('PiwikTracker');

    const action = faker.lorem.word();
    const filePath = faker.lorem.word();

    const telemtry = new Telemetry(configuration);
    telemtry.install(ravenMock, trackerMock);

    // // Act
    telemtry.captureEvent(action, filePath);

    // Assert
    // tslint:disable-next-line:no-any
    td.verify(trackerMock.track(td.matchers.argThat((x: any) => {
        return x.url.indexOf('&filePath=') != -1 && x.url.indexOf(filePath) == -1;
    })));
    t.pass();
});