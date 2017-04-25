import test from 'ava';
import { expect } from 'chai';
import { Parser } from '../../src/parser'

const twoSegments = "ISA*hello~BSA*61*2017~";

test('On ParseSegments, when no matches, return empty array.', t => {

    const noMatch = "";
    var parser = new Parser();

    // Act
    var result = parser.ParseSegments(noMatch);

    // Assert
    expect(result).is.empty;
    t.pass();
});

test('On ParseSegments, return matches.', t => {

    var parser = new Parser();

    // Act
    var result = parser.ParseSegments(twoSegments);

    // Assert
    expect(result).to.have.lengthOf(2);
    t.pass();
});

test('Segment should be populated.', t => {

    var parser = new Parser();

    // Act
    var result = parser.ParseSegments("ISA*test~");

    // Assert
    expect(result).to.have.lengthOf(1);
    expect(result[0].id).to.be.eq("ISA");
    t.pass();
});

test('Can parse decimals.', t => {

    var parser = new Parser();

    // Act
    var result = parser.ParseSegments("ISA*1.0~");

    // Assert
    expect(result[0].elements).to.have.lengthOf(2);
    t.pass();
});

test('Can parse whitespace.', t => {

    var parser = new Parser();

    // Act
    var result = parser.ParseSegments("ISA*1000 ~");

    // Assert
    expect(result[0].elements).to.have.lengthOf(2);
    t.pass();
});

test('Can parse empty elements.', t => {

    var parser = new Parser();

    // Act
    var result = parser.ParseSegments("ISA***~");

    // Assert
    expect(result[0].elements).to.have.lengthOf(4);
    t.pass();
});

test('Repeating Elements', t => {

    var parser = new Parser();

    // Act
    var result = parser.ParseSegments("ISA^^~");

    // Assert
    expect(result[0].elements).to.have.lengthOf(3);
    t.pass();
});

test('Can parse Commas.', t => {

    var parser = new Parser();

    // Act
    var result = parser.ParseSegments("ISA* , *~");

    // Assert
    expect(result[0].elements).to.have.lengthOf(3);
    t.pass();
});