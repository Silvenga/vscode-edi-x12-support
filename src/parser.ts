export class Parser {
    public ParseSegments(document: string): EdiSegment[] {

        // console.log(document);

        let results = this.parseRegex(/\b([\s\S]*?)~/g, document, x => this.parseSegment(x[0], x.index, x.index + x[0].length));

        return results;
    }

    private parseSegment(segmentStr: string, startIndex: number, endIndex: number): EdiSegment {

        // TODO don't hard code this separators

        // console.log(segmentStr);

        var segment = new EdiSegment();
        segment.startIndex = startIndex;
        segment.endIndex = endIndex;
        segment.length = endIndex - startIndex;

        let segmentsIds = this.parseRegex(/^[\w\d]{2,3}/g, segmentStr, x => new EdiElement(ElementType.segmentId, x[0], startIndex + x.index, ""));
        let dataElements = this.parseRegex(/(\*)([\w .-]*)/g, segmentStr, x => new EdiElement(ElementType.dataElement, x[2], startIndex + x.index, x[1]))
        let repeatingElements = this.parseRegex(/(\^)([\w .-]*)/g, segmentStr, x => new EdiElement(ElementType.repeatingElement, x[2], startIndex + x.index, x[1]));
        let componentElements = this.parseRegex(/(>)([\w .-]*)/g, segmentStr, x => new EdiElement(ElementType.componentElement, x[2], startIndex + x.index, x[1]));

        segment.elements = segmentsIds.concat(dataElements, repeatingElements, componentElements).sort((a, b) => a.startIndex - b.startIndex);

        let firstElement = segment.elements[0];
        if (firstElement != null && firstElement.type == ElementType.segmentId) {
            segment.id = firstElement.value;
        }

        // console.log(segment);

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

