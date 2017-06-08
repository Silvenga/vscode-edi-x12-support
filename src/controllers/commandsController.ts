import { window, TextEditor, Range, ExtensionContext, commands, QuickPickItem, Selection, Position } from 'vscode';
import { Constants } from '../constants'
import { Parser, EdiSegment, EdiElement, ElementType } from '../parser'
import { EdiFile } from '../ediFile'

export class CommandsController implements Disposable {

    public bind(context: ExtensionContext) {
        context.subscriptions.push(this);
        context.subscriptions.push(commands.registerCommand('edi-x12-support.prettify', () => this.prettify()));
        context.subscriptions.push(commands.registerCommand('edi-x12-support.uglify', () => this.uglify()));
        context.subscriptions.push(commands.registerCommand('edi-x12-support.goto', () => this.goto()));
    }

    private setLanguage() {
        // https://github.com/Microsoft/vscode/issues/1800
        // window.activeTextEditor.document.languageId = ""
    }

    public prettify() {

        let parser = new Parser();
        let document = window.activeTextEditor.document.getText();
        let result = parser.parseHeader(document);
        if (!result.isValid) {
            window.showErrorMessage("No ISA header found.");
            return;
        }

        let segments = parser.parseSegments(document, result.configuration);
        let text = segments.join("\n");

        window.activeTextEditor.edit(builder => {
            let start = window.activeTextEditor.document.positionAt(segments[0].startIndex);
            let end = window.activeTextEditor.document.positionAt(segments[segments.length - 1].endIndex);
            builder.replace(new Range(start, end), text);
        })
    }

    public uglify() {

        let parser = new Parser();
        let document = window.activeTextEditor.document.getText();

        let result = parser.parseHeader(document);
        if (result.isValid) {
            window.showErrorMessage("No ISA header found.");
            return;
        }
        let segments = parser.parseSegments(document, result.configuration);
        let text = segments.join("");

        window.activeTextEditor.edit(builder => {
            let start = window.activeTextEditor.document.positionAt(segments[0].startIndex);
            let end = window.activeTextEditor.document.positionAt(segments[segments.length - 1].endIndex);
            builder.replace(new Range(start, end), text);
        })
    }

    public async goto() {

        let parser = new Parser();
        let document = window.activeTextEditor.document.getText();

        let result = parser.parseHeader(document);
        if (!result.isValid) {
            window.showErrorMessage("No ISA header found.");
            return;
        }
        let doc = EdiFile.create(document);
        let segments = parser.parseSegments(document, result.configuration);

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

        let anchor = doc.indexToPosition(pick.element.startIndex);
        let active = doc.indexToPosition(pick.element.endIndex);

        if (pick.element.type == ElementType.segmentId) {
            active = doc.indexToPosition(pick.segment.endIndex);
        }
        
        window.activeTextEditor.selections = [new Selection(new Position(anchor.line, anchor.character), new Position(active.line, active.character))]
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

    constructor(segment: EdiSegment, element: EdiElement, index: number) {
        this.segment = segment;
        this.element = element;
        this.label = segment.id + element.name;
        this.description = `:${index}`;
        this.index = index;
    }
}