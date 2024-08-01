export type GenerationalIndex = {
    index: number;
    generation: number;
};

export class GenerationalAllocator {
    private indices: number[] = [];
    private generations: number[] = [];
    private free_list: number[] = [];

    /** Generates a new GenerationalIndex. */
    public allocate(): GenerationalIndex {
        let index: number;
        
        if (this.free_list.length > 0) {
            index = this.free_list.pop()!;
            this.generations[index] += 1;
        } else {
            index = this.indices.length;
            this.indices.push(index);
            this.generations[index] = 0;
        }

        return { index, generation: this.generations[index] };
    }

    /** Frees an index. */
    public free(index: number): void {
        if (index >= this.indices.length || this.generations[index] === undefined) return; // Out of bounds.
        this.free_list.push(index);
    }

    public is_valid({ index, generation }: GenerationalIndex): boolean {
        return (
            index < this.indices.length &&
            this.generations[index] !== undefined &&
            this.generations[index] === generation
        );
    }
}