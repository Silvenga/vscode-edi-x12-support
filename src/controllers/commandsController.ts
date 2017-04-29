import { window, TextEditor, Range, ExtensionContext, commands } from 'vscode';
import { Constants } from '../constants'
import { Parser, } from '../parser'

export class CommandsController implements Disposable {

    public bind(context: ExtensionContext) {
        context.subscriptions.push(this);
        context.subscriptions.push(commands.registerCommand('edi-x12-support.prettify', () => this.prettify()));
        context.subscriptions.push(commands.registerCommand('edi-x12-support.uglify', () => this.uglify()));
    }

    private setLanguage() {
        // https://github.com/Microsoft/vscode/issues/1800
        // window.activeTextEditor.document.languageId = ""
    }

    public prettify() {

        let parser = new Parser();
        let document = window.activeTextEditor.document.getText();
        var config = parser.parseHeader(document);
        if (config == null) {
            window.showErrorMessage("No ISA header found.");
            return;
        }

        let segments = parser.parseSegments(document, config);
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

        var config = parser.parseHeader(document);
        if (config == null) {
            window.showErrorMessage("No ISA header found.");
            return;
        }
        let segments = parser.parseSegments(document, config);
        let text = segments.join("");

        window.activeTextEditor.edit(builder => {
            let start = window.activeTextEditor.document.positionAt(segments[0].startIndex);
            let end = window.activeTextEditor.document.positionAt(segments[segments.length - 1].endIndex);
            builder.replace(new Range(start, end), text);
        })
    }

    public dispose() {
    }
}