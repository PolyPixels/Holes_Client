//used in ui.js
function checkName() {
    if (nameInput.value().length > 0) {
        nameEntered = true;
    } else {
        nameEntered = false;
    }
}

//used while loading race images, in preload.js
function flipImage(img) {
    let flippedImg = createGraphics(img.width, img.height);
    flippedImg.scale(-1, 1);
    flippedImg.image(img, -img.width, 0);
    return flippedImg;
}

//used in objects.js and items.js
function checkParams(inputs, inputNames, checks){
    for(let i = 0; i < inputs.length; i++){
        if(checks[i] == "int"){
            if(parseInt(inputs[i]) !== inputs[i]){
                throw new TypeError(`${inputNames[i]} is not of type int, ${inputs[i]} was passed as ${inputNames[i]}, ${inputs[i]} is of type ${typeof inputs[i]}`);
            }
        }
        else{
            if(typeof inputs[i] != checks[i]){
                throw new TypeError(`${inputNames[i]} is not of type ${checks[i]}, ${inputs[i]} was passed as ${inputNames[i]}, ${inputs[i]} is of type ${typeof inputs[i]}`);
            }
        }
    }
}

//used in objects.js and items.js
function getParamNames(func){
    return func.toString().split("{")[0].split("(")[1].split(")")[0].split(",");
}