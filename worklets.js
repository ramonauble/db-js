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
      panVal = panVal;
      outputL[i] = input[i] * (1 - panVal);
      outputR[i] = input[i] * panVal;
    }
    return true;
  }
}

class additiveOsc extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: "frequency",
        defaultValue: 440.0,
        minValue: 0,
        maxValue: 22050,
        automationRate: "a-rate"
      },
      {
        name: "ratio",
        defaultValue: 1.00,
        minValue: 0,
        maxValue: 4.00,
        automationRate: "a-rate"
      }
    ];
  }

  constructor() {
    super();
    this.phase = new Uint32Array(1); //init accumulator
    this.max = (Math.pow(2, 32)) - 1;
    this.incr = 0;
  }

  process(inputs, outputs, parameters) {
    let frequency = parameters.frequency;
    let ratio = parameters.ratio;
    let iFreq = parameters.frequency[0];
    let iRatio = parameters.ratio[0];
    let freqHasChanged = !(frequency.length === 1);
    let ratioHasChanged = !(ratio.length === 1);
    let newFreq = 0;
    let normPhase = 0;
    let newPhase = 0;
    let newSamp = 0;
    let n = 0;
    const pi = Math.PI;

    for (let i = 0; i < outputs[0][0].length; i++) {
      if (freqHasChanged) {
        iFreq = frequency[i];
      }
      if (ratioHasChanged) {
        iRatio = ratio[i];
      }
      newFreq = iRatio * iFreq; //calc new frequency
      //calculate phase increment
        //newFreq/sampleRate gives # of cycles per sample
        //multiplying by max gives accumulator increment
      this.incr = this.max * (newFreq/(sampleRate));
      this.phase[0] += this.incr; //increment accumulator
      normPhase = this.phase[0]/(this.max);
      newPhase = 2*pi*normPhase; //normalized to radians
      newSamp = Math.sin(newPhase);
      for (n = 0; n < outputs.length; n++) {
        //output n, channel 0, sample i
        outputs[n][0][i] = newSamp;
      }
    }
    return true;
  }
}

class envelopeNode extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: "attack",
        defaultValue: .1,
        minValue: 0,
        maxValue: 1,
        automationRate: "a-rate"
      },
      {
        name: "decay",
        defaultValue: .5,
        minValue: 0,
        maxValue: 1,
        automationRate: "a-rate"
      },
      {
        name: "sustain",
        defaultValue: 0,
        minValue: 0,
        maxValue: 1,
        automationRate: "a-rate"
      },
      {
        name: "release",
        defaultValue: .5,
        minValue: 0,
        maxValue: 1,
        automationRate: "a-rate"
      },
      {
        name: "state",
        defaultValue: 0,
        minValue: 0,
        maxValue: 1,
        automationRate: "a-rate"
      }
    ];
  }

  constructor() {
    super();

    this.acc = new Uint32Array(1); //envelope accumulator state
    this.prevAcc = 0; //previous accumulator state (for stage change)
    this.accBuff = 0; //accumulator buffer (for release stage)
    this.max = (Math.pow(2, 32) - 1); //accumulator max
    this.inc = 0; //sample increment for current stage
    this.prevState = 0; //previous envelope state
    this.stage = 0; //init stage to not running
      //1 - attack, 2 - decay, 3 - sustain, 4 - release
  }

  process(inputs, outputs, parameters) {
    let output = outputs[0][0]; //output 0, channel 0

    let currentState = parameters.state;
    let currentAttack = parameters.attack;
    let currentDecay = parameters.decay;
    let currentSustain = parameters.sustain;
    let currentRelease = parameters.release;

    let stateHasChanged = !(currentState.length === 1);
    let attackHasChanged = !(currentAttack.length === 1);
    let decayHasChanged = !(currentDecay.length === 1);
    let sustainHasChanged = !(currentSustain.length === 1);
    let releaseHasChanged = !(currentRelease.length === 1);

    let sampleState;
    let sampleAttack;
    let sampleDecay;
    let sampleSustain;
    let sampleRelease;

    for (let i = 0; i < output.length; i++) {
      if (stateHasChanged) {
        sampleState = currentState[i];
      } else {
        sampleState = currentState[0];
      }
      if (attackHasChanged) {
        sampleAttack = currentAttack[i];
      } else {
        sampleAttack = currentAttack[0];
      }
      if (decayHasChanged) {
        sampleDecay = currentDecay[i];
      } else {
        sampleDecay = currentDecay[0];
      }
      if (sustainHasChanged) {
        sampleSustain = currentSustain[i];
      } else {
        sampleSustain = currentSustain[0];
      }
      if (releaseHasChanged) {
        sampleRelease = currentRelease[i];
      } else {
        sampleRelease = currentRelease[0];
      }

      if (this.prevState == 0 && sampleState == 1) { //note on
        this.acc = 0; //init accumulator
        this.prevAcc = 0;
        this.accBuff = 0;
        this.stage = 1; //initiate attack stage
        this.prevState = sampleState; //save state for current sample
      } else if (this.prevState == 1 && sampleState == 0) { //note off
        this.stage = 4; //initiate release stage
        this.prevState = sampleState; //save state for current sample
      }

      if (this.stage == 1) { //attack stage
        if (sampleAttack == 0) {
          this.inc = this.max;  //instant attack
          this.stage = 2;       //trigger decay on next sample
        } else {
          this.inc = this.max/(sampleAttack * sampleRate); //calculate increment
        }
        this.prevAcc = this.acc;  //save current accumulator state
        this.acc += this.inc;          //increment accumulator
        if (this.acc < this.max) {  //attack phase still in progress
          output[i] = this.acc/this.max //output between 0-1
        } else {              //accumulator overflow - trigger decay stage
          this.acc = this.max;//set accumulator to maximum
          output[i] = 1.0;    //end of sttack - output at max
          this.stage = 2;     //initiate decay stage - on next sample
        }
        this.accBuff = this.acc; //save accumulator state to buffer
      } else if (this.stage == 2) { //decay stage
        if (sampleDecay == 0) {
          this.inc = (this.max - this.max*sampleSustain); //dec directly to sustain
          this.stage = 3;
        } else {
          this.inc = (this.max - this.max*sampleSustain)/(sampleDecay * sampleRate);
        }
        this.prevAcc = this.acc;
        this.acc -= this.inc; //decrement to sustain
        if (this.acc > (this.max*sampleSustain)) {
          output[i] = this.acc/this.max //output between 0-1
        } else {
          this.acc = this.max * sampleSustain;
          output[i] = 1.0 * sampleSustain;
          this.stage = 3;
        }
        this.accBuff = this.acc; //save accumulator state to buffer
      } else if (this.stage == 3) {
        this.acc = this.max * sampleSustain;
        this.accBuff = this.acc;
        output[i] = 1.0 * sampleSustain; //hold until release
      } else if (this.stage == 4) {
        if (sampleRelease == 0) { //instant release
          this.inc = this.accBuff;
          this.stage = 0; //end of envelope
        } else {
          this.inc = this.accBuff/(sampleRelease * sampleRate)
        }
        this.prevAcc = this.acc;
        this.acc -= this.inc;
        if (this.acc > 0) {
          output[i] = this.acc/this.max;
        } else {
          output[i] = 0;
          this.stage = 0; //end envelope
        }
      }
    }
    return true;
  }
}

registerProcessor("gainProcessor", gainProcessor);
registerProcessor("panProcessor", panProcessor);
registerProcessor("additiveOsc", additiveOsc);
registerProcessor("envelopeNode", envelopeNode);
