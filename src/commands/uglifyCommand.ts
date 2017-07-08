import { ICommandable } from './../interfaces/commandable';
import { window, Range } from 'vscode';
import { Parser } from '../parser'
import { injectable } from "inversify";

@injectable()
export class UglifyCommand implements ICommandable {
    private _parser: Parser;

    name: string = "edi-x12-support.uglify";

    constructor(parser: Parser) {
        this._parser = parser;
    }

    command(...args: any[]) {
        let document = window.activeTextEditor.document.getText();

        let result = this._parser.parseHeader(document);
        if (!result.isValid) {
            window.showErrorMessage("No ISA header found.");
            return;
        }
        let segments = this._parser.parseSegments(document, result.configuration);
        let text = segments.join("");

        window.activeTextEditor.edit(builder => {
            let start = window.activeTextEditor.document.positionAt(segments[0].startIndex);
            let end = window.activeTextEditor.document.positionAt(segments[segments.length - 1].endIndex);
            builder.replace(new Range(start, end), text);
        })
    }

}