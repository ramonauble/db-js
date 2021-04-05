class modMixProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: "staticVal",
        defaultValue: 0,
      }
    ];
  }

  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const staticVal = parameters.staticVal;
    for (let i = 0; i < outputs.length; i++) { //move through each output
      let currentIn = inputs[i][0]; //input in, channel 0
      let currentOut = outputs[i][0]; //output in, channel 0
      for (let samp = 0; samp < currentOut.length; samp++) { //run thru each sample
        if (staticVal.length == 1) {  //k rate
          currentOut[samp] = staticVal[0];
        } else if (staticVal.length == 128) { //a rate
          currentOut[samp] = staticVal[samp];
        }
      }
    }
    return true;
  }
}

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
            if (tempOut > 1.33) {
              currentOut[samp] = 1.33;
            } else if (tempOut < -1.33) {
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

registerProcessor("mod-mix-processor", modMixProcessor);
registerProcessor("gainProcessor", gainProcessor);
