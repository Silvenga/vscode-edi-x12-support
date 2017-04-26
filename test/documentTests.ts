import test from 'ava';
import { expect } from 'chai';
import { Document } from '../src/document'
import { EditorPosition } from '../src/models/editorPosition';

test('Create should populate document.', t => {

    const str = "1234567890 \r\n abc \r\n a";

    // Act
    var doc = Document.create(str);

    // Assert
    expect(doc).is.not.null;
    expect(doc.text).is.eq(str);
    expect(doc.lineToStartIndex.length).is.eq(3);
    t.pass();
});

test('When parsing text, windows returns should be counted.', t => {

    const str = "1234567890 \r\n abc \r\n";
    var doc = Document.create(str);

    // Act
    var index = doc.positionToIndex(1, 1);

    // Assert
    expect(index).is.eq(14);
    t.pass();
});

test('When parsing text, unix returns should be counted.', t => {

    const str = "1234567890 \n abc \n";
    var doc = Document.create(str);

    // Act
    var index = doc.positionToIndex(1, 1);

    // Assert
    expect(index).is.eq(13);
    t.pass();
});

test('When parsing text, indexToPosition should return correct information. 1', t => {

    const str = "123\nabc\nxyz";
    var doc = Document.create(str);

    // Act
    var result = doc.indexToPosition(1);

    // Assert
    expect(result.line).is.eq(0);
    expect(result.character).is.eq(1);
    t.pass();
});

test('When parsing text, indexToPosition should return correct information. 2', t => {

    const str = "123\r\nabc\r\nxyz";
    var doc = Document.create(str);

    // Act
    var result = doc.indexToPosition(7);

    // Assert
    expect(result.line).is.eq(1);
    expect(result.character).is.eq(2);
    t.pass();
});