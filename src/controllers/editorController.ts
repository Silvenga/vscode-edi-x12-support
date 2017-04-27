import { StatusBarItem, StatusBarAlignment, window, TextEditor, Selection, Range, ExtensionContext, languages } from 'vscode';
import { Constants } from '../constants'
import { Parser } from '../parser'
import { EdiHoverProvider } from '../ediHoverProvider';
import { EdiHighlightProvider } from '../ediHighlightProvider';

export class EditorController implements Disposable {

    private _statusBarItem: StatusBarItem;

    public bind(context: ExtensionContext) {
        context.subscriptions.push(this);
        context.subscriptions.push(languages.registerHoverProvider(Constants.languageId, new EdiHoverProvider(this)))
        context.subscriptions.push(languages.registerDocumentHighlightProvider(Constants.languageId, new EdiHighlightProvider(this)));
    }

    public constructor() {
        this._statusBarItem = this.createStatusBar();
        this.onDidChangeActiveTextEditor(window.activeTextEditor);
        window.onDidChangeActiveTextEditor((params) => this.onDidChangeActiveTextEditor(params))
    }

    public setStatus(message: string) {
        this._statusBarItem.text = "EDI Status: " + message;
    }

    private onDidChangeActiveTextEditor(textEditor: TextEditor) {
        if (textEditor == null) {
            return;
        }
        if (textEditor.document.languageId === Constants.languageId) {
            this.documentActive(textEditor);
            this.setStatus("Active");
        } else {
            this.documentInactive(textEditor);
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
        let statusBar = window.createStatusBarItem(StatusBarAlignment.Left);
        statusBar.tooltip = 'EDI Extension Status';
        return statusBar;
    }

    public dispose() {
    }
}