import test from 'ava';
import { expect } from 'chai';
import { Parser } from '../../src/parser'

test('Can parse decimals.', t => {

    let parser = new Parser();

    // Act
    let result = parser.parseSegments("ISA*1.0~");

    // Assert
    expect(result[0].elements).to.have.lengthOf(2);
    t.pass();
});

test('Can parse whitespace.', t => {

    let parser = new Parser();

    // Act
    let result = parser.parseSegments("ISA*1000 ~");

    // Assert
    expect(result[0].elements).to.have.lengthOf(2);
    t.pass();
});

test('Can parse empty elements.', t => {

    let parser = new Parser();

    // Act
    let result = parser.parseSegments("ISA***~");

    // Assert
    expect(result[0].elements).to.have.lengthOf(4);
    t.pass();
});

test('Repeating Elements', t => {

    let parser = new Parser();

    // Act
    let result = parser.parseSegments("ISA^^~");

    // Assert
    expect(result[0].elements).to.have.lengthOf(3);
    t.pass();
});