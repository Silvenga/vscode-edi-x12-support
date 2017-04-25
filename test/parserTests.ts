import test from 'ava';
import { expect } from 'chai';
import { Parser } from '../src/parser'

const twoSegments = "ISA*hello~BSA*61*2017~";

test('On ParseSegments, when no matches, return empty array.', t => {

    const noMatch = "";
    var parser = new Parser();

    // Act
    var result = parser.ParseSegments(noMatch);

    // Assert
    expect(result).is.empty;
});

test('On ParseSegments, return matches.', t => {
    console.log(twoSegments);

    var parser = new Parser();

    // Act
    var result = parser.ParseSegments(twoSegments);

    // Assert
    console.log(result);

    expect(result).to.be.eql(["ISA*hello~", "BSA*61*2017~"]);
});