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

    this.staticGain;
    this.modGain;

    this.staticGHasChanged;
    this.modGHasChanged;

    this.sampleStaticGain;
    this.sampleModGain;

    this.currentIn;
    this.currentOut;

    this.i = 0;
    this.c = 0;
    this.s = 0;
  }

  process(inputs, outputs, parameters) {
    this.staticGain = parameters.staticGain;
    this.modGain = parameters.modGain;

    this.staticGHasChanged = !(this.staticGain.length === 1);
    this.modGHasChanged = !(this.modGain.length === 1);

    this.sampleStaticGain = this.staticGain[0];
    this.sampleModGain = this.modGain[0];

    for (this.i = 0; this.i < outputs.length; this.i++) { //move through each output
      for (this.c = 0; this.c < outputs[this.i].length; this.c++) { //move through each channel
        this.currentIn = inputs[0][0]; //input 0, channel 0
        this.currentOut = outputs[this.i][this.c]; //output i, channel 0
        for (this.s = 0; this.s < outputs[this.i][this.c].length; this.s++) {
          if (this.staticGHasChanged) {
            this.sampleStaticGain = this.staticGain[this.s];
          } else {
            this.sampleStaticGain = this.staticGain[0];
          }
          if (this.modGHasChanged) {
            this.sampleModGain = this.modGain[this.s];
          } else {
            this.sampleModGain = this.modGain[0];
          }
          this.currentOut[this.s] = this.currentIn[this.s] * (this.sampleStaticGain + this.sampleModGain);
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

    this.pan;
    this.mod;
    this.input;
    this.outputL;
    this.outputR;
    this.panHasChanged;
    this.modHasChanged;
    this.panVal;
    this.modVal;
    this.i;
  }

  process(inputs, outputs, parameters) {
    //get parameters
    this.pan = parameters.panPosition;
    this.mod = parameters.modPosition;
    //get inputs/outputs
    this.input = inputs[0][0]; //mono input
    this.outputL = outputs[0][0]; //left out
    this.outputR = outputs[0][1]; //right out
    //flags to discern if params are k or a rate this quantum
    this.panHasChanged = !(this.pan.length === 1);
    this.modHasChanged = !(this.mod.length === 1);
    //init param vars
    this.panVal = this.pan[0];
    this.modVal = this.mod[0];

    //loop through mono input
    for (this.i = 0; this.i < this.input.length; this.i++) {
      if (this.panHasChanged) {
        this.panVal = this.pan[this.i];
      }
      if (this.modHasChanged) {
        this.modVal = this.mod[this.i];
      }
      this.outputL[this.i] = this.input[this.i] * (1 - this.panVal);
      this.outputR[this.i] = this.input[this.i] * this.panVal;
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
        minValue: .01,
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
        name: "aCurve",
        defaultValue: .5,
        minValue: 0,
        maxValue: 1,
        automationRate: "a-rate"
      },
      {
        name: "drCurve",
        defaultValue: .5,
        minValue: 0,
        maxValue: 1,
        automationRate: "a-rate"
      },
      {
        name: "state",
        defaultValue: .5,
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
    this.normAcc //normalized value bounded between 0-1 - acc/max

    this.currentState;
    this.currentAttack;
    this.currentDecay;
    this.currentSustain;
    this.currentRelease;
    this.currentACurve;
    this.currentDRCurve;

    this.stateHasChanged;
    this.attackHasChanged;
    this.decayHasChanged;
    this.sustainHasChanged;
    this.releaseHasChanged;
    this.aCurveHasChanged;
    this.drCurveHasChanged;

    this.sampleState;
    this.sampleAttack;
    this.sampleDecay;
    this.sampleSustain;
    this.sampleRelease;
    this.sampleACurve;
    this.sampleDRCurve;

    this.output;
    this.i;
  }

  process(inputs, outputs, parameters) {
    //initialize output channe;
    this.output = outputs[0][0]; //output 0, channel 0

    //parameter value arrays for current quantum
    this.currentState = parameters.state;
    this.currentAttack = parameters.attack;
    this.currentDecay = parameters.decay;
    this.currentSustain = parameters.sustain;
    this.currentRelease = parameters.release;
    this.currentACurve = parameters.aCurve;
    this.currentDRCurve = parameters.drCurve;

    //flags to discern parameter states for current quantum
      //true is a-rate, false is k-rate
    this.stateHasChanged = !(this.currentState.length === 1);
    this.attackHasChanged = !(this.currentAttack.length === 1);
    this.decayHasChanged = !(this.currentDecay.length === 1);
    this.sustainHasChanged = !(this.currentSustain.length === 1);
    this.releaseHasChanged = !(this.currentRelease.length === 1);
    this.aCurveHasChanged = !(this.currentACurve.length === 1);
    this.drCurveHasChanged = !(this.currentDRCurve.length === 1);

    //assign parameter values for current sample based on flag states
      //to prevent access of undefined elements
    for (this.i = 0; this.i < this.output.length; this.i++) {
      if (this.stateHasChanged) {
        this.sampleState = this.currentState[this.i];
      } else {
        this.sampleState = this.currentState[0];
      }
      if (this.attackHasChanged) {
        this.sampleAttack = this.currentAttack[this.i];
      } else {
        this.sampleAttack = this.currentAttack[0];
      }
      if (this.decayHasChanged) {
        this.sampleDecay = this.currentDecay[this.i];
      } else {
        this.sampleDecay = this.currentDecay[0];
      }
      if (this.sustainHasChanged) {
        this.sampleSustain = this.currentSustain[this.i];
      } else {
        this.sampleSustain = this.currentSustain[0];
      }
      if (this.releaseHasChanged) {
        this.sampleRelease = this.currentRelease[this.i];
      } else {
        this.sampleRelease = this.currentRelease[0];
      }
      if (this.aCurveHasChanged) {
        this.sampleACurve = this.currentACurve[this.i];
      } else {
        this.sampleACurve = this.currentACurve[0];
      }
      if (this.drCurveHasChanged) {
        this.sampleDRCurve = this.currentDRCurve[this.i];
      } else {
        this.sampleDRCurve = this.currentDRCurve[0];
      }

      //note on/off when state changes state :]
      if (this.prevState == 0 && this.sampleState == 1) { //note on
        this.stage = 1; //initiate attack stage
        this.prevState = this.sampleState; //save state for current sample
      } else if (this.prevState == 1 && this.sampleState == 0) { //note off
        this.stage = 4; //initiate release stage
        this.prevState = this.sampleState; //save state for current sample
      }

      //ADSR envelope implementation
      if (this.stage == 1) { //attack stage
        if (this.sampleAttack == 0) {
          this.inc = this.max;  //instant attack
          this.stage = 2;       //trigger decay on next sample
        } else {
          this.inc = this.max/(this.sampleAttack * sampleRate); //calculate increment
        }
        this.prevAcc = this.acc;  //save current accumulator state
        this.acc += this.inc;          //increment accumulator
        if (this.acc < this.max) {  //attack phase still in progress
          this.normAcc = this.acc/this.max;
          this.output[this.i] = (this.sampleACurve*this.normAcc) + (1 - this.sampleACurve)*Math.expm1(this.normAcc)/(Math.E - 1); //output between 0-1
        } else {              //accumulator overflow - trigger decay stage
          this.acc = this.max;//set accumulator to maximum
          this.output[this.i] = 1.0;    //end of sttack - output at max
          this.stage = 2;     //initiate decay stage - on next sample
        }
        this.accBuff = this.acc; //save accumulator state to buffer
      } else if (this.stage == 2) { //decay stage
        if (this.sampleDecay == 0) {
          this.inc = (this.max - this.max*this.sampleSustain); //dec directly to sustain
          this.stage = 3;
        } else {
          this.inc = (this.max - this.max*this.sampleSustain)/(this.sampleDecay * sampleRate);
        }
        this.prevAcc = this.acc;
        this.acc -= this.inc; //decrement to sustain
        if (this.acc > (this.max*this.sampleSustain + this.inc)) {
          this.normAcc = this.acc/this.max;
          this.output[this.i] = (this.sampleACurve*this.normAcc) + (1 - this.sampleACurve)*Math.expm1(this.normAcc)/(Math.E - 1); //output between 0-1
        } else {
          this.acc = this.max * this.sampleSustain;
          this.output[this.i] = 1.0 * this.sampleSustain;
          this.stage = 3;
        }
        this.accBuff = this.acc; //save accumulator state to buffer
      } else if (this.stage == 3) {
        this.acc = this.max * this.sampleSustain;
        this.accBuff = this.acc;
        this.output[this.i] = 1.0 * this.sampleSustain; //hold until release
      } else if (this.stage == 4) {
        if (this.sampleRelease == 0) { //instant release
          this.inc = this.accBuff;
          this.stage = 0; //end of envelope
        } else {
          this.inc = this.accBuff/(this.sampleRelease * sampleRate)
        }
        this.prevAcc = this.acc;
        this.acc -= this.inc;
        if (this.acc > this.inc) {
          this.normAcc = this.acc/this.max;
          this.output[this.i] = (this.sampleACurve*this.normAcc) + (1 - this.sampleACurve)*Math.expm1(this.normAcc)/(Math.E - 1);
        } else {
          this.output[this.i] = 0;
          this.stage = 0; //end envelope
        }
      }
    }
    return true;
  }
}

registerProcessor("gainProcessor", gainProcessor);
registerProcessor("panProcessor", panProcessor);
registerProcessor("envelopeNode", envelopeNode);
