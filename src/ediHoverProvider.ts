import { HoverProvider, Hover, MarkedString, TextDocument, CancellationToken, Position, window } from 'vscode';
import { EdiController } from './ediController';
import { Parser } from './parser';
import { Constants } from './constants'
import { Document } from './document'

export class EdiHoverProvider implements HoverProvider {

    private ediController: EdiController;
    private parser: Parser;

    constructor(ediController: EdiController) {
        this.ediController = ediController;
        this.parser = new Parser();
    }

    public async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover> {

        let text = document.getText();
        let doc = Document.create(text);

        let segments = this.parser.ParseSegments(text);
        let realPosition = doc.positionToIndex(position.line, position.character);
        let selectedSegment = segments.find(x => realPosition >= x.startIndex && realPosition <= x.endIndex);
        
        var selectedElementIndex = selectedSegment.elements.findIndex(x => realPosition >= x.startIndex && realPosition <= x.endIndex)
        if (selectedElementIndex != -1) {
            let selectedElement = selectedSegment.elements[selectedElementIndex];

            let context = "";
            for (var i = 0, len = selectedSegment.elements.length; i < len; i++) {
                var el = selectedSegment.elements[i];
                let element = (el.separator + el.value).replace("*", "\\*");
                let isSelected = i == selectedElementIndex;
                context += isSelected ? `**${element}**` : element;
            }

            return new Hover(
                `**${selectedSegment.id}**${selectedElementIndex == 0 ? "" : this.pad(selectedElementIndex, 2)} (_${selectedElement.type}_)\n\n` +
                `${context}`
            );
        }

        return null;
    }

    // http://stackoverflow.com/a/10073788
    private pad(n: number, width: number, z: string = '0') {
        let nStr = n + '';
        return nStr.length >= width ? nStr : new Array(width - nStr.length + 1).join(z) + nStr;
    }
}