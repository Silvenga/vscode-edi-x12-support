import { EdiSegment } from './../parser';
import { DocumentSymbolProvider, TextDocument, CancellationToken, Position, Range, SymbolInformation, SymbolKind, Location } from 'vscode';
import { EditorController } from '../controllers/editorController';
import { Parser, ElementType } from '../parser';
import { Constants } from '../constants'

export class EdiDocumentSymbolProvider implements DocumentSymbolProvider {

    private ediController: EditorController;
    private parser: Parser;

    constructor(ediController: EditorController) {
        this.ediController = ediController;
        this.parser = new Parser();
    }

    public async provideDocumentSymbols(document: TextDocument, token: CancellationToken): Promise<SymbolInformation[]> {

        let text = document.getText();

        let result = this.parser.parseHeader(text);
        let segments = this.parser.parseSegments(text, result.configuration);

        let segmentSymbols = segments
            .map<SymbolInformation[]>(segment => this.createSymbolsForSegment(segment, document))
            .reduce((a, b) => a.concat(b));

        return [].concat(segmentSymbols);
    }

    private createSymbolsForSegment(segment: EdiSegment, document: TextDocument): SymbolInformation[] {

        let symbolMap = (x: ElementType): SymbolKind => {
            switch (x) {
                case ElementType.componentElement:
                    return SymbolKind.Object
                case ElementType.dataElement:
                    return SymbolKind.Constant
                case ElementType.repeatingElement:
                    return SymbolKind.Array
                case ElementType.segmentId:
                    return SymbolKind.Variable
            }
        }

        // let root = new SymbolInformation(segment.id, SymbolKind.Class, new Range(document.positionAt(segment.startIndex), document.positionAt(segment.endIndex)), null, segment.id);

        let elements = segment.elements.map<SymbolInformation>(element =>
            new SymbolInformation(segment.id + element.name, symbolMap(element.type), new Range(document.positionAt(element.startIndex), document.positionAt(element.endIndex)), null, segment.id)
        );

        return [].concat(elements);
    }
}