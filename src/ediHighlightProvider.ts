import { DocumentHighlightProvider, DocumentHighlight, MarkedString, TextDocument, CancellationToken, Position, Range } from 'vscode';
import { EdiController } from './ediController';
import { Parser } from './parser';
import { Constants } from './constants'

export class EdiHighlightProvider implements DocumentHighlightProvider {

    private ediController: EdiController;
    private parser: Parser;

    constructor(ediController: EdiController) {
        this.ediController = ediController;
        this.parser = new Parser();
    }

    public async provideDocumentHighlights(document: TextDocument, position: Position, token: CancellationToken): Promise<DocumentHighlight[]> {

        let text = document.getText();

        let workIndex = 0;
        let lines = text.split(/\r?\n/).map((x, line) => {
            let currentIndex = workIndex;
            workIndex += x.length;
            return new LineIndex(x.length, line, currentIndex);
        });

        let segments = this.parser.ParseSegments(text);

        let realPosition = lines[position.line].startIndex + position.character;

        let selectedSegment = segments.find(x => realPosition >= x.startIndex && realPosition <= x.endIndex);

        let startLine = lines.reverse().find(x => x.startIndex <= selectedSegment.startIndex);
        let endLine = lines.find(x => x.startIndex + x.length >= selectedSegment.endIndex);

        console.log(startLine.line, endLine.line);


        // TODO handle multiple lines        
        return [new DocumentHighlight(new Range(new Position(0, selectedSegment.startIndex), new Position(0, selectedSegment.endIndex)))];
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
