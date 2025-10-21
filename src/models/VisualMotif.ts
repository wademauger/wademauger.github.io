class VisualMotif {
    type: string;
    primaryMotif: any;
    secondaryMotifs: any[];
    mainColor: string;
    contrastColors: string[];
    successor: VisualMotif | null;
    truncatedBy: number;
    horizontalRepeat: number;
    verticalRepeat: number;
    height: number;

    constructor(
        type: string,
        primaryMotif: any,
        secondaryMotifs: any[] = [],
        mainColor = '',
        contrastColors: string[] = [],
        successor: VisualMotif | null = null,
        truncatedBy = 0,
        horizontalRepeat = 0,
        verticalRepeat = 0,
        height = 0
    ) {
        this.type = type;
        this.primaryMotif = primaryMotif;
        this.secondaryMotifs = secondaryMotifs;
        this.mainColor = mainColor;
        this.contrastColors = contrastColors;
        this.successor = successor;
        this.truncatedBy = truncatedBy;
        this.horizontalRepeat = horizontalRepeat;
        this.verticalRepeat = verticalRepeat;
        this.height = height;
    }

    getChild(row: number) {
        let currentMotif: VisualMotif = this;
        let accumulatedHeight: number = this.height;

        while (currentMotif.successor && row >= accumulatedHeight) {
            row -= accumulatedHeight;
            currentMotif = currentMotif.successor;
            accumulatedHeight = currentMotif.height;
        }

        if (row >= accumulatedHeight) {
            return null;
        }

        const child = new VisualMotif(
            currentMotif.type,
            currentMotif.primaryMotif,
            currentMotif.secondaryMotifs,
            currentMotif.mainColor,
            currentMotif.contrastColors,
            currentMotif.successor,
            currentMotif.truncatedBy,
            currentMotif.horizontalRepeat,
            currentMotif.verticalRepeat,
            currentMotif.height
        );
        child.truncatedBy = row;
        return child;
    }
}

export default VisualMotif;