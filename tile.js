class Tile {
    #coordinates;
    #content;
    #value;
    #htmlElement
    constructor(element, coordinates) {
        this.#coordinates = coordinates;
        this.flage = false;
        this.open = false;
        this.#content = "empty";
        this.#value = 0;
        this.#htmlElement = element;
    }
    getCoordinates() {
        return this.#coordinates;
    }
    markBomb() {
        this.flage = true;
    }
    containsBomb() {
        return this.#content == "bomb";
    }
    getValue() {
        return this.#value;
    }
    increaseValue() {
        this.#value++;
    }
    htmlElement(){
        return this.#htmlElement;
    }
    setBomb(){
        this.#content = 'bomb';
    }
    
}

class Coordinates {
    #x;
    #y;
    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }
    x() {
        return this.#x;
    }
    y() {
        return this.#y;
    }
}

export {Tile, Coordinates};

