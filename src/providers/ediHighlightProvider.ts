import { DocumentHighlightProvider, DocumentHighlight, MarkedString, TextDocument, CancellationToken, Position, Range, DocumentHighlightKind } from 'vscode';
import { EditorController } from '../controllers/editorController';
import { Parser } from '../parser';
import { Constants } from '../constants';
import { provide } from "../container";

@provide(EdiHighlightProvider)
export class EdiHighlightProvider implements DocumentHighlightProvider {

    private ediController: EditorController;
    private parser: Parser;

    constructor(ediController: EditorController) {
        this.ediController = ediController;
        this.parser = new Parser();
    }

    public async provideDocumentHighlights(document: TextDocument, position: Position, token: CancellationToken): Promise<DocumentHighlight[]> {

        let text = document.getText();

        let result = this.parser.parseHeader(text);
        let segments = this.parser.parseSegments(text, result.configuration);
        let realPosition = document.offsetAt(new Position(position.line, position.character));
        let selectedSegment = segments.find(x => realPosition >= x.startIndex && realPosition <= x.endIndex);

        let startLine = document.positionAt(selectedSegment.startIndex);
        let endLine = document.positionAt(selectedSegment.endIndex);

        return [new DocumentHighlight(new Range(new Position(startLine.line, startLine.character), new Position(endLine.line, endLine.character)), DocumentHighlightKind.Read)];
    }
}