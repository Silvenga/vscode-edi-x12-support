import { HoverProvider, Hover, MarkedString, TextDocument, CancellationToken, Position, window } from 'vscode';
import { EditorController } from '../controllers/editorController';
import { Parser, EdiSegment } from '../parser';
import { Constants } from '../constants';
import { injectable } from "inversify";

@injectable()
export class EdiHoverProvider implements HoverProvider {

    private ediController: EditorController;
    private parser: Parser;

    constructor(ediController: EditorController) {
        this.ediController = ediController;
        this.parser = new Parser();
    }

    public async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover> {

        let text = document.getText();
        let config = this.parser.parseHeader(text);

        let segments = this.parser.parseSegments(text, config.configuration);
        let realPosition = document.offsetAt(new Position(position.line, position.character));
        let selectedSegment = segments.find(x => realPosition >= x.startIndex && realPosition <= x.endIndex);

        let selectedElementIndex = selectedSegment.elements.findIndex(x => realPosition >= x.startIndex && realPosition <= x.endIndex);

        if (selectedElementIndex != -1) {
            let selectedElement = selectedSegment.elements[selectedElementIndex];

            let context = "";
            for (let i = 0, len = selectedSegment.elements.length; i < len; i++) {
                let el = selectedSegment.elements[i];
                let element = (el.separator + el.value).replace("*", "\\*");
                let isSelected = i == selectedElementIndex;
                context += isSelected ? `**${element}**` : element;
            }
            context += selectedSegment.endingDelimiter;

            return new Hover(
                `**${selectedSegment.id}**${selectedElement.name} (_${selectedElement.type}_)\n\n` +
                `${context}`
            );
        }

        return null;
    }
}