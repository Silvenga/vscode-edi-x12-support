import { DocumentHighlightProvider, DocumentHighlight, MarkedString, TextDocument, CancellationToken, Position, Range } from 'vscode';

export class EdiHighlightProvider implements DocumentHighlightProvider {
    public async provideDocumentHighlights(document: TextDocument, position: Position, token: CancellationToken): Promise<DocumentHighlight[]> {

        let wordRange = document.getWordRangeAtPosition(position);
        let selectedVariableName = document.getText(wordRange);
        console.log(document, position, wordRange, selectedVariableName);

        return [new DocumentHighlight(new Range(new Position(0, 0), position))];
    }
}
