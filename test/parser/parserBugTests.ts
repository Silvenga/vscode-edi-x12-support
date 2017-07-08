import '../index';
import test from 'ava';
import { expect } from 'chai';
import { Parser, EdiDocumentConfiguration } from '../../src/parser'

test('Can parse pipes', t => {

    const input = "ISA|1.0|hello!something~";
    let parser = new Parser();
    const config = new EdiDocumentConfiguration("", "|", "!", ">", "~");

    // Act
    let result = parser.parseSegments(input, config);

    // Assert    
    expect(result[0].elements).to.have.lengthOf(4);
    t.pass();
});