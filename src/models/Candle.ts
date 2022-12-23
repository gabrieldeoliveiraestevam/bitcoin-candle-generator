import CandleColor from "../enums/CandleColor";

export default class Candle {

    low: number;
    high: number;
    open: number;
    close: number;
    color: CandleColor;
    initialDateTime: Date;
    finalDateTime: Date;
    values: number[];
    currency: string;

    constructor(currency: string, initialDateTime: Date) {
        this.currency = currency;
        this.initialDateTime = initialDateTime;
        this.low = +Infinity; // Começa com o valor infinito
        this.high = 0;
        this.close = 0;
        this.open = 0;
        this.values = [];
        this.color = CandleColor.UNDETERMINED;
    }
    
    addValue(value: number){
        this.values.push(value);

        if(this.values.length == 1) {
            this.open = value;
        };

        if(this.low > value){
            this.low = value;
        };

        if(this.high < value){
            this.high = value;
        }
    }

    closeCandle(){
        // Define o valor de fechamento
        if(this.values.length > 0){
            this.close = this.values[this.values.length - 1];
        };
        
        this.finalDateTime = new Date();

        // Queda no valor da moeda
        if(this.open > this.close){
            this.color = CandleColor.RED;
        };

        // Aumento do valor da moeda
        if(this.open < this.close){
            this.color = CandleColor.GREEN;
        }
    }

    // Retorna objeto simples - sem a lista de valores
    toSimpleObject(){
        const { values, ...obj } = this;
        return obj;
    }
}   