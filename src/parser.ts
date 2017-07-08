import { injectable } from 'inversify';

@injectable()
export class Parser {

    public parseHeader(document: string): EdiDocumentConfigurationResult {

        // https://msdn.microsoft.com/en-us/library/bb259967(v=bts.20).aspx

        let configResult = new EdiDocumentConfigurationResult();
        configResult.isValid = false;

        var isaHeader = document.replace(/(^\s+)/g, '').slice(0, 106);

        let isIsa = isaHeader.slice(0, 3) == "ISA";
        if (!isIsa) {
            configResult.errorMessage = `No segment with the segment id of ISA found at the beginning of the document.`
            return configResult;
        }
        let standard = isaHeader.slice(84, 89);
        let dataSeparator = isaHeader.charAt(3);
        let componentSeparator = isaHeader.charAt(104);
        let segmentSeparator = isaHeader.charAt(105);
        if (segmentSeparator == "\r") {
            segmentSeparator = "\r\n";
            isaHeader += "\n"; // TODO HACK, handle without modifying header.
        }
        let repetitionSeparator = isaHeader.charAt(82);

        let config = new EdiDocumentConfiguration(standard, dataSeparator, componentSeparator, repetitionSeparator, segmentSeparator);
        configResult.configuration = config;

        var parseResult = this.parseSegments(isaHeader, config);

        // TODO Cleanup
        let isValid = false;
        if (parseResult.length == 1) {
            let result = parseResult[0];
            isValid = // TODO Too much?
                this.checkWithReason(configResult, () => result.elements.filter(x => x.type == ElementType.repeatingElement && x.name == "11").length == 1,
                    `ISA segment found, but found one or more repeating segments, should the repeating element separator really be '${repetitionSeparator}'?`)
                && this.checkWithReason(configResult, () => result.elements.filter(x => x.type == ElementType.componentElement && x.name == "16-2").length == 1,
                    `ISA segment found, but found one or more components, should the component element separator really be '${componentSeparator}'?`)
                && this.checkWithReason(configResult, () => result.elements.filter(x => x.type == ElementType.dataElement).length == 16,
                    `ISA segment found, but found an invalid number of data elements, should the data element separator really be '${dataSeparator}'?`)
                && this.checkWithReason(configResult, () => result.elements[1].value.length == 2, `ISA01 has an invalid length. ${result.elements[1].value.length} != 2`)
                && this.checkWithReason(configResult, () => result.elements[2].value.length == 10, `ISA02 has an invalid length. ${result.elements[2].value.length} != 10`)
                && this.checkWithReason(configResult, () => result.elements[3].value.length == 2, `ISA03 has an invalid length.`)
                && this.checkWithReason(configResult, () => result.elements[4].value.length == 10, `ISA04 has an invalid length.`)
                && this.checkWithReason(configResult, () => result.elements[5].value.length == 2, `ISA05 has an invalid length.`)
                && this.checkWithReason(configResult, () => result.elements[6].value.length == 15, `ISA06 has an invalid length.`)
                && this.checkWithReason(configResult, () => result.elements[7].value.length == 2, `ISA07 has an invalid length.`)
                && this.checkWithReason(configResult, () => result.elements[8].value.length == 15, `ISA08 has an invalid length.`)
                && this.checkWithReason(configResult, () => result.elements[9].value.length == 6, `ISA09 has an invalid length.`)
                && this.checkWithReason(configResult, () => result.elements[10].value.length == 4, `ISA10 has an invalid length.`)
                && this.checkWithReason(configResult, () => result.elements[11].value.length == 0, `Repeating separator does not exist in the correct element.`)
                && this.checkWithReason(configResult, () => result.elements[12].value.length == 0, `Repeating separator does not exist in the correct element.`)
                && this.checkWithReason(configResult, () => result.elements[13].value.length == 5, `ISA12 has an invalid length.`)
                && this.checkWithReason(configResult, () => result.elements[14].value.length == 9, `ISA13 has an invalid length.`)
                && this.checkWithReason(configResult, () => result.elements[15].value.length == 1, `ISA14 has an invalid length.`)
                && this.checkWithReason(configResult, () => result.elements[16].value.length == 1, `ISA15 has an invalid length.`)
                && this.checkWithReason(configResult, () => result.elements[17].value.length == 0, `Component separator does not exist in the correct element.`)
                && this.checkWithReason(configResult, () => result.elements[18].value.length == 0, `Component separator does not exist in the correct element.`)
                ;
        } else {
            configResult.errorMessage = `ISA segment found, but found element mismatches, should the data element separator really be '${dataSeparator}'?`;
        }

        configResult.isValid = isValid;
        if (!isValid) {
            console.log(configResult.errorMessage);
        }
        return configResult;
    }

    private checkWithReason(input: EdiDocumentConfigurationResult, tester: () => boolean, errorMessage: string): boolean {
        let result = tester();
        if (!result) {
            input.errorMessage = errorMessage;
        }
        return result;
    }

    public parseSegments(document: string, config: EdiDocumentConfiguration): EdiSegment[] {

        if (config == null) {
            config = DefaultConfiguration;
        }

        let regex = new RegExp(`\\b([\\s\\S]*?)(${config.segmentSeparator})`, "g");
        let results = this.parseRegex(regex, document, x => this.parseSegment(x[0], x.index, x.index + x[0].length, x[2], config));

        return results;
    }

    private parseSegment(segmentStr: string, startIndex: number, endIndex: number, endingDelimiter: string, config: EdiDocumentConfiguration): EdiSegment {

        let segment = new EdiSegment();
        segment.endingDelimiter = endingDelimiter;
        segment.startIndex = startIndex;
        segment.endIndex = endIndex;
        segment.length = endIndex - startIndex;

        let segmentsIds = this.parseRegex(new RegExp("^[\\w\\d]{2,3}", "g"),
            segmentStr,
            x => new EdiElement(ElementType.segmentId, x[0], startIndex + x.index, ""));

        let charSet = [
            `\\w`,
            `\\(`,
            `\\)`,
            `'`,
            `&`,
            `\``,
            `!`,
            ` `,
            `,`,
            `\\-`,
            `\\.`,
            `\\/`,
            `;`,
            `\\?`,
            `=`,
            `%`,
            `@`,
            `\\[`,
            `\\]`,
            `_`,
            `\\{`,
            `\\}`,
            `\\\\`,
            `\\|`,
            `<`,
            `>`,
            `#`,
            `\$`,
            `:`,
            `^`,
            `~`,
            `"`,
            `\\+`,
        ].filter(x => {
            return config.separators.indexOf(x.replace(/\\{1}/, "")) == -1; // Remove first \
        });

        let dataRegex = `[${charSet.join("")}]*`;

        let dataElements = this.parseRegex(new RegExp(`(${this.escapeCharRegex(config.dataSeparator)})(${dataRegex})`, "g"),
            segmentStr,
            x => new EdiElement(ElementType.dataElement, x[2], startIndex + x.index + 1, x[1]));
        let repeatingElements = this.parseRegex(new RegExp(`(${this.escapeCharRegex(config.repetitionSeparator)})(${dataRegex})`, "g"),
            segmentStr,
            x => new EdiElement(ElementType.repeatingElement, x[2], startIndex + x.index + 1, x[1]));
        let componentElements = this.parseRegex(new RegExp(`(${this.escapeCharRegex(config.componentSeparator)})(${dataRegex})`, "g"),
            segmentStr,
            x => new EdiElement(ElementType.componentElement, x[2], startIndex + x.index + 1, x[1]));

        segment.elements = segmentsIds.concat(dataElements, repeatingElements, componentElements).sort((a, b) => a.startIndex - b.startIndex);

        let firstElement = segment.elements[0];
        if (firstElement != null && firstElement.type == ElementType.segmentId) {
            segment.id = firstElement.value;
        }

        let elementIndex = -1;
        let componentIndex = 2;
        for (let index = 0; index < segment.elements.length; index++) {
            let element = segment.elements[index];

            if (element.type == ElementType.dataElement || element.type == ElementType.segmentId) {
                elementIndex++;
                componentIndex = 2;
            }

            if (elementIndex != 0) {
                let elementName = this.pad(elementIndex, 2);

                if (element.type == ElementType.componentElement) {
                    elementName += `-${componentIndex}`;
                    componentIndex++;
                }

                element.name = elementName;
            } else {
                element.name = "";
            }
        }

        return segment;
    }

    private escapeCharRegex(str: string): string {
        // http://stackoverflow.com/a/3561711
        return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    }

    private parseRegex<T>(exp: RegExp, str: string, selector: (match: RegExpExecArray) => T): T[] {
        let results: T[] = [];
        let match: RegExpExecArray;
        while ((match = exp.exec(str)) != null) {
            results.push(selector(match));
        }
        return results;
    }

    // http://stackoverflow.com/a/10073788
    private pad(n: number, width: number, z: string = '0') {
        let nStr = n + '';
        return nStr.length >= width ? nStr : new Array(width - nStr.length + 1).join(z) + nStr;
    }
}

export class EdiSegment {

    public startIndex: number;
    public endIndex: number;

    public length: number;

    public id: string;

    public elements: EdiElement[];

    public endingDelimiter: string;

    public toString() {
        return this.elements.join("") + this.endingDelimiter;
    }
}

export enum ElementType {
    segmentId = <any>"Segment Id",
    dataElement = <any>"Data Element",
    repeatingElement = <any>"Repeating Element",
    componentElement = <any>"Component Element"
}

export class EdiElement {

    public type: ElementType;
    public value: string;
    public startIndex: number;

    public separator: string;

    public endIndex: number;

    public name: string;

    constructor(type: ElementType, value: string, startIndex: number, separator: string) {
        this.type = type;
        this.value = value;
        this.startIndex = startIndex;
        this.endIndex = startIndex + value.length;
        this.separator = separator;
    }

    public toString() {
        return this.separator + this.value;
    }
}

export class EdiDocumentConfigurationResult {
    public isValid: boolean;
    public errorMessage: string;
    public configuration: EdiDocumentConfiguration;
}

export class EdiDocumentConfiguration {

    public controlVersion: string;
    public dataSeparator: string;
    public componentSeparator: string;
    public repetitionSeparator: string;
    public segmentSeparator: string;

    constructor(controlVersion: string, dataSeparator: string, componentSeparator: string, repetitionSeparator: string, segmentSeparator: string) {
        this.controlVersion = controlVersion;
        this.dataSeparator = dataSeparator;
        this.componentSeparator = componentSeparator;
        this.repetitionSeparator = repetitionSeparator;
        this.segmentSeparator = segmentSeparator;
    }

    public get separators(): string[] {
        return [
            this.dataSeparator,
            this.componentSeparator,
            this.repetitionSeparator,
            this.segmentSeparator
        ];
    }

    public toString(): string {
        return this.humanReadableWhitespace(
            (""
                + `Control Version: '${this.controlVersion}'\n`
                + `Data Separator: '${this.dataSeparator}'\n`
                + `Component Separator: '${this.componentSeparator}'\n`
                + `Repetition Separator: '${this.repetitionSeparator}'\n`
                + `Segment Separator: '${this.segmentSeparator}'\n`
            ));
    }

    private humanReadableWhitespace(input: string) {
        return input.replace(/'\r?\n'/g, "'<new line>'")
            .replace(/' '/g, "'<space>'")
            .replace(/'\t'/g, "'<tab>'")
            ;
    }
}

export const DefaultConfiguration = new EdiDocumentConfiguration("", "*", ":", ">", "~");