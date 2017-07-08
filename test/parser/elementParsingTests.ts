import '../index';
import test from 'ava';
import { expect } from 'chai';
import { Parser, EdiDocumentConfiguration } from '../../src/parser'

const config = new EdiDocumentConfiguration("", "*", ":", ">", "~");

test('Segment ids.', t => {

    const input = "ISA*test~";
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(input, config)[0];

    // Assert
    expect(result.elements[0].name).is.eq("");
    expect(result.elements[1].name).is.eq("01");
    t.pass();
});

test('Data elements.', t => {

    const input = "ISA*test~";
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(input, config)[0];

    // Assert
    expect(result.elements[1].name).is.eq("01")
    t.pass();
});


test('Component elements.', t => {

    const input = "ISA*test:test~";
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(input, config)[0];

    // Assert
    expect(result.elements[1].name).is.eq("01")
    expect(result.elements[2].name).is.eq("01-2")
    t.pass();
});


test('Repeating elements.', t => {

    const input = "ISA*test>test~";
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(input, config)[0];

    // Assert
    expect(result.elements[1].name).is.eq("01");
    expect(result.elements[2].name).is.eq("01");
    t.pass();
});


test('Can parse decimals.', t => {

    const input = "ISA*1.0~";
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(input, config);

    // Assert
    expect(result[0].elements).to.have.lengthOf(2);
    t.pass();
});

test('Can parse whitespace.', t => {

    const input = "ISA*1000 ~";
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(input, config);

    // Assert
    expect(result[0].elements).to.have.lengthOf(2);
    t.pass();
});

