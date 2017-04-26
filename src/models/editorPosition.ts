export class EditorPosition {

    /**
     * The zero-based line value.
     */
    public readonly line: number;

    /**
     * The zero-based character value.
     */
    public readonly character: number;

    /**
     * @param line A zero-based line value.
     * @param character A zero-based character value.
     */
    constructor(line: number, character: number) {
        this.line = line;
        this.character = character;
    }
}