import { colorworkCharts } from "../data/garments";

const MotifStyle = {
    STRANDED: 'stranded',
    INTARSIA: 'intarsia',
    SOLID: 'solid',
};

const Repetition = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
    HORIZONTAL_VERTICAL: 'horizontal_vertical'
};

const SecondaryMotifs = {
    LEFT: 'left',
    RIGHT: 'right',
    ALTERNATING: 'alternating',
    REPEATING: 'repeating',
    RANDOM: 'random',
}

class VisualMotif {
    constructor(style=MotifStyle.SOLID, primaryMotif=colorworkCharts.Solid, secondaryMotifs = [], mainColor = "#ffffff", contrastColors = [], successor = null, truncatedBy = 0, horizontalRepeat = 0, verticalRepeat = 0, height = 0) {
        this.style = style;
        this.primaryMotif = primaryMotif;
        this.secondaryMotifs = secondaryMotifs;
        this.mainColor = mainColor;
        this.contrastColors = contrastColors;
        this.successor = successor;
        this.horizontalRepeat = horizontalRepeat;
        this.verticalRepeat = verticalRepeat;
        this.height = height;
    }
 
}

export default VisualMotif;