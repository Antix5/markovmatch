
class Engine {

    private possiblewords: string[] = [];
    private charSet: string = "abcdefghijklmnopqrstuvwxyz- éèàçâêîôûäëïöü.,;:!?()[]{}";
    private markovList: MarkovChain[] = [];

    constructor(words: string[]) {
        
        for (let i = 0; i < words.length; i++) {
            this.possiblewords.push(words[i].toLowerCase());
        }

        for (let i = 0; i < this.possiblewords.length; i++) {
            this.markovList.push(this.markovify(this.possiblewords[i]));
        }
       
    }

    private markovify(text: string): MarkovChain {
        return new MarkovChain(text, this.charSet);
    }

    public findBestMatch(text: string): any[] {

        let markovifiedText = this.markovify(text.toLowerCase());

        this.markovList.forEach(markov => {
            markov.MatrixDistance(markovifiedText.getMatrix());
        });

        // smaller is better, we send the list of the best matches

        let bestMatches: string[] = [];

        // We sort the list of markov chains by their distance to the text

        this.markovList.sort((a, b) => {
            return a.getGrade() - b.getGrade();
        }).forEach(markov => {
            bestMatches.push(markov.getText());
        });

        return bestMatches;
        

   
    }


}

class MarkovChain{

    /*
        Each word will be represented by a markov chain taking into account for each letter the letter just before it.
    */

    private mainMatrix: number[][];
    private charSet: string;
    private text: string;
    private grade: number;

    constructor(text: string, charset: string) {

        this.mainMatrix = this.createMatrix(charset);
        this.charSet = charset;
        this.text = text;
        this.fillMatrix();

    }

    private createMatrix(charset: string): number[][] {
        let matrix: number[][] = [];
        for (let i = 0; i < charset.length; i++) {
            matrix[i] = [];
            for (let j = 0; j < charset.length; j++) {
                matrix[i][j] = 0;
            }
        }
        return matrix;
    }

    private insertIntoMatrix(before: string, after: string): void {
        // We check that each letter is in the charset
        if (this.charSet.indexOf(before) == -1 || this.charSet.indexOf(after) == -1) {
            console.log("Could not be inserted into matrix : " + before + " " + after);
        }else{
            this.mainMatrix[this.charSet.indexOf(before)][this.charSet.indexOf(after)]++;
        }

    }

    public getMatrix(): number[][] {
        return this.mainMatrix;
    }

    public MatrixDistance(matrix1: number[][], matrix2 = this.mainMatrix): void{
        let distance: number = 0;
        for (let i = 0; i < matrix1.length; i++) {
            for (let j = 0; j < matrix1.length; j++) {
                distance += Math.abs(matrix1[i][j] - matrix2[i][j]);
            }
        }
        this.grade = distance;
    }

    public getGrade(): number {
        return this.grade;
    }

    public getText(): string { 
        return this.text;
    }

    private fillMatrix(): void {
        for (let i = 0; i < this.text.length; i++) {
            if (i == 0) {
                this.insertIntoMatrix(" ", this.text[i]);
            } else {
                this.insertIntoMatrix(this.text[i - 1], this.text[i]);
            }
        }
    }


}

function main(): void {
    let engine = new Engine(
        ["Cat","Dog", "Zebra", "Lion", "Tiger", "Elephant",
        "Giraffe", "Hippopotamus", "Cheetah", "Crocodile",
        "Panda", "Koala", "Lemur", "Kangaroo", "Horse",
        "Cow", "Pig", "Sheep", "Chicken", "Duck", "Goose",
        "Penguin", "Polar Bear", "Ostrich", "Rabbit", "Deer",
        "Hedgehog", "Squirrel", "Mouse", "Rat", "Hamster",
        "Guinea Pig", "Parrot", "Raccoon", "Puppy", "Kitten"]);

    console.log(engine.findBestMatch("The cat is sleeping"));

    
}

main();