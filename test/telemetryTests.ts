import './index';

import test from 'ava';
import { expect } from 'chai';
import * as Crypto from 'crypto';
import * as faker from 'faker';
import PiwikTracker = require('piwik-tracker');
import * as Raven from 'raven';
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

const ravenMock = <Raven.RavenStatic>td.object('Raven');
const trackerMock = <PiwikTracker>td.object('PiwikTracker');

test('Capture event should specify action_name.', t => {

    const telemtry = new Telemetry(configuration);
    telemtry.install(ravenMock, trackerMock, true);

    const action = faker.lorem.sentence();

    // // Act
    telemtry.captureEvent(action);

    // Assert
    td.verify(trackerMock.track(td.matchers.argThat((x: IPiwikTrackOptions) => {
        return x.action_name == action;
    })));
    t.pass();
});

test('Capture event should specify lang.', t => {

    const telemtry = new Telemetry(configuration);
    telemtry.install(ravenMock, trackerMock, true);

    // // Act
    telemtry.captureEvent(faker.lorem.sentence());

    // Assert
    td.verify(trackerMock.track(td.matchers.argThat((x: IPiwikTrackOptions) => {
        return x.lang == 'vscodeLanguage';
    })));
    t.pass();
});

test('Capture event should specify uid hashed.', t => {

    const telemtry = new Telemetry(configuration);
    telemtry.install(ravenMock, trackerMock, true);

    // // Act
    telemtry.captureEvent(faker.lorem.sentence());

    // Assert
    td.verify(trackerMock.track(td.matchers.argThat((x: IPiwikTrackOptions) => {
        return x.uid == hashData('vsCodeMachineId');
    })));
    t.pass();
});

test('Capture event should hash file path.', t => {

    const telemtry = new Telemetry(configuration);
    telemtry.install(ravenMock, trackerMock, true);

    const action = faker.lorem.sentence();
    const filePath = faker.lorem.sentence();

    // // Act
    telemtry.captureEvent(action, filePath);

    // Assert
    td.verify(trackerMock.track(td.matchers.argThat((x: IPiwikTrackOptions) => {
        return x.url.indexOf('&filePath=' + hashData(filePath)) != -1 && x.url.indexOf(filePath) == -1;
    })));
    t.pass();
});

test('Action count should increase every capture.', t => {

    const telemtry = new Telemetry(configuration);
    telemtry.install(ravenMock, trackerMock, true);

    const action = faker.lorem.sentence();
    const filePath = faker.lorem.sentence();

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

test('When capturing event throws and throw is enabled, then propagate up the stack.', t => {

    const telemtry = new Telemetry(configuration);
    telemtry.install(ravenMock, trackerMock, true);

    td.when(trackerMock.track(td.matchers.anything())).thenThrow(new Error());

    // // Act
    let action = () => telemtry.captureEvent(faker.lorem.sentence());

    // Assert
    expect(action).to.throw();
    t.pass();
});

test('When capturing event throws and throw is not enabled, then do not propagate up the stack.', t => {

    const telemtry = new Telemetry(configuration);
    telemtry.install(ravenMock, trackerMock, false);

    td.when(trackerMock.track(td.matchers.anything())).thenThrow(new Error());

    // // Act
    let action = () => telemtry.captureEvent(faker.lorem.sentence());

    // Assert
    expect(action).to.not.throw();
    t.pass();
});

test('When capturing event throws, capture exception.', t => {

    const telemtry = new Telemetry(configuration);
    telemtry.install(ravenMock, trackerMock, false);

    td.when(trackerMock.track(td.matchers.anything())).thenThrow(new Error());

    // // Act
    let action = () => telemtry.captureEvent(faker.lorem.sentence());

    // Assert
    expect(action).to.not.throw();
    td.verify(ravenMock.captureException(td.matchers.anything()));
    t.pass();
});

function hashData(data: {}): string {
    let json = JSON.stringify(data);
    return Crypto.createHash('md5').update(json).digest('hex');
}