import { injectable } from 'inversify';
import {
    DecorationRenderOptions,
    Range,
    TextDocument,
    TextEditor,
    TextEditorDecorationType,
    window,
    workspace,
} from 'vscode';

import { Parser } from '../parser';
import { Configuration } from './../configuration';
import { IConfiguration } from './../interfaces/configuration';
import { IDisposable } from './../interfaces/disposable';

@injectable()
export class DecorationController implements IDisposable {

    private _parser: Parser;
    private _decorations: Decorations;
    private _configuration: IConfiguration;

    public constructor(parser: Parser, configuration: Configuration) {

        this._parser = parser;
        this._configuration = configuration;

        // Prepare messing
        this._decorations = this.mapDecorations();
        this.onDidChangeActiveTextEditor(window.activeTextEditor);

        // Attach events
        window.onDidChangeActiveTextEditor((params) => this.onDidChangeActiveTextEditor(params));
        workspace.onDidChangeTextDocument((params) => this.onDidChangeTextDocument(window.activeTextEditor, params.document));
    }

    private onDidChangeActiveTextEditor(textEditor: TextEditor) {

        if (textEditor == null) {
            return;
        }

        this.onDidChangeTextDocument(textEditor, textEditor.document);
    }

    private onDidChangeTextDocument(editor: TextEditor, document: TextDocument) {
        if (document.languageId === this._configuration.languageId && this._decorations != null) {
            let result = this._parser.parseHeader(document.getText());
            if (result.isValid) {
                let edi = this._parser.parseSegments(document.getText(), result.configuration);

                let isaSegments = edi.filter(x => ['ISA', 'IEA'].indexOf(x.id) > -1).map<Range>(x => new Range(document.positionAt(x.startIndex), document.positionAt(x.endIndex)));
                editor.setDecorations(this._decorations.test, isaSegments);
            }
        }
    }

    public dispose() {
    }

    private mapDecorations(): Decorations {
        const decoration = new Decorations();
        for (let key in decoration) {
            if (decoration.hasOwnProperty(key) && !key.endsWith('Options')) {

                let options = decoration[`_${key}Options`] as DecorationRenderOptions;
                if (options == null) {
                    throw new Error(`No options found for ${key}.`);
                }

                let decorationType = window.createTextEditorDecorationType(options);
                decoration[key] = decorationType;
            }
        }

        return decoration;
    }
}

class Decorations {
    public test: TextEditorDecorationType = null;
    private _testOptions: DecorationRenderOptions = { backgroundColor: 'rgba(255, 241, 118, 0.40)' };
}