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

class bitCrushNode extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: "sampleRate",
        defaultValue: 1,
        minValue: .01,
        maxValue: 1,
        automationRate: "a-rate"
      },
      {
        name: "bitDepth",
        defaultValue: 1,
        minValue: .025,
        maxValue: 1,
        automationRate: "a-rate"
      },
      {
        name: "baseFreq",
        defaultValue: 2093.04,
        minValue: 0,
        maxValue: 48000,
        automationRate: "a-rate"
      }
    ];
  }

  constructor() {
    super();

    this.sampleRateHasChanged;
    this.sampleRateArr;
    this.sampleRate;

    this.bitRateHasChanged;
    this.bitRateArr;
    this.bitRate;

    this.baseFreqHasChanged;
    this.baseFreqArr;
    this.baseFreq = 2093.12;

    this.i;
    this.input;
    this.output;

    this.phasor = 0;
    this.lastSample;
    this.normSampleRate;

    this.bitMax = Math.pow(2, 8) - 1;
    this.bitBase;
    this.crushSample;
    this.normBitRate;

    this.baseDiv;
  }

  process(inputs, outputs, parameters) {
    this.sampleRateArr = parameters.sampleRate;
    this.sampleRate = this.sampleRateArr[0]; //init s rate to k-rate
    this.bitRateArr = parameters.bitDepth;
    this.bitRate = this.bitRateArr[0]; //init b rate to k-rate
    this.baseFreqArr = parameters.baseFreq;
    this.baseFreq = this.baseFreqArr[0]; //init base freq to k-rate
    this.input = inputs[0][0]; //input 0, channel 0
    this.output = outputs[0][0]; //output 0, channel 0

    //loop thru samples
    for (this.i = 0; this.i < this.input.length; this.i++) {

      //update sample rate param val if a-rate
      if (!this.sampleRateArr.length === 1) {
        this.sampleRate = this.sampleRateArr[this.i];
      }
      //update bit rate param val if a-rate
      if (!this.bitRateArr.length === 1) {
        this.bitRate = this.bitRateArr[this.i];
      }
      //update base freq param val if a-rate
      if (!this.baseFreqArr.length === 1) {
        this.baseFreq = this.baseFreqArr[this.i];
      }
      this.baseDiv = (this.baseFreq)/sampleRate;
      this.normSampleRate = this.sampleRate*this.baseDiv;
      this.normBitRate = this.bitRate;

      //boundary case - no srr in off position
      if (this.sampleRate == 1) {
        this.normSampleRate = 1;
      }

      //calculate new depth base
      this.bitBase = this.bitMax * this.normBitRate;

      //increment phasor & update sample if needed
      this.phasor += this.normSampleRate;
      if (this.phasor >= 1) {
        this.phasor -= 1;
        this.lastSample = this.input[this.i];
      }

      if (this.bitRate == 1) {
        this.crushSample = this.lastSample; //bypass crush
      } else {
        this.crushSample = Math.floor(((this.lastSample + 1)/2) * this.bitBase);
        this.crushSample = ((2*(this.crushSample/this.bitBase)) - 1); //normalize
      }
      //output most recently updated sample
      this.output[this.i] = this.crushSample;
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
        minValue: .005,
        maxValue: 1,
        automationRate: "a-rate"
      },
      {
        name: "decay",
        defaultValue: .5,
        minValue: 0.005,
        maxValue: 1,
        automationRate: "a-rate"
      },
      {
        name: "sustain",
        defaultValue: 0.005,
        minValue: 0,
        maxValue: 1,
        automationRate: "a-rate"
      },
      {
        name: "release",
        defaultValue: .5,
        minValue: 0.005,
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
        name: "peakVal",
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

    this.acc = 0; //envelope accumulator state
    this.accBuff = 0; //accumulator buffer (for release stage)
    this.max = (Math.pow(2, 16) - 1); //accumulator max
    this.inc = 0; //sample increment for current stage
    this.prevState = 0; //previous envelope state
    this.stage = 0; //init stage to not running

    this.stateBuffer;
    this.attackBuffer;
    this.decayBuffer;
    this.sustainBuffer;
    this.releaseBuffer;
    this.aCurveBuffer;
    this.peakValBuffer;

    this.stateHasChanged;
    this.attackHasChanged;
    this.decayHasChanged;
    this.sustainHasChanged;
    this.releaseHasChanged;
    this.aCurveHasChanged;
    this.peakValHasChanged;

    this.state;
    this.attack;
    this.decay;
    this.sustain;
    this.release;
    this.aCurve;
    this.peakVal;

    this.attackRate;
    this.decayRate;
    this.sustainThresh;
    this.releaseRate;

    this.output;
    this.i;
  }

  process(inputs, outputs, parameters) {
    //initialize output channe;
    this.output = outputs[0][0]; //output 0, channel 0

    //parameter value arrays for current quantum
    this.stateBuffer = parameters.state;
    this.attackBuffer = parameters.attack;
    this.decayBuffer = parameters.decay;
    this.sustainBuffer = parameters.sustain;
    this.releaseBuffer = parameters.release;
    this.aCurveBuffer = parameters.aCurve;
    this.peakValBuffer = parameters.peakVal;

    //flags to discern parameter states for current quantum
      //true is a-rate, false is k-rate
    this.stateHasChanged = !(this.stateBuffer.length === 1);
    this.attackHasChanged = !(this.attackBuffer.length === 1);
    this.decayHasChanged = !(this.decayBuffer.length === 1);
    this.sustainHasChanged = !(this.sustainBuffer.length === 1);
    this.releaseHasChanged = !(this.releaseBuffer.length === 1);
    this.aCurveHasChanged = !(this.aCurveBuffer.length === 1);
    this.peakValHasChanged = !(this.peakValBuffer.length === 1);

    //assign parameter values for current sample based on flag states
      //to prevent access of undefined elements
    for (this.i = 0; this.i < this.output.length; this.i++) {
      if (this.stateHasChanged) {
        this.state = this.stateBuffer[this.i];
      } else {
        this.state = this.stateBuffer[0];
      }
      if (this.attackHasChanged) {
        this.attack = this.attackBuffer[this.i];
      } else {
        this.attack = this.attackBuffer[0];
      }
      if (this.decayHasChanged) {
        this.decay = this.decayBuffer[this.i];
      } else {
        this.decay = this.decayBuffer[0];
      }
      if (this.sustainHasChanged) {
        this.sustain = this.sustainBuffer[this.i];
      } else {
        this.sustain = this.sustainBuffer[0];
      }
      if (this.releaseHasChanged) {
        this.release = this.releaseBuffer[this.i];
      } else {
        this.release = this.releaseBuffer[0];
      }
      if (this.aCurveHasChanged) {
        this.aCurve = this.aCurveBuffer[this.i];
      } else {
        this.aCurve = this.aCurveBuffer[0];
      }
      if (this.peakValHasChanged) {
        this.peakVal = this.peakValBuffer[this.i];
      } else {
        this.peakVal = this.peakValBuffer[0];
      }

      //note on/off when state changes state :]
      if (this.prevState == 0 && this.state == 1) { //note on
        this.stage = 1; //initiate attack stage
        this.prevState = this.state; //save state for current sample
      } else if (this.prevState == 1 && this.state == 0) { //note off
        this.stage = 4; //initiate release stage
        this.prevState = this.state; //save state for current sample
      }

      //ADSR envelope implementation
      if (this.stage == 1) { //attack stage
        this.attackRate = this.attack*sampleRate; //atk time as fraction of sample rate
        this.inc = this.max/this.attackRate;      //phase increment value
        this.accBuff = this.acc;                  //save accumulator state before increment (for release)
        this.acc += this.inc;                     //increment accumulator
        if (this.acc < this.max) {
          this.output[this.i] = this.aCurve*(this.acc/this.max) + (1 - this.aCurve)*Math.pow((this.acc/this.max), 3);
        } else {
          this.output[this.i] = 1.0;
          this.stage = 2;
        }
      } else if (this.stage == 2) { //decay stage
        this.decayRate = this.decay*sampleRate;       //decay time as fraction of sample rate
        this.sustainThresh = this.sustain*this.max;   //sustain threshold
        this.inc = (this.max - this.sustainThresh)/this.decayRate;
        this.accBuff = this.acc; //save accumulator state before decrement
        this.acc -= this.inc;    //decrement accumulator
        if (this.acc > this.sustainThresh) {
          this.output[this.i] = this.aCurve*(this.acc/this.max) + (1 - this.aCurve)*Math.pow((this.acc/this.max), 3);
        } else {
          this.output[this.i] = this.aCurve*this.sustain + (1 - this.aCurve)*Math.pow((this.sustain), 3);
          this.stage = 3;
        }
      } else if (this.stage == 3) {
        this.output[this.i] = this.aCurve*this.sustain + (1 - this.aCurve)*Math.pow((this.sustain), 3);     //hold until release
        this.acc = this.max*this.sustain;       //update accumulator & buffer (for release)
        this.accBuff = this.acc;
      } else if (this.stage == 4) {
        this.releaseRate = this.release*sampleRate; //release time as fraction of sample rate
        this.inc = this.accBuff/this.releaseRate;
        this.acc -= this.inc;
        if (this.acc > 0) {
          this.output[this.i] = this.aCurve*(this.acc/this.max) + (1 - this.aCurve)*Math.pow((this.acc/this.max), 3);
        } else {
          this.output[this.i] = 0;
          this.stage = 0; //end of envelope
        }
      }
    }
    return true;
  }
}

registerProcessor("panProcessor", panProcessor);
registerProcessor("bitCrushNode", bitCrushNode);
registerProcessor("envelopeNode", envelopeNode);
