import { Configuration } from './../configuration';
import { injectable, inject } from 'inversify';
import { Range, window, languages } from 'vscode';

import { logExceptions } from '../decorators/logExceptions';
import { EdiSegment, Parser } from '../parser';
import { ICommandable } from './../interfaces/commandable';
import { EdiDocumentConfiguration } from './../parser';

@injectable()
export class ConvertSeparatorsCommand implements ICommandable {

    private _parser: Parser;
    private _configuration: Configuration;

    public name: string = 'edi-x12-support.convert-separators';

    public constructor(parser: Parser, @inject('IConfiguration') configuration: Configuration) {
        this._parser = parser;
        this._configuration = configuration;
    }

    @logExceptions
    // tslint:disable-next-line:no-any
    public async command(...args: Array<any>) {

        if (window.activeTextEditor == null) {
            return;
        }

        let document = window.activeTextEditor.document.getText();

        let result = this._parser.parseHeader(document);
        if (!result.isValid) {
            window.showErrorMessage('No ISA header found.');
            return;
        }
        let segments = this._parser.parseSegments(document, result.configuration);

        this.modifySeparators(result.configuration, this._parser.defaultConfiguration, segments);

        let text = segments.join('');

        await window.activeTextEditor.edit(builder => {
            let start = window.activeTextEditor.document.positionAt(segments[0].startIndex);
            let end = window.activeTextEditor.document.positionAt(segments[segments.length - 1].endIndex);
            builder.replace(new Range(start, end), text);
        });

        languages.setTextDocumentLanguage(window.activeTextEditor.document, this._configuration.languageId);
    }

    private modifySeparators(oldConfig: EdiDocumentConfiguration, newConfig: EdiDocumentConfiguration, segments: Array<EdiSegment>): void {

        for (let segment of segments) {
            for (let element of segment.elements) {
                switch (element.separator) {
                    case oldConfig.componentSeparator:
                        element.separator = newConfig.componentSeparator;
                        break;
                    case oldConfig.dataSeparator:
                        element.separator = newConfig.dataSeparator;
                        break;
                    case oldConfig.repetitionSeparator:
                        element.separator = newConfig.repetitionSeparator;
                        break;
                    case '':
                        break;
                    default:
                        throw new Error('Unknown separator found.');
                }
            }
            segment.endingDelimiter = newConfig.segmentSeparator;
        }
    }

    public dispose() {
    }
}