class modMixProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: "staticVal",
        defaultValue: .5,
        minValue: 0,
        maxValue: 1
      }
    ];
  }

  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const staticVal = parameters.staticVal;
    for (let i = 0; i < inputs.length; i++) { //move through each input
      let currentIn = inputs[i][0]; //input in, channel 0
      let currentOut = outputs[i][0]; //output in, channel 0
      for (let samp = 0; samp < currentOut.length; samp++) { //run thru each sample
        if (staticVal.length == 1) {
          currentOut[samp] = staticVal[0];
        } else if (staticVal.length == 128) {
          currentOut[samp] = staticVal[samp];
        }
      }
    }
    return true;
  }
}

registerProcessor("mod-mix-processor", modMixProcessor);
