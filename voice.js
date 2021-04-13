//voice class definition
class Voice {
  //fundamental frequency of voice - C5 default
  fundamental = 261.625565301;

  //new voice constructor
    //create all nodes
    //create node dictionaries
    //call init
  constructor(synthCtx, distCurve) {
    //instatiate convolver node for reverb
    this.reverb = synthCtx.createConvolver();
    //instantiate oscillator nodes
    this.osc1 = synthCtx.createOscillator();
    this.osc2 = synthCtx.createOscillator();
    this.osc3 = synthCtx.createOscillator();
    this.osc4 = synthCtx.createOscillator();
    this.osc5 = synthCtx.createOscillator();
    this.osc6 = synthCtx.createOscillator();
    //instantiate pre-distortion gain nodes
    this.preGain1 = synthCtx.createGain();
    this.preGain2 = synthCtx.createGain();
    this.preGain3 = synthCtx.createGain();
    this.preGain4 = synthCtx.createGain();
    this.preGain5 = synthCtx.createGain();
    this.preGain6 = synthCtx.createGain();
    //instantiate post-distortion gain nodes
    this.distGain1 = synthCtx.createGain();
    this.distGain2 = synthCtx.createGain();
    this.distGain3 = synthCtx.createGain();
    this.distGain4 = synthCtx.createGain();
    this.distGain5 = synthCtx.createGain();
    this.distGain6 = synthCtx.createGain();
    //instantiate distortion nodes
    this.dist1 = synthCtx.createWaveShaper();
    this.dist2 = synthCtx.createWaveShaper();
    this.dist3 = synthCtx.createWaveShaper();
    this.dist4 = synthCtx.createWaveShaper();
    this.dist5 = synthCtx.createWaveShaper();
    this.dist6 = synthCtx.createWaveShaper();

    //instantiate reverb input gain nodes - wet & dry
    this.revGain1 = synthCtx.createGain();
    this.revGain2 = synthCtx.createGain();
    this.revGain3 = synthCtx.createGain();
    this.revGain4 = synthCtx.createGain();
    this.revGain5 = synthCtx.createGain();
    this.revGain6 = synthCtx.createGain();
    this.dryGain1 = synthCtx.createGain();
    this.dryGain2 = synthCtx.createGain();
    this.dryGain3 = synthCtx.createGain();
    this.dryGain4 = synthCtx.createGain();
    this.dryGain5 = synthCtx.createGain();
    this.dryGain6 = synthCtx.createGain();

    this.VCA1 = synthCtx.createGain();
    this.VCA2 = synthCtx.createGain();
    this.VCA3 = synthCtx.createGain();
    this.VCA4 = synthCtx.createGain();
    this.VCA5 = synthCtx.createGain();
    this.VCA6 = synthCtx.createGain();

    //instantiate final mixer node (unity gain)
    this.mixGain = synthCtx.createGain();
    //instantiate oscillator & gain nodes for LFOs
    this.lfo1 = synthCtx.createOscillator();
    this.lfo2 = synthCtx.createOscillator();
    this.lfo3 = synthCtx.createOscillator();
    this.lfo4 = synthCtx.createOscillator();
    this.lfo5 = synthCtx.createOscillator();
    this.lfo6 = synthCtx.createOscillator();
    this.lfoGain1 = synthCtx.createGain();
    this.lfoGain2 = synthCtx.createGain();
    this.lfoGain3 = synthCtx.createGain();
    this.lfoGain4 = synthCtx.createGain();
    this.lfoGain5 = synthCtx.createGain();
    this.lfoGain6 = synthCtx.createGain();

    this.panNodeCfg = {
      outputChannelCount: [2],
      numberOfInputs: 1,
      numberOfOutputs: 1
    };
    this.oscNodeCfg = {
      outputChannelCount: [1],
      numberOfInputs: 0,
      numberOfOutputs: 1
    };
    this.envNodeCfg = {
      outputChannelCount: [1],
      numberOfInputs: 0,
      numberOfOutputs: 1
    };

    synthCtx.audioWorklet.addModule("./worklets.js").then(() => {
      this.oscGain1 = new AudioWorkletNode(synthCtx, "gainProcessor");
      this.oscGain2 = new AudioWorkletNode(synthCtx, "gainProcessor");
      this.oscGain3 = new AudioWorkletNode(synthCtx, "gainProcessor");
      this.oscGain4 = new AudioWorkletNode(synthCtx, "gainProcessor");
      this.oscGain5 = new AudioWorkletNode(synthCtx, "gainProcessor");
      this.oscGain6 = new AudioWorkletNode(synthCtx, "gainProcessor");

      this.preGain1 = new AudioWorkletNode(synthCtx, "gainProcessor");
      this.preGain2 = new AudioWorkletNode(synthCtx, "gainProcessor");
      this.preGain3 = new AudioWorkletNode(synthCtx, "gainProcessor");
      this.preGain4 = new AudioWorkletNode(synthCtx, "gainProcessor");
      this.preGain5 = new AudioWorkletNode(synthCtx, "gainProcessor");
      this.preGain6 = new AudioWorkletNode(synthCtx, "gainProcessor");

      this.oscPan1 = new AudioWorkletNode(synthCtx, "panProcessor", this.panNodeCfg);
      this.oscPan2 = new AudioWorkletNode(synthCtx, "panProcessor", this.panNodeCfg);
      this.oscPan3 = new AudioWorkletNode(synthCtx, "panProcessor", this.panNodeCfg);
      this.oscPan4 = new AudioWorkletNode(synthCtx, "panProcessor", this.panNodeCfg);
      this.oscPan5 = new AudioWorkletNode(synthCtx, "panProcessor", this.panNodeCfg);
      this.oscPan6 = new AudioWorkletNode(synthCtx, "panProcessor", this.panNodeCfg);

      this.distPan1 = new AudioWorkletNode(synthCtx, "panProcessor", this.panNodeCfg);
      this.distPan2 = new AudioWorkletNode(synthCtx, "panProcessor", this.panNodeCfg);
      this.distPan3 = new AudioWorkletNode(synthCtx, "panProcessor", this.panNodeCfg);
      this.distPan4 = new AudioWorkletNode(synthCtx, "panProcessor", this.panNodeCfg);
      this.distPan5 = new AudioWorkletNode(synthCtx, "panProcessor", this.panNodeCfg);
      this.distPan6 = new AudioWorkletNode(synthCtx, "panProcessor", this.panNodeCfg);

      this.ampEnv = new AudioWorkletNode(synthCtx, "envelopeNode", this.envNodeCfg);
      this.ampEnv.connect(this.mixGain.gain);

      this.trigEnv = this.ampEnv.parameters.get("state");
      this.envParamDict = {
        s1: this.ampEnv.parameters.get("attack"),
        s2: this.ampEnv.parameters.get("decay"),
        s3: this.ampEnv.parameters.get("sustain"),
        s4: this.ampEnv.parameters.get("release")
      };

      //dictionaries for node selection
      this.gainNodeDict = {
        s1: this.oscGain1.parameters.get("staticGain"),
        s2: this.oscGain2.parameters.get("staticGain"),
        s3: this.oscGain3.parameters.get("staticGain"),
        s4: this.oscGain4.parameters.get("staticGain"),
        s5: this.oscGain5.parameters.get("staticGain"),
        s6: this.oscGain6.parameters.get("staticGain")
      };
      this.preNodeDict = {
        s1: this.preGain1.parameters.get("staticGain"),
        s2: this.preGain2.parameters.get("staticGain"),
        s3: this.preGain3.parameters.get("staticGain"),
        s4: this.preGain4.parameters.get("staticGain"),
        s5: this.preGain5.parameters.get("staticGain"),
        s6: this.preGain6.parameters.get("staticGain")
      };
      this.oscPanDict = {
        s1: this.oscPan1.parameters.get("panPosition"),
        s2: this.oscPan2.parameters.get("panPosition"),
        s3: this.oscPan3.parameters.get("panPosition"),
        s4: this.oscPan4.parameters.get("panPosition"),
        s5: this.oscPan5.parameters.get("panPosition"),
        s6: this.oscPan6.parameters.get("panPosition")
      };
      this.distPanDict = {
        s1: this.distPan1.parameters.get("panPosition"),
        s2: this.distPan2.parameters.get("panPosition"),
        s3: this.distPan3.parameters.get("panPosition"),
        s4: this.distPan4.parameters.get("panPosition"),
        s5: this.distPan5.parameters.get("panPosition"),
        s6: this.distPan6.parameters.get("panPosition")
      };

      this.modDestDict = {
        oscButton: {
          PS1: this.oscGain1.parameters.get("modGain"),
          PS2: this.oscGain2.parameters.get("modGain"),
          PS3: this.oscGain3.parameters.get("modGain"),
          PS4: this.oscGain4.parameters.get("modGain"),
          PS5: this.oscGain5.parameters.get("modGain"),
          PS6: this.oscGain6.parameters.get("modGain")
        },
        ofxButton: {
          PS1: this.preGain1.parameters.get("modGain"),
          PS2: this.preGain2.parameters.get("modGain"),
          PS3: this.preGain3.parameters.get("modGain"),
          PS4: this.preGain4.parameters.get("modGain"),
          PS5: this.preGain5.parameters.get("modGain"),
          PS6: this.preGain6.parameters.get("modGain")
        },
      }

      this.oscPanModDict = {
        PS1: this.oscPan1.parameters.get("panPosition"),
        PS2: this.oscPan2.parameters.get("panPosition"),
        PS3: this.oscPan3.parameters.get("panPosition"),
        PS4: this.oscPan4.parameters.get("panPosition"),
        PS5: this.oscPan5.parameters.get("panPosition"),
        PS6: this.oscPan6.parameters.get("panPosition")
      };
      this.distPanModDict = {
        PS1: this.distPan1.parameters.get("panPosition"),
        PS2: this.distPan2.parameters.get("panPosition"),
        PS3: this.distPan3.parameters.get("panPosition"),
        PS4: this.distPan4.parameters.get("panPosition"),
        PS5: this.distPan5.parameters.get("panPosition"),
        PS6: this.distPan6.parameters.get("panPosition")
      };

      //init ampltitudes - sawtooth-like decay (1/N)f
      this.gainNodeDict["s1"].value = 1.0;
      this.gainNodeDict["s2"].value = 0.5;
      this.gainNodeDict["s3"].value = 0.25;
      this.gainNodeDict["s4"].value = 0.125;
      this.gainNodeDict["s5"].value = 0.0625;
      this.gainNodeDict["s6"].value = 0.03125;

      //init ampltitudes - sawtooth-like decay (1/N)f
      this.preNodeDict["s1"].value = 0;
      this.preNodeDict["s2"].value = 0;
      this.preNodeDict["s3"].value = 0;
      this.preNodeDict["s4"].value = 0;
      this.preNodeDict["s5"].value = 0;
      this.preNodeDict["s6"].value = 0;

      this.osc1.connect(this.oscGain1);
        this.oscGain1.connect(this.oscPan1).connect(this.VCA1);
      this.osc2.connect(this.oscGain2);
        this.oscGain2.connect(this.oscPan2).connect(this.VCA2);
      this.osc3.connect(this.oscGain3);
        this.oscGain3.connect(this.oscPan3).connect(this.VCA3);
      this.osc4.connect(this.oscGain4);
        this.oscGain4.connect(this.oscPan4).connect(this.VCA4);
      this.osc5.connect(this.oscGain5);
        this.oscGain5.connect(this.oscPan5).connect(this.VCA5);
      this.osc6.connect(this.oscGain6);
        this.oscGain6.connect(this.oscPan6).connect(this.VCA6);

      this.osc1.connect(this.preGain1).connect(this.dist1);
      this.osc2.connect(this.preGain2).connect(this.dist2);
      this.osc3.connect(this.preGain3).connect(this.dist3);
      this.osc4.connect(this.preGain4).connect(this.dist4);
      this.osc5.connect(this.preGain5).connect(this.dist5);
      this.osc6.connect(this.preGain6).connect(this.dist6);

      this.dist1.connect(this.distGain1);
        this.distGain1.connect(this.distPan1).connect(this.VCA1);
      this.dist2.connect(this.distGain2);
        this.distGain2.connect(this.distPan2).connect(this.VCA2);
      this.dist3.connect(this.distGain3);
        this.distGain3.connect(this.distPan3).connect(this.VCA3);
      this.dist4.connect(this.distGain4);
        this.distGain4.connect(this.distPan4).connect(this.VCA4);
      this.dist5.connect(this.distGain5);
        this.distGain5.connect(this.distPan5).connect(this.VCA5);
      this.dist6.connect(this.distGain6);
        this.distGain6.connect(this.distPan6).connect(this.VCA6);
    });

    //define dictionaries for easy node selection
    //during parameter (slider) value changes
    //--------------------------------------

    //oscillator nodes - slider change
    this.oscNodeDict = {
      s1: this.osc1,
      s2: this.osc2,
      s3: this.osc3,
      s4: this.osc4,
      s5: this.osc5,
      s6: this.osc6
    };
    //oscillator nodes - patch change
    this.oscNodeDictP = {
      PS1: this.osc1.frequency,
      PS2: this.osc2.frequency,
      PS3: this.osc3.frequency,
      PS4: this.osc4.frequency,
      PS5: this.osc5.frequency,
      PS6: this.osc6.frequency
    };
    //waveshaper post-gain nodes
    this.distNodeDict = {
      s1: this.distGain1,
      s2: this.distGain2,
      s3: this.distGain3,
      s4: this.distGain4,
      s5: this.distGain5,
      s6: this.distGain6
    };

    //reverb input gain nodes (wet)
    this.revGainDict = {
      s1: this.revGain1,
      s2: this.revGain2,
      s3: this.revGain3,
      s4: this.revGain4,
      s5: this.revGain5,
      s6: this.revGain6
    };
    //reverb bypass gain nodes (dry)
    this.dryGainDict = {
      s1: this.dryGain1,
      s2: this.dryGain2,
      s3: this.dryGain3,
      s4: this.dryGain4,
      s5: this.dryGain5,
      s6: this.dryGain6
    };

    //dictionary for lfo oscillator node selection
    this.lfoNodeDict = {
      oscButton: this.lfo1,
      ratButton: this.lfo2,
      ofxButton: this.lfo3,
      panButton: this.lfo4,
      ampButton: this.lfo5,
      revButton: this.lfo6
    };
    //dictionary for lfo gain node selection
    this.lfoGainDict = {
      oscButton: this.lfoGain1,
      ratButton: this.lfoGain2,
      ofxButton: this.lfoGain3,
      panButton: this.lfoGain4,
      ampButton: this.lfoGain5,
      revButton: this.lfoGain6
    };

    //instantiate ratio LUT & parameter (slider) state memory
    //-------------------------------------------------------
    //LUT of oscillator tuning ratios (in ref. to fundamental)
    this.ratioDict = {
      63: 4.00, 62: 3.875, 61: 3.833, 60: 3.80,
      59: 3.75, 58: 3.667, 57: 3.625, 56: 3.60,
      55: 3.50, 54: 3.40, 53: 3.375, 52: 3.33,
      51: 3.25, 50: 3.20, 49: 3.167, 48: 3.125,
      47: 3.00, 46: 2.875, 45: 2.833, 44: 2.80,
      43: 2.75, 42: 2.667, 41: 2.625, 40: 2.60,
      39: 2.50, 38: 2.40, 37: 2.375, 36: 2.333,
      35: 2.25, 34: 2.20, 33: 2.167, 32: 2.125,
      31: 2.00, 30: 1.875, 29: 1.833, 28: 1.80,
      27: 1.75, 26: 1.667, 25: 1.625, 24: 1.60,
      23: 1.50, 22: 1.40, 21: 1.375, 20: 1.33,
      19: 1.25, 18: 1.20, 17: 1.167, 16: 1.125,
      15: 1.00, 14: .875, 13: .833, 12: .80,
      11: .75, 10: .667, 9: .625, 8: .60,
      7: .50, 6: .40, 5: .375, 4: .333,
      3: .25, 2: .20, 1: .167, 0: 0.125,
    };
    //instantiate memory for all instantaneous param. states
    this.sliderVals = {
      oscButton: {
        s1: 255,
        s2: 127,
        s3: 63,
        s4: 31,
        s5: 15,
        s6: 7
      },
      ratButton: {
        s1: 12,
        s2: 28,
        s3: 60,
        s4: 124,
        s5: 188,
        s6: 252
      },
      ofxButton: {
        s1: 0,
        s2: 0,
        s3: 0,
        s4: 0,
        s5: 0,
        s6: 0
      },
      panButton: {
        s1: 127,
        s2: 127,
        s3: 127,
        s4: 127,
        s5: 127,
        s6: 127
      },
      ampButton: {
        s1: 0,
        s2: 0,
        s3: 0,
        s4: 0,
        s5: 0,
        s6: 0
      },
      revButton: {
        s1: 0,
        s2: 0,
        s3: 0,
        s4: 0,
        s5: 0,
        s6: 0
      }
    };

    this.lfoVals = {
      oscButton: {
        lfoS1: 0.1,
        lfoS2: 1,
        lfoS3: 0
      },
      ratButton: {
        lfoS1: 0.1,
        lfoS2: 1,
        lfoS3: 0
      },
      ofxButton: {
        lfoS1: 0.1,
        lfoS2: 1,
        lfoS3: 0
      },
      panButton: {
        lfoS1: 0.1,
        lfoS2: 1,
        lfoS3: 0
      },
      ampButton: {
        lfoS1: 0.1,
        lfoS2: 1,
        lfoS3: 0
      },
      revButton: {
        lfoS1: 0.1,
        lfoS2: 1,
        lfoS3: 0
      }
    };

    this.patchStates = {
      oscButton: {
        PS1: 0,
        PS2: 0,
        PS3: 0,
        PS4: 0,
        PS5: 0,
        PS6: 0
      },
      ratButton: {
        PS1: 0,
        PS2: 0,
        PS3: 0,
        PS4: 0,
        PS5: 0,
        PS6: 0
      },
      ofxButton: {
        PS1: 0,
        PS2: 0,
        PS3: 0,
        PS4: 0,
        PS5: 0,
        PS6: 0
      },
      panButton: {
        PS1: 0,
        PS2: 0,
        PS3: 0,
        PS4: 0,
        PS5: 0,
        PS6: 0
      },
      ampButton: {
        PS1: 0,
        PS2: 0,
        PS3: 0,
        PS4: 0,
        PS5: 0,
        PS6: 0
      },
      revButton: {
        PS1: 0,
        PS2: 0,
        PS3: 0,
        PS4: 0,
        PS5: 0,
        PS6: 0
      }
    };

    //initialize node parameters
    this.init(synthCtx, distCurve);
  }

  //initalize voice properties & route nodes
  init(synthCtx, distCurve) {

    //init distortion gain & mix - all 0 (no distortion)
    this.distGain1.gain.value = 0;
    this.distGain2.gain.value = 0;
    this.distGain3.gain.value = 0;
    this.distGain4.gain.value = 0;
    this.distGain5.gain.value = 0;
    this.distGain6.gain.value = 0;
    //enable internal oversampling for distortion
    this.dist1.oversample = "4x";
    this.dist2.oversample = "4x";
    this.dist3.oversample = "4x";
    this.dist4.oversample = "4x";
    this.dist5.oversample = "4x";
    this.dist6.oversample = "4x";
    //assign sigmoid waveshapercurve to distortion nodes
    this.dist1.curve = distCurve;
    this.dist2.curve = distCurve;
    this.dist3.curve = distCurve;
    this.dist4.curve = distCurve;
    this.dist5.curve = distCurve;
    this.dist6.curve = distCurve;

    //no input to reverb by default
    this.revGain1.gain.value = 0;
    this.revGain2.gain.value = 0;
    this.revGain3.gain.value = 0;
    this.revGain4.gain.value = 0;
    this.revGain5.gain.value = 0;
    this.revGain6.gain.value = 0;
    //full reverb bypass by default
    this.dryGain1.gain.value = 1;
    this.dryGain2.gain.value = 1;
    this.dryGain3.gain.value = 1;
    this.dryGain4.gain.value = 1;
    this.dryGain5.gain.value = 1;
    this.dryGain6.gain.value = 1;

    //final mixer node before output - unity
    this.mixGain.gain.value = 0;

    //init lfo oscillator frequency (1hz)
    this.lfo1.frequency.value = .1;
    this.lfo2.frequency.value = .1;
    this.lfo3.frequency.value = .1;
    this.lfo4.frequency.value = .1;
    this.lfo5.frequency.value = .1;
    this.lfo6.frequency.value = .1;
    //init lfo gains (0)
    this.lfoGain1.gain.value = 0;
    this.lfoGain2.gain.value = 0;
    this.lfoGain3.gain.value = 0;
    this.lfoGain4.gain.value = 0;
    this.lfoGain5.gain.value = 0;
    this.lfoGain6.gain.value = 0;

    //route oscillators -> gain nodes
      //route gain outputs -> L/R gain nodes
    //route oscillators -> dist nodes -> dist gain nodes
      //route dist gain outputs -> L/R gain nodes -> stereo VCAs

    this.VCA1.connect(this.dryGain1).connect(this.mixGain);
    this.VCA1.connect(this.revGain1).connect(this.reverb);
    this.VCA2.connect(this.dryGain2).connect(this.mixGain);
    this.VCA2.connect(this.revGain2).connect(this.reverb);
    this.VCA3.connect(this.dryGain3).connect(this.mixGain);
    this.VCA3.connect(this.revGain3).connect(this.reverb);
    this.VCA4.connect(this.dryGain4).connect(this.mixGain);
    this.VCA4.connect(this.revGain4).connect(this.reverb);
    this.VCA5.connect(this.dryGain5).connect(this.mixGain);
    this.VCA5.connect(this.revGain5).connect(this.reverb);
    this.VCA6.connect(this.dryGain6).connect(this.mixGain);
    this.VCA6.connect(this.revGain6).connect(this.reverb);

    //finalize audio signal path
      //route stereo reverb output -> audio destination
      //route stereo mixer output -> audio destination
    this.reverb.connect(this.mixGain);
    this.mixGain.connect(synthCtx.destination);

    //make connections for LFOs
      //route lfo output -> gain nodes
      //no further connections needed (they are made dynamically)
    this.lfo1.connect(this.lfoGain1);
    this.lfo2.connect(this.lfoGain2);
    this.lfo3.connect(this.lfoGain3);
    this.lfo4.connect(this.lfoGain4);
    this.lfo5.connect(this.lfoGain5);
    this.lfo6.connect(this.lfoGain6);
  }

  //start oscillators & lfos
  start() {
    this.osc1.start();
    this.osc2.start();
    this.osc3.start();
    this.osc4.start();
    this.osc5.start();
    this.osc6.start();

    this.lfo1.start();
    this.lfo2.start();
    this.lfo3.start();
    this.lfo4.start();
    this.lfo5.start();
    this.lfo6.start();
  }
};
