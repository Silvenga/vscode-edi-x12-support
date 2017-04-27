import test from 'ava';
import { expect } from 'chai';
import { Parser, EdiDocumentConfiguration } from '../../src/parser'

const config = new EdiDocumentConfiguration("", "*", ":", ">", "~");

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

test('Can parse empty elements.', t => {

    const input = "ISA***~";
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(input, config);

    // Assert
    expect(result[0].elements).to.have.lengthOf(4);
    t.pass();
});