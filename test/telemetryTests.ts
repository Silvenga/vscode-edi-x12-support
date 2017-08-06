import './index';

import * as ava from 'ava';
import { expect } from 'chai';
import * as Crypto from 'crypto';
import * as faker from 'faker';
import PiwikTracker = require('piwik-tracker');
import * as Raven from 'raven';
import * as td from 'testdouble';

import { Telemetry } from '../src/telemetry';
import { IConfiguration } from './../src/interfaces/configuration';
import { IPiwikTrackOptions } from './Fixtures/piwikTrackOptions';

function contextualize<T>(getContext: () => T): ava.RegisterContextual<T> {
    ava.test.beforeEach(t => {
        Object.assign(t.context, getContext());
    });

    return ava.test;
}

const test = contextualize(() => ({
    ravenMock: <Raven.RavenStatic>null,
    trackerMock: <PiwikTracker>null,
    configuration: <IConfiguration>null
}));

test.beforeEach(t => {
    t.context.ravenMock = td.object('Raven');
    t.context.trackerMock = td.object('PiwikTracker');
    const configuration = td.object('IConfiguration') as IConfiguration;
    configuration.telemetryDisabled = false;
    configuration.vsCodeMachineId = 'vsCodeMachineId';
    configuration.vscodeLanguage = 'vscodeLanguage';
    configuration.vsCodeVersion = 'vsCodeVersion';
    configuration.extensionVersion = 'extensionVersion';
    t.context.configuration = configuration;
});

test('Capture event should specify action_name.', t => {

    const telemtry = new Telemetry(t.context.configuration);
    telemtry.install(t.context.ravenMock, t.context.trackerMock, true);

    const action = faker.lorem.sentence();

    // // Act
    telemtry.captureEvent(action);

    // Assert
    td.verify(t.context.trackerMock.track(td.matchers.argThat((x: IPiwikTrackOptions) => {
        return x.action_name == action;
    })));
    t.pass();
});

test('Capture event should specify lang.', t => {

    const telemtry = new Telemetry(t.context.configuration);
    telemtry.install(t.context.ravenMock, t.context.trackerMock, true);

    // // Act
    telemtry.captureEvent(faker.lorem.sentence());

    // Assert
    td.verify(t.context.trackerMock.track(td.matchers.argThat((x: IPiwikTrackOptions) => {
        return x.lang == 'vscodeLanguage';
    })));
    t.pass();
});

test('Capture event should specify uid hashed.', t => {

    const telemtry = new Telemetry(t.context.configuration);
    telemtry.install(t.context.ravenMock, t.context.trackerMock, true);

    // // Act
    telemtry.captureEvent(faker.lorem.sentence());

    // Assert
    td.verify(t.context.trackerMock.track(td.matchers.argThat((x: IPiwikTrackOptions) => {
        return x.uid == hashData('vsCodeMachineId');
    })));
    t.pass();
});

test('Capture event should hash file path.', t => {

    const telemtry = new Telemetry(t.context.configuration);
    telemtry.install(t.context.ravenMock, t.context.trackerMock, true);

    const action = faker.lorem.sentence();
    const filePath = faker.lorem.sentence();

    // // Act
    telemtry.captureEvent(action, filePath);

    // Assert
    td.verify(t.context.trackerMock.track(td.matchers.argThat((x: IPiwikTrackOptions) => {
        return x.url.indexOf('&filePath=' + hashData(filePath)) != -1 && x.url.indexOf(filePath) == -1;
    })));
    t.pass();
});

test('Action count should increase every capture.', t => {

    const telemtry = new Telemetry(t.context.configuration);
    telemtry.install(t.context.ravenMock, t.context.trackerMock, true);

    const action = faker.lorem.sentence();
    const filePath = faker.lorem.sentence();

    // // Act
    telemtry.captureEvent(action, filePath);
    telemtry.captureEvent(action, filePath);

    // Assert
    td.verify(t.context.trackerMock.track(td.matchers.argThat((x: IPiwikTrackOptions) => {
        return x._idvc == '1';
    })));
    td.verify(t.context.trackerMock.track(td.matchers.argThat((x: IPiwikTrackOptions) => {
        return x._idvc == '2';
    })));
    t.pass();
});

test('When capturing event throws and throw is enabled, then propagate up the stack.', t => {

    const telemtry = new Telemetry(t.context.configuration);
    telemtry.install(t.context.ravenMock, t.context.trackerMock, true);

    td.when(t.context.trackerMock.track(td.matchers.anything())).thenThrow(new Error());

    // // Act
    let action = () => telemtry.captureEvent(faker.lorem.sentence());

    // Assert
    expect(action).to.throw();
    t.pass();
});

test('When capturing event throws and throw is not enabled, then do not propagate up the stack.', t => {

    const telemtry = new Telemetry(t.context.configuration);
    telemtry.install(t.context.ravenMock, t.context.trackerMock, false);

    td.when(t.context.trackerMock.track(td.matchers.anything())).thenThrow(new Error());

    // // Act
    let action = () => telemtry.captureEvent(faker.lorem.sentence());

    // Assert
    expect(action).to.not.throw();
    t.pass();
});

test('When capturing event throws, capture exception.', t => {

    const telemtry = new Telemetry(t.context.configuration);
    telemtry.install(t.context.ravenMock, t.context.trackerMock, false);

    td.when(t.context.trackerMock.track(td.matchers.anything())).thenThrow(new Error());

    // // Act
    let action = () => telemtry.captureEvent(faker.lorem.sentence());

    // Assert
    expect(action).to.not.throw();
    td.verify(t.context.ravenMock.captureException(td.matchers.anything()));
    t.pass();
});

function hashData(data: {}): string {
    let json = JSON.stringify(data);
    return Crypto.createHash('md5').update(json).digest('hex');
}