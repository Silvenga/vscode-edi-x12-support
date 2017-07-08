import { injectable } from 'inversify';
import { StatusBarAlignment, StatusBarItem, TextDocument, TextEditor, window, workspace } from 'vscode';

import { Constants } from '../constants';
import { Parser } from '../parser';
import { IDisposable } from './../interfaces/disposable';

@injectable()
export class EditorController implements IDisposable {

    private _parser: Parser;
    private _statusBarItem: StatusBarItem;

    public constructor(parser: Parser) {

        this._parser = parser;

        // Prepare messing
        this._statusBarItem = this.createStatusBar();
        this.onDidChangeActiveTextEditor(window.activeTextEditor);

        // Attach events
        window.onDidChangeActiveTextEditor((params) => this.onDidChangeActiveTextEditor(params));
        workspace.onDidChangeTextDocument((params) => this.onDidChangeTextDocument(params.document));
    }

    public setStatus(message: string, tooltip: string = "EDI Extension Status") {
        this._statusBarItem.text = message;
        this._statusBarItem.tooltip = tooltip;
    }

    private onDidChangeActiveTextEditor(textEditor: TextEditor) {

        if (textEditor != null && textEditor.document.languageId === Constants.languageId) {
            this.documentActive(textEditor);
        } else {
            this.documentInactive(textEditor);
        }

        if (textEditor == null) {
            return;
        }

        this.onDidChangeTextDocument(textEditor.document);
    }

    private onDidChangeTextDocument(document: TextDocument) {
        if (document.languageId === Constants.languageId) {
            let result = this._parser.parseHeader(document.getText());
            if (!result.isValid) {
                this.setStatus("No Valid ISA Header", result.errorMessage);
            } else {
                this.setStatus("Valid ISA Header", result.configuration.toString());
            }
        }
    }

    private documentActive(textEditor: TextEditor) {
        console.log(`EDI Doc - ${textEditor.document.fileName}`);
        this._statusBarItem.show();
    }

    private documentInactive(textEditor: TextEditor) {
        console.log("EDI doc Inactive");
        this._statusBarItem.hide();
    }

    private createStatusBar(): StatusBarItem {
        let statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 100);
        statusBar.tooltip = 'EDI Extension Status';
        return statusBar;
    }

    public dispose() {
    }
}