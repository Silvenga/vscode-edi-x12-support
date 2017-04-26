import { DocumentHighlightProvider, DocumentHighlight, MarkedString, TextDocument, CancellationToken, Position, Range } from 'vscode';
import { EdiController } from './ediController';
import { Parser } from './parser';
import { Constants } from './constants'
import { Document } from './document'

export class EdiHighlightProvider implements DocumentHighlightProvider {

    private ediController: EdiController;
    private parser: Parser;

    constructor(ediController: EdiController) {
        this.ediController = ediController;
        this.parser = new Parser();
    }

    public async provideDocumentHighlights(document: TextDocument, position: Position, token: CancellationToken): Promise<DocumentHighlight[]> {

        let text = document.getText();
        let doc = Document.create(text);

        let segments = this.parser.ParseSegments(text);
        let realPosition = doc.positionToIndex(position.line, position.character);
        let selectedSegment = segments.find(x => realPosition >= x.startIndex && realPosition <= x.endIndex);

        let startLine = doc.indexToPosition(selectedSegment.startIndex);
        let endLine = doc.indexToPosition(selectedSegment.endIndex);

        return [new DocumentHighlight(new Range(new Position(startLine.line, startLine.character), new Position(endLine.line, endLine.character)))];
    }
}

class LineIndex {

    public length: number;
    public line: number;
    public startIndex: number;

    constructor(length: number, line: number, startIndex: number) {
        this.length = length;
        this.line = line;
        this.startIndex = startIndex;
    }
}
