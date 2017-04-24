import { HoverProvider, Hover, MarkedString, TextDocument, CancellationToken, Position } from 'vscode';

export class EdiHoverProvider implements HoverProvider {

    public async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover> {

        let wordRange = document.getWordRangeAtPosition(position);
        let selectedVariableName = document.getText(wordRange);
        console.log(document, position, wordRange, selectedVariableName);

        let lineRange = document.lineAt(position);
        if (!wordRange
            || wordRange.start.character < 2
            || wordRange.end.character > lineRange.range.end.character - 1
            || lineRange.text[wordRange.start.character - 1] !== '{'
            || lineRange.text[wordRange.start.character - 2] !== '{'
            || lineRange.text[wordRange.end.character] !== '}'
            || lineRange.text[wordRange.end.character + 1] !== '}') {
            // not a custom variable syntax
            return;
        }


        return;
    }
}