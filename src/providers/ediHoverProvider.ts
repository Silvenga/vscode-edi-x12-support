import { injectable } from 'inversify';
import { CancellationToken, Hover, HoverProvider, languages, Position, TextDocument } from 'vscode';

import { EditorController } from '../controllers/editorController';
import { IDisposable } from '../interfaces/disposable';
import { Parser } from '../parser';
import { IProvidable } from './../interfaces/providable';

@injectable()
export class EdiHoverProvider implements HoverProvider, IProvidable {

    private _ediController: EditorController;
    private _parser: Parser;

    public constructor(ediController: EditorController, parser: Parser) {
        this._ediController = ediController;
        this._parser = parser;
    }

    public async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover> {

        let text = document.getText();
        let config = this._parser.parseHeader(text);

        let segments = this._parser.parseSegments(text, config.configuration);
        let realPosition = document.offsetAt(new Position(position.line, position.character));
        let selectedSegment = segments.find(x => realPosition >= x.startIndex && realPosition <= x.endIndex);

        let selectedElementIndex = selectedSegment.elements.findIndex(x => realPosition >= x.startIndex && realPosition <= x.endIndex);

        if (selectedElementIndex != -1) {
            let selectedElement = selectedSegment.elements[selectedElementIndex];

            let context = '';
            for (let i = 0, len = selectedSegment.elements.length; i < len; i++) {
                let el = selectedSegment.elements[i];
                let element = (el.separator + el.value);
                context += element;
            }
            context += selectedSegment.endingDelimiter;

            return new Hover(
                `**${selectedSegment.id}**${selectedElement.name} (_${selectedElement.type}_)\n\n` +
                '```edi\n' +
                `${context}\n` +
                '```'
            );
        }

        return null;
    }

    public registerFunction(): (languageId: string) => IDisposable {
        return (languageId) => languages.registerHoverProvider(languageId, this);
    }

    public dispose() {
    }
}