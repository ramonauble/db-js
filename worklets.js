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
        maxValue: 1
      }
    ];
  }

  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const staticGain = parameters.staticGain;
    const modGain = parameters.modGain;
    for (let i = 0; i < outputs.length; i++) { //move through each output
      let currentIn = inputs[i][0]; //input in, channel 0
      let currentOut = outputs[i][0]; //output in, channel 0
      if (modGain.length == 1) {  //k rate
        for (let samp = 0; samp < currentOut.length; samp++) { //run thru each sample
          currentOut[samp] = currentIn[samp] * staticGain;
        }
      } else if (modGain.length == 128) { //a rate
        for (let samp = 0; samp < currentOut.length; samp++) { //run thru each sample
          currentOut[samp] = (currentIn[samp] * staticGain) + modGain;
        }
      }
    }
    return true;
  }
}

registerProcessor("mod-mix-processor", modMixProcessor);
registerProcessor("gainProcessor", gainProcessor);
