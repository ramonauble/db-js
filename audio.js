'use strict';

$(document).ready(function() {
  //create audio context
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const synthCtx = new AudioContext();

  //voice class definition
  class Voice {
    //instantaneous frequency of voice
    fundamental = 440;

    //new voice constructor - create nodes
    constructor() {
      this.osc1 = synthCtx.createOscillator();
      this.osc2 = synthCtx.createOscillator();
      this.osc3 = synthCtx.createOscillator();
      this.osc4 = synthCtx.createOscillator();
      this.osc5 = synthCtx.createOscillator();
      this.osc6 = synthCtx.createOscillator();

      this.oscGain1 = synthCtx.createGain();
      this.oscGain2 = synthCtx.createGain();
      this.oscGain3 = synthCtx.createGain();
      this.oscGain4 = synthCtx.createGain();
      this.oscGain5 = synthCtx.createGain();
      this.oscGain6 = synthCtx.createGain();

      this.init();
    }

    //initalize voice properties
    init() {
      //init frequencies - simple harmonic series
      this.osc1.frequency.value = this.fundamental;
      this.osc2.frequency.value = this.fundamental * 2;
      this.osc3.frequency.value = this.fundamental * 3;
      this.osc4.frequency.value = this.fundamental * 4;
      this.osc5.frequency.value = this.fundamental * 5;
      this.osc6.frequency.value = this.fundamental * 6;

      //init ampltitudes - sawtooth-like decay (1/N)
      this.oscGain1.gain.value = 1.0;
      this.oscGain2.gain.value = 0.5;
      this.oscGain3.gain.value = 0.25;
      this.oscGain4.gain.value = 0.125;
      this.oscGain5.gain.value = 0.0625;
      this.oscGain6.gain.value = 0.03125;

      //connect oscillators to gain nodes
      //connect gain nodes to audio context
      this.osc1.connect(this.oscGain1).connect(synthCtx.destination);
      this.osc2.connect(this.oscGain2).connect(synthCtx.destination);
      this.osc3.connect(this.oscGain3).connect(synthCtx.destination);
      this.osc4.connect(this.oscGain4).connect(synthCtx.destination);
      this.osc5.connect(this.oscGain5).connect(synthCtx.destination);
      this.osc6.connect(this.oscGain6).connect(synthCtx.destination);
    }

    //start oscillators
    start() {
      this.osc1.start();
      this.osc2.start();
      this.osc3.start();
      this.osc4.start();
      this.osc5.start();
      this.osc6.start();
    }
  };

  //create & init test voice
  let voice1 = new Voice();
  voice1.start();

  //start test
  $(".pageButton").click(function() {
    console.log("test");
    synthCtx.resume();
  });
});
