import { FSM } from "./FSM";
import * as transfo from "./transfo";

function multiTouch(element: HTMLElement) : void {
    let pointerId_1 : number, Pt1_coord_element : SVGPoint, Pt1_coord_parent : SVGPoint,
        pointerId_2 : number, Pt2_coord_element : SVGPoint, Pt2_coord_parent : SVGPoint,
        originalMatrix : SVGMatrix,
        getRelevantDataFromEvent = (evt : TouchEvent) : Touch => {
            for(let i=0; i<evt.changedTouches.length; i++) {
                let touch = evt.changedTouches.item(i);
                if(touch.identifier === pointerId_1 || touch.identifier === pointerId_2) {
                    return touch;
                }
            }
            return null;
        };
    enum MT_STATES {Inactive, Translating, Rotozooming};
    let fsm = FSM.parse<MT_STATES>( {
        initialState: MT_STATES.Inactive,
        states: [MT_STATES.Inactive, MT_STATES.Translating, MT_STATES.Rotozooming],
        transitions : [
            { from: MT_STATES.Inactive, to: MT_STATES.Translating,
                eventTargets: [element],
                eventName: ["touchstart"],
                useCapture: false,
                action: (evt : TouchEvent) : boolean => {
                    let touch = evt.changedTouches.item(0);
                    pointerId_1 = touch.identifier;
                    // Get point coordinate with respect to element
                    originalMatrix    = transfo.getMatrixFromElement( element );
                    Pt1_coord_parent  = transfo.getPoint(touch.pageX, touch.pageY);
                    Pt1_coord_element = Pt1_coord_parent.matrixTransform( originalMatrix.inverse() );
                    return true;
                }
            },
            { from: MT_STATES.Translating, to: MT_STATES.Translating,
                eventTargets: [document],
                eventName: ["touchmove"],
                useCapture: true,
                action: (evt : TouchEvent) : boolean => {
                    evt.preventDefault();
                    evt.stopPropagation();
                    let touch = getRelevantDataFromEvent(evt);
                    if(touch) {
                        Pt1_coord_parent.x = touch.pageX;
                        Pt1_coord_parent.y = touch.pageY;
                        transfo.drag( element, originalMatrix, Pt1_coord_element, Pt1_coord_parent );
                    }
                    return touch !== null;
                }
            },
            { from: MT_STATES.Translating,
                to: MT_STATES.Inactive,
                eventTargets: [document],
                eventName: ["touchend"],
                useCapture: true,
                action: (evt : TouchEvent) : boolean => {
                    let touch = getRelevantDataFromEvent(evt);
                    return touch !== null;
                }
            },
            { from: MT_STATES.Translating, to: MT_STATES.Rotozooming,
                eventTargets: [element],
                eventName: ["touchstart"],
                useCapture: false,
                action: (evt : TouchEvent) : boolean => {
                    let touch = evt.changedTouches.item(0);
                    pointerId_2 = touch.identifier;
                    // Get point coordinate with respect to element
                    originalMatrix    = transfo.getMatrixFromElement( element );
                    Pt2_coord_parent  = transfo.getPoint(touch.pageX, touch.pageY);
                    Pt2_coord_element = Pt2_coord_parent.matrixTransform( originalMatrix.inverse() );
                    return true;
                }
            },
            { from: MT_STATES.Rotozooming, to: MT_STATES.Rotozooming,
                eventTargets: [document],
                eventName: ["touchmove"],
                useCapture: true,
                action: (evt : TouchEvent) : boolean => {
                    evt.preventDefault();
                    evt.stopPropagation();
                    let touch = getRelevantDataFromEvent(evt);
                    if(touch) {
                        if(touch.identifier === pointerId_1) {
                            Pt1_coord_parent.x = touch.clientX;
                            Pt1_coord_parent.y = touch.clientY;
                        } else {
                            Pt2_coord_parent.x = touch.clientX;
                            Pt2_coord_parent.y = touch.clientY;
                        }
                        transfo.rotozoom( element, originalMatrix
                                        , Pt1_coord_element, Pt1_coord_parent
                                        , Pt2_coord_element, Pt2_coord_parent );
                    }
                    return touch !== null;
                }
            },
            { from: MT_STATES.Rotozooming,
                to: MT_STATES.Translating,
                eventTargets: [document],
                eventName: ["touchend"],
                useCapture: true,
                action: (evt : TouchEvent) : boolean => {
                    let touch = getRelevantDataFromEvent(evt);
                    if(touch) {
                        originalMatrix      = transfo.getMatrixFromElement(element);
                    }
                    if(touch.identifier === pointerId_1) {
                        pointerId_1         = pointerId_2;
                        Pt1_coord_element   = Pt2_coord_element;
                    }
                    pointerId_2         = null;
                    Pt2_coord_element   = null;
                    return touch !== null;
                }
            }
        ]
    } );
    fsm.start();
}

//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
function isString(s : any) : boolean {
    return typeof(s) === "string" || s instanceof String;
}

export let $ = (sel : string | Element | Element[]) : void => {
    let L : Element[] = [];
    if( isString(sel) ) {
        L = Array.from( document.querySelectorAll(<string>sel) );
    } else if(sel instanceof Element) {
        L.push( sel );
    } else if(sel instanceof Array) {
        L = sel;
    }
    L.forEach( multiTouch );
};
