import { } from 'vscode';

export class Parser {
    public ParseSegments(document: string): EdiSegment[] {

        // console.log(document);

        let matches = this.parseRegex(/\b(.*?)~/g, document);

        let results = matches.map((x, i) => {
            return this.parseSegment(x.value, x.index, x.index + x.value.length);
        });

        return results;
    }

    private parseSegment(segmentStr: string, startIndex: number, endIndex: number): EdiSegment {

        // TODO don't hard code this separators

        // console.log(segmentStr);

        var segment = new EdiSegment();
        segment.startIndex = startIndex;
        segment.endIndex = endIndex;
        segment.length = endIndex - startIndex;

        let segmentsIds = this.parseRegex(/^[\w\d]{2,3}/g, segmentStr)
            .map(x => new EdiElement(ElementType.segmentId, x.value, startIndex + x.index));

        let dataElements = this.parseRegex(/\*([\w .]*)/g, segmentStr, 1)
            .map(x => new EdiElement(ElementType.dataElement, x.value, startIndex + x.index);

        let repeatingElements = this.parseRegex(/\^([\w .]*)/g, segmentStr, 1)
            .map(x => new EdiElement(ElementType.repeatingElement, x.value, startIndex + x.index));

        let componentElements = this.parseRegex(/>([\w .]*)/g, segmentStr, 1)
            .map(x => new EdiElement(ElementType.componentElement, x.value, startIndex + x.index));

        segment.elements = segmentsIds.concat(dataElements, repeatingElements, componentElements).sort((a, b) => a.startIndex - b.startIndex);

        let firstElement = segment.elements[0];
        if (firstElement != null && firstElement.type == ElementType.segmentId) {
            segment.id = firstElement.value;
        }

        // console.log(segment);

        return segment;
    }

    private parseRegex(exp: RegExp, str: string, group: number = 0): RegexMatch[] {
        let results: RegexMatch[] = [];
        let match: RegExpExecArray;
        while ((match = exp.exec(str)) != null) {
            results.push(new RegexMatch(match[group], match.index));
        }

        return results;
    }
}

class RegexMatch {
    public value: string;
    public index: number;

    constructor(value: string, index: number) {
        this.value = value;
        this.index = index;
    }
}

export class EdiSegment {

    public startIndex: number;
    public endIndex: number;

    public length: number;

    public id: string;

    public elements: EdiElement[];
}

export enum ElementType {
    segmentId,
    dataElement,
    repeatingElement,
    componentElement
}

export class EdiElement {

    public type: ElementType;
    public value: string;
    public startIndex: number;

    public endIndex: number;

    constructor(type: ElementType, value: string, startIndex: number) {
        this.type = type;
        this.value = value;
        this.startIndex = startIndex;
        this.endIndex = startIndex + value.length;
    }

    public toString() {
        return this.value;
    }
}

