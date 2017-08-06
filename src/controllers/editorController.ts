import { inject, injectable } from 'inversify';
import { StatusBarAlignment, StatusBarItem, TextDocument, TextEditor, window, workspace } from 'vscode';

import { logExceptions } from '../decorators/logExceptions';
import { Parser } from '../parser';
import { IConfiguration } from './../interfaces/configuration';
import { IDisposable } from './../interfaces/disposable';
import { Telemetry } from './../telemetry';

@injectable()
export class EditorController implements IDisposable {

    private _parser: Parser;
    private _statusBarItem: StatusBarItem;
    private _configuration: IConfiguration;
    private _telemetry: Telemetry;

    public constructor(parser: Parser, @inject('IConfiguration') configuration: IConfiguration, telemetry: Telemetry) {

        this._parser = parser;
        this._configuration = configuration;
        this._telemetry = telemetry;

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

    @logExceptions
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

    @logExceptions
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

        this._telemetry.captureEvent('Document Active', textEditor.document.fileName);
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