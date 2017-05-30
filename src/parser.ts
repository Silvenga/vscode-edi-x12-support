export class Parser {

    public parseHeader(document: string): EdiDocumentConfiguration {

        // https://msdn.microsoft.com/en-us/library/bb259967(v=bts.20).aspx

        var isaHeader = document.replace(/(^\s+)/g, '').slice(0, 106);

        let isIsa = isaHeader.slice(0, 3) == "ISA";
        if (!isIsa) {
            return null;
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
        var parseResult = this.parseSegments(isaHeader, config);

        // TODO Cleanup
        if (parseResult.length != 1) {
            return null;
        }
        let result = parseResult[0];
        let isValid = result.id == "ISA"
            && result.elements.length == 19
            && result.elements[1].value.length == 2
            && result.elements[2].value.length == 10
            && result.elements[3].value.length == 2
            && result.elements[4].value.length == 10
            && result.elements[5].value.length == 2
            && result.elements[6].value.length == 15
            && result.elements[7].value.length == 2
            && result.elements[8].value.length == 15
            && result.elements[9].value.length == 6
            && result.elements[10].value.length == 4
            && result.elements[11].value.length == 0
            && result.elements[12].value.length == 0
            && result.elements[13].value.length == 5
            && result.elements[14].value.length == 9
            && result.elements[15].value.length == 1
            && result.elements[16].value.length == 1
            && result.elements[17].value.length == 0
            && result.elements[18].value.length == 0
            ;

        return isValid ? config : null;
    }

    public parseSegments(document: string, config: EdiDocumentConfiguration): EdiSegment[] {

        if (config == null) {
            config = new EdiDocumentConfiguration("", "*", ":", ">", "~");
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
            "\\w+",
            "\\(",
            "\\)",
            "'",
            "&",
            "\"",
            "!",
            " ",
            ",",
            "\\-",
            "\\.",
            "\\/",
            ";",
            "\\?",
            "=",
            "%",
            "@",
            "\\[",
            "\\]",
            "_",
            "\\{",
            "\\}",
            "\\\\",
            "\\|",
            "<",
            ">",
            "#",
            "\$",
            ":",
            "^",
            "~",
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