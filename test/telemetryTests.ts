import './index';

import test from 'ava';
import * as faker from 'faker';
import PiwikTracker = require('piwik-tracker');
import * as td from 'testdouble';

import { Telemetry } from '../src/telemetry';
import { IConfiguration } from './../src/interfaces/configuration';
import { IPiwikTrackOptions } from './Fixtures/piwikTrackOptions';

const configuration = td.object('IConfiguration') as IConfiguration;
configuration.telemetryDisabled = false;
configuration.vsCodeMachineId = 'vsCodeMachineId';
configuration.vscodeLanguage = 'vscodeLanguage';
configuration.vsCodeVersion = 'vsCodeVersion';
configuration.extensionVersion = 'extensionVersion';

const ravenMock = <PiwikTracker>td.object('Raven');
const trackerMock = <PiwikTracker>td.object('PiwikTracker');

test('Capture event should specify action_name.', t => {

    const telemtry = new Telemetry(configuration);
    telemtry.install(ravenMock, trackerMock);

    const action = faker.lorem.word();

    // // Act
    telemtry.captureEvent(action);

    // Assert
    td.verify(trackerMock.track(td.matchers.argThat((x: IPiwikTrackOptions) => {
        return x.action_name == action;
    })));
    t.pass();
});

test('Capture event should hash file path.', t => {

    const telemtry = new Telemetry(configuration);
    telemtry.install(ravenMock, trackerMock);

    const action = faker.lorem.word();
    const filePath = faker.lorem.word();

    // // Act
    telemtry.captureEvent(action, filePath);

    // Assert
    td.verify(trackerMock.track(td.matchers.argThat((x: IPiwikTrackOptions) => {
        return x.url.indexOf('&filePath=') != -1 && x.url.indexOf(filePath) == -1;
    })));
    t.pass();
});

test('Action count should increase every capture.', t => {

    const telemtry = new Telemetry(configuration);
    telemtry.install(ravenMock, trackerMock);

    const action = faker.lorem.word();
    const filePath = faker.lorem.word();

    // // Act
    telemtry.captureEvent(action, filePath);
    telemtry.captureEvent(action, filePath);

    // Assert
    td.verify(trackerMock.track(td.matchers.argThat((x: IPiwikTrackOptions) => {
        return x._idvc == '1';
    })));
    td.verify(trackerMock.track(td.matchers.argThat((x: IPiwikTrackOptions) => {
        return x._idvc == '2';
    })));
    t.pass();
});