import test from 'ava';
import { expect } from 'chai';
import { Parser, ElementType } from '../../src/parser'

test('Can parse header.', t => {

    const noMatch = "ISA*00*          *00*          *ZZ*123456789012345*ZZ*123456789012346*080503*1705*>*00501*000010216*0*T*:~";
    let parser = new Parser();

    // Act
    let result = parser.parseHeader(noMatch);

    // Assert
    expect(result.componentSeparator).is.eq(":");
    expect(result.controlVersion).is.eq("00501");
    expect(result.dataSeparator).is.eq("*");
    expect(result.repetitionSeparator).is.eq(">");
    expect(result.segmentSeparator).is.eq("~");
    t.pass();
});


test('When header ends with windows new line, segment separator should be new line.', t => {

    const noMatch = "ISA*00*          *00*          *ZZ*123456789012345*ZZ*123456789012346*080503*1705*>*00501*000010216*0*T*:\r\n";
    let parser = new Parser();

    // Act
    let result = parser.parseHeader(noMatch);

    // Assert
    expect(result.segmentSeparator).is.eq("\r\n");
    t.pass();
});


test('When header ends with unix new line, segment separator should be new line.', t => {

    const noMatch = "ISA*00*          *00*          *ZZ*123456789012345*ZZ*123456789012346*080503*1705*>*00501*000010216*0*T*:\n";
    let parser = new Parser();

    // Act
    let result = parser.parseHeader(noMatch);

    // Assert
    expect(result.segmentSeparator).is.eq("\n");
    t.pass();
});


test('When header does not start with ISA, return null.', t => {

    const noMatch = "nothing to see here...";
    let parser = new Parser();

    // Act
    let result = parser.parseHeader(noMatch);

    // Assert
    expect(result).is.null;
    t.pass();
});
