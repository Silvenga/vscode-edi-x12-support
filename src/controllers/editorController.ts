import { injectable } from 'inversify';
import { StatusBarAlignment, StatusBarItem, TextDocument, TextEditor, window, workspace } from 'vscode';

import { Parser } from '../parser';
import { Configuration } from './../configuration';
import { IConfiguration } from './../interfaces/configuration';
import { IDisposable } from './../interfaces/disposable';

@injectable()
export class EditorController implements IDisposable {

    private _parser: Parser;
    private _statusBarItem: StatusBarItem;
    private _configuration: IConfiguration;

    public constructor(parser: Parser, configuration: Configuration) {

        this._parser = parser;
        this._configuration = configuration;

        // Prepare messing
        this._statusBarItem = this.createStatusBar();
        this.onDidChangeActiveTextEditor(window.activeTextEditor);

        // Attach events
        window.onDidChangeActiveTextEditor((params) => this.onDidChangeActiveTextEditor(params));
        workspace.onDidChangeTextDocument((params) => this.onDidChangeTextDocument(params.document));
    }

    public setStatus(message: string, tooltip: string = 'EDI Extension Status', hasSuccess = false) {
        this._statusBarItem.text = message;
        this._statusBarItem.tooltip = tooltip;
        this._statusBarItem.color = hasSuccess ? null : '#FFEB3B';
    }

    private onDidChangeActiveTextEditor(textEditor: TextEditor) {

        if (textEditor != null && textEditor.document.languageId === this._configuration.languageId) {
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
        if (document.languageId === this._configuration.languageId) {
            let result = this._parser.parseHeader(document.getText());
            if (!result.isValid) {
                this.setStatus('No Valid ISA Header', result.errorMessage, false);
            } else {
                this.setStatus('Valid ISA Header', result.configuration.toString(), true);
            }
        }
    }

    private documentActive(textEditor: TextEditor) {
        console.log(`EDI Doc - ${textEditor.document.fileName}`);
        this._statusBarItem.show();
    }

    private documentInactive(textEditor: TextEditor) {
        console.log('EDI doc Inactive');
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