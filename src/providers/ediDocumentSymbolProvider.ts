import { injectable } from 'inversify';
import {
    CancellationToken,
    DocumentSymbolProvider,
    languages,
    Range,
    SymbolInformation,
    SymbolKind,
    TextDocument,
} from 'vscode';

import { EditorController } from '../controllers/editorController';
import { logExceptions } from '../decorators/logExceptions';
import { ElementType, Parser } from '../parser';
import { IDisposable } from './../interfaces/disposable';
import { IProvidable } from './../interfaces/providable';
import { EdiSegment } from './../parser';

@injectable()
export class EdiDocumentSymbolProvider implements DocumentSymbolProvider, IProvidable {

    private _ediController: EditorController;
    private _parser: Parser;

    public constructor(ediController: EditorController, parser: Parser) {
        this._ediController = ediController;
        this._parser = parser;
    }

    @logExceptions
    public async provideDocumentSymbols(document: TextDocument, token: CancellationToken): Promise<Array<SymbolInformation>> {

        let text = document.getText();

        let result = this._parser.parseHeader(text);
        let segments = this._parser.parseSegments(text, result.configuration);

        if (segments.length == 0) {
            return [];
        }

        let segmentSymbols = segments
            .map<Array<SymbolInformation>>(segment => this.createSymbolsForSegment(segment, document))
            .reduce((a, b) => a.concat(b));

        return [].concat(segmentSymbols);
    }

    private createSymbolsForSegment(segment: EdiSegment, document: TextDocument): Array<SymbolInformation> {

        let symbolMap = (x: ElementType): SymbolKind => {
            switch (x) {
                case ElementType.componentElement:
                    return SymbolKind.Object;
                case ElementType.dataElement:
                    return SymbolKind.Constant;
                case ElementType.repeatingElement:
                    return SymbolKind.Array;
                case ElementType.segmentId:
                    return SymbolKind.Variable;
            }
        };

        let elements = segment.elements.map<SymbolInformation>(element =>
            new SymbolInformation(segment.id + element.name, symbolMap(element.type), new Range(document.positionAt(element.startIndex), document.positionAt(element.endIndex)), null, segment.id)
        );

        return [].concat(elements);
    }

    public registerFunction(): (languageId: string) => IDisposable {
        return (languageId) => languages.registerDocumentSymbolProvider(languageId, this);
    }

    public dispose() {

    }
}