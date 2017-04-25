import { } from 'vscode';

export class Parser {
    public ParseSegments(document: string): string[] {
        let bodyRegex = /\b(.*?)~/g;

        console.log(document);

        let results: string[] = [];
        let result: RegExpExecArray;
        while ((result = bodyRegex.exec(document)) !== null) {
            results.push(result[0]);
        }

        return results;
    }
}

