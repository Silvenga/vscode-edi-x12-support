import test from 'ava';
import { expect } from 'chai';
import { Parser, ElementType } from '../../src/parser'

const twoSegments = "ISA*hello~BSA*61*2017~";

test('On ParseSegments, when no matches, return empty array.', t => {

    const noMatch = "";
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(noMatch);

    // Assert
    expect(result).is.empty;
    t.pass();
});

test('On ParseSegments, return matches.', t => {

    let parser = new Parser();

    // Act
    let result = parser.parseSegments(twoSegments);

    // Assert
    expect(result).to.have.lengthOf(2);
    t.pass();
});

test('Segment Id should be populated.', t => {

    let parser = new Parser();

    // Act
    let result = parser.parseSegments("ISA*test~");

    // Assert
    expect(result).to.have.lengthOf(1);
    expect(result[0].id).to.be.eq("ISA");
    t.pass();
});

test('Segment end deliminator should be populated.', t => {

    let parser = new Parser();

    // Act
    let result = parser.parseSegments("ISA*test~");

    // Assert
    expect(result[0].endingDelimiter).to.be.eq("~");
    t.pass();
});

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

test('Can parse Commas.', t => {

    let parser = new Parser();

    // Act
    let result = parser.parseSegments("ISA* , *~");

    // Assert
    expect(result[0].elements).to.have.lengthOf(3);
    t.pass();
});

const supportCharsExtended = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!\"&'\(\),-./;?= abcdefghijklmnopqrstuvwxyz%@[]_{}\\|<#$"; // Also :~>, but that doesn't work right now.

test('Supports extended character sets.', t => {

    let parser = new Parser();

    // Act
    let result = parser.parseSegments(`ISA*${supportCharsExtended}*test~`);

    // Assert
    expect(result[0].elements).to.have.lengthOf(3);
    expect(result[0].elements.findIndex(x => x.type != ElementType.dataElement && x.type != ElementType.segmentId)).is.eq(-1);
    expect(result[0].elements[1].value).is.eq(supportCharsExtended);
    t.pass();
});
