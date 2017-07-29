import { injectable } from 'inversify';
import { Position, QuickPickItem, Selection, window } from 'vscode';

import { logExceptions } from '../decorators/logExceptions';
import { EdiElement, EdiSegment, ElementType, Parser } from '../parser';
import { ICommandable } from './../interfaces/commandable';

@injectable()
export class GotoCommand implements ICommandable {
    private _parser: Parser;

    public name: string = 'edi-x12-support.goto';

    public constructor(parser: Parser) {
        this._parser = parser;
    }

    @logExceptions
    // tslint:disable-next-line:no-any
    public async command(...args: Array<any>) {

        let document = window.activeTextEditor.document;

        let text = document.getText();

        let result = this._parser.parseHeader(text);
        if (!result.isValid) {
            window.showErrorMessage('No ISA header found.');
            return;
        }
        let segments = this._parser.parseSegments(text, result.configuration);

        let i = 0;
        let picks = segments.map(x => {
            if (x.id == 'ISA') {
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

        window.activeTextEditor.selections = [new Selection(new Position(anchor.line, anchor.character), new Position(active.line, active.character))];
    }

    public dispose() {
    }
}

class QuickPick implements QuickPickItem {

    public label: string;
    public description: string;
    public detail: string;

    public segment: EdiSegment;
    public element: EdiElement;

    public index: number;

    public constructor(segment: EdiSegment, element: EdiElement, index: number) {
        this.segment = segment;
        this.element = element;
        this.label = segment.id + element.name;
        this.description = `:${index}`;
        this.index = index;
    }
}