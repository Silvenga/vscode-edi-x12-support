import { ICommandable } from './../interfaces/commandable';
import { window, Range, QuickPickItem, Position, Selection } from 'vscode';
import { Parser, EdiSegment, EdiElement, ElementType } from '../parser'
import { injectable } from "inversify";

@injectable()
export class GotoCommand implements ICommandable {
    private _parser: Parser;

    name: string = "edi-x12-support.goto";

    constructor(parser: Parser) {
        this._parser = parser;
    }

    async command(...args: any[]) {
        let document = window.activeTextEditor.document;

        let text = document.getText();

        let result = this._parser.parseHeader(text);
        if (!result.isValid) {
            window.showErrorMessage("No ISA header found.");
            return;
        }
        let segments = this._parser.parseSegments(text, result.configuration);

        let i = 0;
        let picks = segments.map(x => {
            if (x.id == "ISA") {
                i = 0;
            }
            i++;
            return x.elements.map(g => new QuickPick(x, g, i));
        }).reduce((a, b) => a.concat(b));


        let pick = await window.showQuickPick<QuickPick>(picks, { matchOnDescription: true });

        if (pick == null) {
            return;
        }

        let anchor = document.positionAt(pick.element.startIndex);
        let active = document.positionAt(pick.element.endIndex);

        if (pick.element.type == ElementType.segmentId) {
            active = document.positionAt(pick.segment.endIndex);
        }

        window.activeTextEditor.selections = [new Selection(new Position(anchor.line, anchor.character), new Position(active.line, active.character))]
    }
}

class QuickPick implements QuickPickItem {

    public label: string;
    public description: string;
    public detail: string;

    public segment: EdiSegment;
    public element: EdiElement;

    public index: number;

    constructor(segment: EdiSegment, element: EdiElement, index: number) {
        this.segment = segment;
        this.element = element;
        this.label = segment.id + element.name;
        this.description = `:${index}`;
        this.index = index;
    }
}