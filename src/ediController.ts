import { StatusBarItem, StatusBarAlignment, window, TextEditor } from 'vscode';

export class EdiController {

    private _statusBarItem: StatusBarItem;

    public constructor() {
        this._statusBarItem = this.createStatusBar();
        this.onDidChangeActiveTextEditor(window.activeTextEditor);
        window.onDidChangeActiveTextEditor((params) => this.onDidChangeActiveTextEditor(params))
    }

    private onDidChangeActiveTextEditor(textEditor: TextEditor) {
        if (textEditor == null) {
            return;
        }
        if (textEditor.document.languageId === "edi") {
            this.documentActive(textEditor);
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
        var statusBar = window.createStatusBarItem(StatusBarAlignment.Left);
        statusBar.tooltip = 'EDI Extension Status';
        statusBar.text = "EDI Status: ";
        return statusBar;
    }

    public dispose() {
    }
}