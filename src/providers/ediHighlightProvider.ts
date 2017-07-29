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
import { logExceptions } from '../decorators/logExceptions';
import { IDisposable } from '../interfaces/disposable';
import { Parser } from '../parser';
import { IProvidable } from './../interfaces/providable';

@injectable()
export class EdiHighlightProvider implements DocumentHighlightProvider, IProvidable {

    private _ediController: EditorController;
    private _parser: Parser;

    public constructor(ediController: EditorController, parser: Parser) {
        this._ediController = ediController;
        this._parser = parser;
    }

    @logExceptions
    public async provideDocumentHighlights(document: TextDocument, position: Position, token: CancellationToken): Promise<Array<DocumentHighlight>> {

        let text = document.getText();

        let result = this._parser.parseHeader(text);
        let segments = this._parser.parseSegments(text, result.configuration);
        let realPosition = document.offsetAt(new Position(position.line, position.character));
        let selectedSegment = segments.find(x => realPosition >= x.startIndex && realPosition <= x.endIndex);

        let startLine = document.positionAt(selectedSegment.startIndex);
        let endLine = document.positionAt(selectedSegment.endIndex);

        return [new DocumentHighlight(new Range(new Position(startLine.line, startLine.character), new Position(endLine.line, endLine.character)), DocumentHighlightKind.Read)];
    }

    public registerFunction(): (languageId: string) => IDisposable {
        return (languageId) => languages.registerDocumentHighlightProvider(languageId, this);
    }

    public dispose() {
    }
}