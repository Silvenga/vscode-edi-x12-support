import { DocumentHighlightProvider, DocumentHighlight, MarkedString, TextDocument, CancellationToken, Position, Range } from 'vscode';
import { EdiController } from './ediController';
import { Parser } from './parser';

export class EdiHighlightProvider implements DocumentHighlightProvider {

    private ediController: EdiController;
    private parser: Parser;

    constructor(ediController: EdiController) {
        this.ediController = ediController;
        this.parser = new Parser();
    }

    public async provideDocumentHighlights(document: TextDocument, position: Position, token: CancellationToken): Promise<DocumentHighlight[]> {

        let text = document.getText();

        var segments = this.parser.ParseSegments(text);

        var selectedSegment = segments.find(x => position.character >= x.startIndex && position.character <= x.endIndex);

        // TODO handle multiple lines        
        return [new DocumentHighlight(new Range(new Position(0, selectedSegment.startIndex), new Position(0, selectedSegment.endIndex)))];
    }
}
