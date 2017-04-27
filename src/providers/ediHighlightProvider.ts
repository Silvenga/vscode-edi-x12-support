import { DocumentHighlightProvider, DocumentHighlight, MarkedString, TextDocument, CancellationToken, Position, Range, DocumentHighlightKind } from 'vscode';
import { EditorController } from '../controllers/editorController';
import { Parser } from '../parser';
import { Constants } from '../constants'
import { EdiFile } from '../ediFile'

export class EdiHighlightProvider implements DocumentHighlightProvider {

    private ediController: EditorController;
    private parser: Parser;

    constructor(ediController: EditorController) {
        this.ediController = ediController;
        this.parser = new Parser();
    }

    public async provideDocumentHighlights(document: TextDocument, position: Position, token: CancellationToken): Promise<DocumentHighlight[]> {

        let text = document.getText();
        let doc = EdiFile.create(text);

        let segments = this.parser.parseSegments(text);
        let realPosition = doc.positionToIndex(position.line, position.character);
        let selectedSegment = segments.find(x => realPosition >= x.startIndex && realPosition <= x.endIndex);

        let startLine = doc.indexToPosition(selectedSegment.startIndex);
        let endLine = doc.indexToPosition(selectedSegment.endIndex);

        return [new DocumentHighlight(new Range(new Position(startLine.line, startLine.character), new Position(endLine.line, endLine.character)), DocumentHighlightKind.Read)];
    }
}