let re_matrix = /^matrix\((.*), (.*), (.*), (.*), (.*), (.*)\)$/;

let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
let idM = svg.createSVGMatrix();
idM.a = 1; idM.b = 0; idM.c = 0; idM.d = 1; idM.e = 0; idM.f = 0;

//______________________________________________________________________________________________________________________
export let setMatrixCoordToElement = (element: HTMLElement
    , a: number
    , b: number
    , c: number
    , d: number
    , e: number
    , f: number
) => {
    element.style.transform = "matrix(" + a + "," + b + "," + c + "," + d + "," + e + "," + f + ")";
};

//______________________________________________________________________________________________________________________
export let setMatrixToElement = (element: HTMLElement, M: SVGMatrix) => {
    setMatrixCoordToElement(element, M.a, M.b, M.c, M.d, M.e, M.f);
};

//______________________________________________________________________________________________________________________
export let getMatrixFromString = (str: string): SVGMatrix => {
    let res = re_matrix.exec(str)
        , matrix = svg.createSVGMatrix()
        ;
    matrix.a = parseFloat(res[1]) || 1;
    matrix.b = parseFloat(res[2]) || 0;
    matrix.c = parseFloat(res[3]) || 0;
    matrix.d = parseFloat(res[4]) || 1;
    matrix.e = parseFloat(res[5]) || 0;
    matrix.f = parseFloat(res[6]) || 0;

    return matrix;
};

//______________________________________________________________________________________________________________________
export let getPoint = (x: number, y: number): SVGPoint => {
    let point = svg.createSVGPoint();
    point.x = x || 0;
    point.y = y || 0;
    return point;
};

//______________________________________________________________________________________________________________________
export let getMatrixFromElement = (element: Element): SVGMatrix => {
    return getMatrixFromString(window.getComputedStyle(element).transform || "matrix(1,1,1,1,1,1)");
};

//______________________________________________________________________________________________________________________
export let drag = (element: HTMLElement
    , originalMatrix: SVGMatrix
    , Pt_coord_element: SVGPoint
    , Pt_coord_parent: SVGPoint
) => {
    originalMatrix.e = Pt_coord_parent.x - originalMatrix.a * Pt_coord_element.x - originalMatrix.c * Pt_coord_element.y; //on applique simplement la formule pour calculer le tx de la nouvelle matrice
    originalMatrix.f = Pt_coord_parent.y - originalMatrix.b * Pt_coord_element.x - originalMatrix.d * Pt_coord_element.y; //on applique simplement la formule pour calculer le ty de la nouvelle matrice

    setMatrixToElement(element, originalMatrix);
};

//______________________________________________________________________________________________________________________
export let rotozoom = (element: HTMLElement
    , Pt1_coord_element: SVGPoint
    , Pt1_coord_parent: SVGPoint
    , Pt2_coord_element: SVGPoint
    , Pt2_coord_parent: SVGPoint
) => {
    var resMatrix: SVGMatrix = svg.createSVGMatrix();
    var dx_element: number = Pt2_coord_element.x - Pt1_coord_element.x;
    var dy_element: number = Pt2_coord_element.y - Pt1_coord_element.y;
    var dx_parent: number = Pt2_coord_parent.x - Pt1_coord_parent.x;
    var dy_parent: number = Pt2_coord_parent.y - Pt1_coord_parent.y;
    var s: number;
    var c: number;

    if (dx_element === 0) {
        if (dy_element === 0) {
            return;
        } else {
            s = - dx_parent / dy_element;
            c = dy_parent / dy_element;
        }
    } else if (dy_element === 0) {
        s = dy_parent / dx_element;
        c = dx_parent / dx_element;
    } else {
        s = (dy_parent / dy_element - dx_parent / dx_element) / (dy_element / dx_element + dx_element / dy_element);
        c = (dx_parent + s * dy_element) / dx_element;
    }

    resMatrix.a = c;
    resMatrix.b = s;
    resMatrix.c = -s;
    resMatrix.d = c;
    resMatrix.e = Pt1_coord_parent.x - c * Pt1_coord_element.x + s * Pt1_coord_element.y;
    resMatrix.f = Pt1_coord_parent.y - s * Pt1_coord_element.x - c * Pt1_coord_element.y;

    setMatrixToElement(element, resMatrix);
};

