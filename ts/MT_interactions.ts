import { FSM } from "./FSM";
import { getMatrixFromElement, getPoint, drag } from "./transfo";

function multiTouch(element: HTMLElement): void {
    let pointerId_1: number, Pt1_coord_element: SVGPoint, Pt1_coord_parent: SVGPoint,
        pointerId_2: number, Pt2_coord_element: SVGPoint, Pt2_coord_parent: SVGPoint,
        originalMatrix: SVGMatrix,
        getRelevantDataFromEvent = (evt: TouchEvent): Touch => {
            for (let i = 0; i < evt.changedTouches.length; i++) {
                let touch = evt.changedTouches.item(i);
                if (touch.identifier === pointerId_1 || touch.identifier === pointerId_2) {
                    return touch;
                }
            }
            return null;
        };
    enum MT_STATES { Inactive, Translating, Rotozooming }
    let fsm = FSM.parse<MT_STATES>({
        initialState: MT_STATES.Inactive,
        states: [MT_STATES.Inactive, MT_STATES.Translating, MT_STATES.Rotozooming],
        transitions: [
            {
                from: MT_STATES.Inactive, to: MT_STATES.Translating,
                eventTargets: [element],
                eventName: ["touchstart"],
                useCapture: false,
                action: (evt: TouchEvent): boolean => {
                    pointerId_1 = 0;
                    pointerId_2 = 1;

                    let touch: Touch = getRelevantDataFromEvent(evt); //on stock dans touch les informations (coord) du click 

                    originalMatrix = getMatrixFromElement(element); //on recupère la matrice associée à l'image/element selectionné sur la page

                    Pt1_coord_element = getPoint(touch.pageX, touch.pageY).matrixTransform(originalMatrix.inverse()); //on stock dans coord_element les coordonnées relative du click dans l'image/l'element
                    Pt1_coord_parent = getPoint(touch.pageX, touch.pageY); //on stock dans cette variable les coordonnées absolue du click sur la page

                    return true;
                }
            },
            {
                from: MT_STATES.Translating, to: MT_STATES.Translating,
                eventTargets: [document],
                eventName: ["touchmove"],
                useCapture: true,
                action: (evt: TouchEvent): boolean => {
                    evt.stopPropagation();

                    let touch: Touch = getRelevantDataFromEvent(evt);  //on stock dans touch les informations (coord) du click 

                    Pt1_coord_parent = getPoint(touch.pageX, touch.pageY); //on stock dans cette variable les coordonnées absolue du click sur la page

                    drag(element, originalMatrix, Pt1_coord_element, Pt1_coord_parent); //on appelle la methode drag de transfo.ts pour modifier la postion de l'image/l'element sur la page en fonction de ses nouvelles coordonnées
                    return true;
                }
            },
            {
                from: MT_STATES.Translating,
                to: MT_STATES.Inactive,
                eventTargets: [document],
                eventName: ["touchend"],
                useCapture: true,
                action: (evt: TouchEvent): boolean => {
                    return true;  //il n'y a rien à faire lorsque que arrete de drag un element
                }
            },
            {
                from: MT_STATES.Translating, to: MT_STATES.Rotozooming,
                eventTargets: [element],
                eventName: ["touchstart"],
                useCapture: false,
                action: (evt: TouchEvent): boolean => {
                    // To be completed
                    return true;
                }
            },
            {
                from: MT_STATES.Rotozooming, to: MT_STATES.Rotozooming,
                eventTargets: [document],
                eventName: ["touchmove"],
                useCapture: true,
                action: (evt: TouchEvent): boolean => {
                    evt.preventDefault();
                    evt.stopPropagation();
                    // To be completed
                    return true;
                }
            },
            {
                from: MT_STATES.Rotozooming,
                to: MT_STATES.Translating,
                eventTargets: [document],
                eventName: ["touchend"],
                useCapture: true,
                action: (evt: TouchEvent): boolean => {
                    const touch = getRelevantDataFromEvent(evt);
                    // To be completed
                    return true;
                }
            }
        ]
    });
    fsm.start();
}

//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
function isString(s: any): boolean {
    return typeof (s) === "string" || s instanceof String;
}

export let $ = (sel: string | Element | Element[]): void => {
    let L: Element[] = [];
    if (isString(sel)) {
        L = Array.from(document.querySelectorAll(<string>sel));
    } else if (sel instanceof Element) {
        L.push(sel);
    } else if (sel instanceof Array) {
        L = sel;
    }
    L.forEach(multiTouch);
};
