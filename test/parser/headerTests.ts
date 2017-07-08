import '../index';
import test from 'ava';
import { expect } from 'chai';
import { Parser, ElementType } from '../../src/parser';

test('Can parse header.', t => {

    const noMatch = 'ISA*00*          *00*          *ZZ*123456789012345*ZZ*123456789012346*080503*1705*>*00501*000010216*0*T*:~';
    let parser = new Parser();

    // Act
    let result = parser.parseHeader(noMatch);

    // Assert
    expect(result.configuration.componentSeparator).is.eq(':');
    expect(result.configuration.controlVersion).is.eq('00501');
    expect(result.configuration.dataSeparator).is.eq('*');
    expect(result.configuration.repetitionSeparator).is.eq('>');
    expect(result.configuration.segmentSeparator).is.eq('~');
    t.pass();
});

test('When header ends with windows new line, segment separator should be new line.', t => {

    const noMatch = 'ISA*00*          *00*          *ZZ*123456789012345*ZZ*123456789012346*080503*1705*>*00501*000010216*0*T*:\r\n';
    let parser = new Parser();

    // Act
    let result = parser.parseHeader(noMatch);

    // Assert
    expect(result).is.not.null;
    expect(result.isValid).is.true;
    expect(result.configuration.segmentSeparator).is.eq('\r\n');
    t.pass();
});

test('When header ends with unix new line, segment separator should be new line.', t => {

    const noMatch = 'ISA*00*          *00*          *ZZ*123456789012345*ZZ*123456789012346*080503*1705*>*00501*000010216*0*T*:\n';
    let parser = new Parser();

    // Act
    let result = parser.parseHeader(noMatch);

    // Assert
    expect(result.configuration.segmentSeparator).is.eq('\n');
    t.pass();
});

test('When header does not start with ISA, return null.', t => {

    const noMatch = 'nothing to see here...';
    let parser = new Parser();

    // Act
    let result = parser.parseHeader(noMatch);

    // Assert
    expect(result.isValid).is.false;
    t.pass();
});

test('When data elements are not correct, return null.', t => {

    const noMatch = 'ISA*00*          *00*          *ZZ*00000000000000*ZZ*00000000000000*000000*0000*^*00501*00000000000*0*P*>~';
    let parser = new Parser();

    // Act
    let result = parser.parseHeader(noMatch);

    // Assert
    expect(result.isValid).is.false;
    t.pass();
});

test('When data elements are not correct, return null.', t => {

    const noMatch = 'ISA*00*          *00*          *ZZ*R896           *ZZ*IHCP           *170511*1105*^*00501*000000462*1*P*+~';
    let parser = new Parser();

    // Act
    let result = parser.parseHeader(noMatch);

    // Assert
    expect(result.isValid).is.true;
    t.pass();
});
