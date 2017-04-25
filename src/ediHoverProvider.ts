import { HoverProvider, Hover, MarkedString, TextDocument, CancellationToken, Position, window } from 'vscode';
import { EdiController } from './ediController';
import { Parser } from './parser';

export class EdiHoverProvider implements HoverProvider {

    private ediController: EdiController;
    private parser: Parser;

    constructor(ediController: EdiController) {
        this.ediController = ediController;
        this.parser = new Parser();
    }

    public async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover> {

        let text = document.getText();

        var segments = this.parser.ParseSegments(text);

        var selectedSegment = segments.find(x => position.character >= x.startIndex && position.character <= x.endIndex);
        var selectedElementIndex = selectedSegment.elements.findIndex(x => position.character >= x.startIndex && position.character <= x.endIndex)
        if (selectedElementIndex != -1) {
            let selectedElement = selectedSegment.elements[selectedElementIndex];
            return new Hover(`**${selectedSegment.id}**${this.pad(selectedElementIndex, 2)}`);
        }

        return null;
    }

    // http://stackoverflow.com/a/10073788
    private pad(n: number, width: number, z: string = '0') {
        let nStr = n + '';
        return nStr.length >= width ? nStr : new Array(width - nStr.length + 1).join(z) + nStr;
    }
}