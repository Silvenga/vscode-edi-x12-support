import { injectable } from 'inversify';
import { CancellationToken, FormattingOptions, TextEdit, languages, Range, window, TextDocument, DocumentFormattingEditProvider } from 'vscode';

import { EditorController } from '../controllers/editorController';
import { logExceptions } from '../decorators/logExceptions';
import { IDisposable } from '../interfaces/disposable';
import { Parser } from '../parser';
import { IProvidable } from './../interfaces/providable';

@injectable()
export class EdiPrettifyProvider implements DocumentFormattingEditProvider, IProvidable{
    private _parser: Parser;

    public name: string = 'edi-x12-support.prettify';

    public constructor(parser: Parser) {
        this._parser = parser;
    }

    @logExceptions
    public async provideDocumentFormattingEdits(document: TextDocument, options: FormattingOptions, token: CancellationToken): Promise<Array<TextEdit>>{
        let d = document.getText();
        let result = this._parser.parseHeader(d);
        if (!result.isValid) {
            window.showErrorMessage('No ISA header found.');
            return;
        }

        let segments = this._parser.parseSegments(d, result.configuration);
        let text = segments.join('\n');

        window.activeTextEditor.edit(builder => {
            let start = window.activeTextEditor.document.positionAt(segments[0].startIndex);
            let end = window.activeTextEditor.document.positionAt(segments[segments.length - 1].endIndex);
            builder.replace(new Range(start, end), text);
        });
    }

    public registerFunction(): (languageId: string) => IDisposable {
        return (languageId) => languages.registerDocumentFormattingEditProvider(languageId, this);
    }

    public dispose() {
    }
}