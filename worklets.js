class gainProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: "staticGain",
        defaultValue: 0,
        minValue: 0,
        maxValue: 1,
        automationRate: "a-rate"
      },
      {
        name: "modGain",
        defaultValue: 0,
        minValue: -1,
        maxValue: 1,
        automationRate: "a-rate"
      }
    ];
  }

  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const staticGain = parameters.staticGain;
    const modGain = parameters.modGain;
    for (let i = 0; i < outputs.length; i++) { //move through each mono output
      let currentIn = inputs[i][0]; //input i, channel 0
      let currentOut = outputs[i][0]; //output i, channel 0
      if (modGain.length == 1) {  //modGain not being modulated
        if (staticGain.length == 1) { //staticGain hasn't changed this quantum
          //run through each sample
          for (let samp = 0; samp < currentOut.length; samp++) {
            //output = input * staticGain[0] (constant)
            let tempOut = currentIn[samp] * staticGain[0];
            if (tempOut > 1) {
              currentOut[samp] = 1;
            } else if (tempOut < -1) {
              currentOut[samp] = -1;
            } else {
              currentOut[samp] = tempOut;
            }
          }
        } else if (staticGain.length == 128) { //staticGain HAS changed this quantum
          //output = input * staticGain[i] (changing)
          for (let samp = 0; samp < currentOut.length; samp++) {
            let tempOut = currentIn[samp] * staticGain[samp];
            if (tempOut > 1) {
              currentOut[samp] = 1;
            } else if (tempOut < -1) {
              currentOut[samp] = -1;
            } else {
              currentOut[samp] = tempOut;
            }
          }
        }
      } else if (modGain.length == 128) { //modGain being modulated
        if (staticGain.length == 1) {
          for (let samp = 0; samp < currentOut.length; samp++) {
            let tempOut = currentIn[samp] * (staticGain[0] + modGain[samp]);
            if (tempOut > 1) {
              currentOut[samp] = 1;
            } else if (tempOut < -1) {
              currentOut[samp] = -1;
            } else {
              currentOut[samp] = tempOut;
            }
          }
        } else if (staticGain.length == 128) {
          for (let samp = 0; samp < currentOut.length; samp++) {
            let tempOut = currentIn[samp] * (staticGain[samp] + modGain[samp]);
            if (tempOut > 1) {
              currentOut[samp] = 1;
            } else if (tempOut < -1) {
              currentOut[samp] = -1;
            } else {
              currentOut[samp] = tempOut;
            }
          }
        }
      }
    }
    return true;
  }
}

class panProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: "panPosition",
        defaultValue: .5,
        minValue: 0,
        maxValue: 1,
        automationRate: "a-rate"
      },
      {
        name: "modPosition",
        defaultValue: 0,
        minValue: -1,
        maxValue: 1,
        automationRate: "a-rate"
      }
    ];
  }

  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    //get parameters
    const pan = parameters.panPosition;
    const mod = parameters.modPosition;
    const input = inputs[0][0]; //mono input
    const outputL = outputs[0][0]; //left out
    const outputR = outputs[0][1]; //right out
    //flags to discern if params are k or a rate this quantum
    const panHasChanged = !(pan.length === 1);
    const modHasChanged = !(mod.length === 1);
    let panVal = pan[0];
    let modVal = mod[0];

    //loop through mono input
    for (let i = 0; i < input.length; i++) {
      if (panHasChanged) {
        panVal = pan[i];
      }
      if (modHasChanged) {
        modVal = mod[i];
      }
      outputL[i] = input[i] * (1 - panVal);
      outputR[i] = input[i] * panVal;
    }
    return true;
  }
}

registerProcessor("gainProcessor", gainProcessor);
registerProcessor("panProcessor", panProcessor);
