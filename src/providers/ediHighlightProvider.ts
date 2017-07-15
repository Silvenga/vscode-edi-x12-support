import { injectable } from 'inversify';
import {
    CancellationToken,
    DocumentHighlight,
    DocumentHighlightKind,
    DocumentHighlightProvider,
    languages,
    Position,
    Range,
    TextDocument,
} from 'vscode';

import { EditorController } from '../controllers/editorController';
import { Parser } from '../parser';
import { IProvidable } from './../interfaces/providable';

@injectable()
export class EdiHighlightProvider implements DocumentHighlightProvider, IProvidable {

    private ediController: EditorController;
    private parser: Parser;

    public constructor(ediController: EditorController, parser: Parser) {
        this.ediController = ediController;
        this.parser = parser;
    }

    public async provideDocumentHighlights(document: TextDocument, position: Position, token: CancellationToken): Promise<Array<DocumentHighlight>> {

        let text = document.getText();

        let result = this.parser.parseHeader(text);
        let segments = this.parser.parseSegments(text, result.configuration);
        let realPosition = document.offsetAt(new Position(position.line, position.character));
        let selectedSegment = segments.find(x => realPosition >= x.startIndex && realPosition <= x.endIndex);

        let startLine = document.positionAt(selectedSegment.startIndex);
        let endLine = document.positionAt(selectedSegment.endIndex);

        return [new DocumentHighlight(new Range(new Position(startLine.line, startLine.character), new Position(endLine.line, endLine.character)), DocumentHighlightKind.Read)];
    }

    public registerFunction(): (languageId: string) => void {
        return (languageId) => languages.registerDocumentHighlightProvider(languageId, this);
    }

    public dispose() {
    }
}