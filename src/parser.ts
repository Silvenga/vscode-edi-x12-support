export class Parser {
    public parseSegments(document: string): EdiSegment[] {

        let results = this.parseRegex(/\b([\s\S]*?)(~)/g, document, x => this.parseSegment(x[0], x.index, x.index + x[0].length, x[2]));

        return results;
    }

    private parseSegment(segmentStr: string, startIndex: number, endIndex: number, endingDelimiter: string): EdiSegment {

        // TODO don't hard code this separators

        let segment = new EdiSegment();
        segment.endingDelimiter = endingDelimiter;
        segment.startIndex = startIndex;
        segment.endIndex = endIndex;
        segment.length = endIndex - startIndex;

        let segmentsIds = this.parseRegex(/^[\w\d]{2,3}/g, segmentStr, x => new EdiElement(ElementType.segmentId, x[0], startIndex + x.index, ""));
        let dataElements = this.parseRegex(/(\*)([\w+\(\)'&"! ,\-\./;\?=%@\[\]_\{\}\\|<#$]*)/g, segmentStr, x => new EdiElement(ElementType.dataElement, x[2], startIndex + x.index, x[1]))
        let repeatingElements = this.parseRegex(/(\^)([\w+\(\)'&"! ,\-\./;\?=%@\[\]_\{\}\\|<#$]*)/g, segmentStr, x => new EdiElement(ElementType.repeatingElement, x[2], startIndex + x.index, x[1]));
        let componentElements = this.parseRegex(/([>:])([\w+\(\)'&"! ,\-\./;\?=%@\[\]_\{\}\\|<#$]*)/g, segmentStr, x => new EdiElement(ElementType.componentElement, x[2], startIndex + x.index, x[1]));

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

            let elementName = this.pad(elementIndex, 2);

            if (element.type == ElementType.componentElement) {
                elementName += `-${componentIndex}`;
                componentIndex++;
            }

            element.name = elementName;
        }

        return segment;
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

    // TODO Store ending deliminator
    public toString() {
        return this.elements.join("") + "~";
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

