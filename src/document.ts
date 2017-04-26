import { EditorPosition } from './models/editorPosition';

export class Document {

    public text: string;

    public lineToStartIndex: number[];
    public lineToStartIndexReversed: number[];

    public static create(text: string): Document {

        const delimiter = "\u0000";
        let workIndex = 0;
        let lineToStartIndex = text.replace(/\r?\n/g, x => x + delimiter) // TODO Might need to hand code this one...
            .split(delimiter)
            .map((x) => {
                let currentIndex = workIndex;
                workIndex += x.length;
                return currentIndex;
            });

        let lineToStartIndexReversed = lineToStartIndex.slice().reverse();

        let doc = new Document();
        doc.text = text;
        doc.lineToStartIndex = lineToStartIndex;
        doc.lineToStartIndexReversed = lineToStartIndexReversed;

        return doc;
    }

    public positionToIndex(line: number, character: number): number {
        if (line < 0 || line > this.lineToStartIndex.length) {
            throw "Position out of range.";
        }
        let lineStartIndex = this.lineToStartIndex[line];
        let index = lineStartIndex + character;

        return index;
    }

    public indexToPosition(i: number): EditorPosition {
        if (i < 0) {
            throw "Index out of range.";
        }

        let reveredLine = this.lineToStartIndexReversed.findIndex((x) => x <= i);
        let startIndex = this.lineToStartIndexReversed[reveredLine];
        let char = i - startIndex;

        let line = this.lineToStartIndex.lastIndexOf(startIndex);

        let pos = new EditorPosition(line, char);

        return pos;
    }
}