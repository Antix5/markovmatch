import {
    parse as parseCsv
  } from 'https://deno.land/std@0.82.0/encoding/csv.ts';

class Engine {

    private possiblewords: string[] = [];
    private charSet: string = "abcdefghijklmnopqrstuvwxyz- éèàçâêîôûäëïöü.,;:!?()[]{}1234567890";
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

    private levenshtein(a: string, b: string): number
    {
        const an = a ? a.length : 0;
        const bn = b ? b.length : 0;
        if (an === 0)
        {
            return bn;
        }
        if (bn === 0)
        {
            return an;
        }
        const matrix = new Array<number[]>(bn + 1);
        for (let i = 0; i <= bn; ++i)
        {
            let row = matrix[i] = new Array<number>(an + 1);
            row[0] = i;
        }
        const firstRow = matrix[0];
        for (let j = 1; j <= an; ++j)
        {
            firstRow[j] = j;
        }
        for (let i = 1; i <= bn; ++i)
        {
            for (let j = 1; j <= an; ++j)
            {
                if (b.charAt(i - 1) === a.charAt(j - 1))
                {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else
                {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1], // substitution
                        matrix[i][j - 1], // insertion
                        matrix[i - 1][j] // deletion
                    ) + 1;
                }
            }
        }
        return matrix[bn][an];
    }

    public findBestMatch(text: string): any {

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

        return bestMatches[0];
        

   
    }

    public findBestLevenshtein(text: string): any {

        // We compute the Levenshtein distance between the text and all the possible words

        let levenshteinDict: {[key: string]: number} = {};

        for (let i = 0; i < this.possiblewords.length; i++) {

            levenshteinDict[this.possiblewords[i]] = this.levenshtein(text, this.possiblewords[i]);

        }

        // We sort the list of of words by their distance to the text

        let rankedMatches = Object.keys(levenshteinDict).sort((a, b) => {
            return levenshteinDict[a] - levenshteinDict[b];
        });

        return rankedMatches[0];
        

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

async function main(){


    let firstcolumn : string[] = [];
    let secondcolumn : string[] = [];

    const f = await parseCsv(await Deno.readTextFile('room_type.csv'));

    // We romove the first row (header)
    f.shift();

    for await (const row of f) {
        firstcolumn.push(row[0]);
        secondcolumn.push(row[1]);
    }

    // We create a dictionary with the control results

    let controlDict: {[key: string]: string} = {};

    for (let i = 0; i < firstcolumn.length; i++) {
        controlDict[firstcolumn[i]] = secondcolumn[i];
    }


    let engine = new Engine(secondcolumn);

    let testResult = {} as any;

    for (let i = 0; i < firstcolumn.length; i++) {
        testResult[firstcolumn[i]] = engine.findBestMatch(firstcolumn[i]);
    }

    console.log(testResult);

    console.log("Control : ");
    console.log(controlDict);

    // We compare the results with the control results

    let success: number = 0;

    console.log("------------------------------");
    for (let i = 0; i < firstcolumn.length; i++) {
        console.log("|" + firstcolumn[i] + "|" + testResult[firstcolumn[i]] + "|" + controlDict[firstcolumn[i]] + "|");
        if (testResult[firstcolumn[i]] == controlDict[firstcolumn[i]].toLowerCase()) {
            
            success++;
        }
    }
    console.log("------------------------------");

    console.log("Success rate : " + success / firstcolumn.length);

    console.log("------------------------------");

    // Same thing for the Levenshtein distance

    let levenshteinDict: {[key: string]: string} = {};

    for (let i = 0; i < firstcolumn.length; i++) {
        levenshteinDict[firstcolumn[i]] = engine.findBestLevenshtein(firstcolumn[i]);
    }   

    console.log("------------------------------");

    let levenshteinSuccess: number = 0;

    for (let i = 0; i < firstcolumn.length; i++) {

        console.log("|" + firstcolumn[i] + "|" + levenshteinDict[firstcolumn[i]] + "|" + controlDict[firstcolumn[i]] + "|");
        if (levenshteinDict[firstcolumn[i]] == controlDict[firstcolumn[i]].toLowerCase()) {
            levenshteinSuccess++;
        }
    }

    console.log("------------------------------");

    console.log("Success rate : " + levenshteinSuccess / firstcolumn.length);

    console.log("------------------------------");

    




    
}

main();