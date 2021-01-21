'use strict';

$(document).ready(function() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const synthCtx = new AudioContext();

  var osc1 = synthCtx.createOscillator();
  var osc2 = synthCtx.createOscillator();
  var osc3 = synthCtx.createOscillator();
  var osc4 = synthCtx.createOscillator();
  var osc5 = synthCtx.createOscillator();
  var osc6 = synthCtx.createOscillator();

  var oscGain1 = synthCtx.createGain();
  var oscGain2 = synthCtx.createGain();
  var oscGain3 = synthCtx.createGain();
  var oscGain4 = synthCtx.createGain();
  var oscGain5 = synthCtx.createGain();
  var oscGain6 = synthCtx.createGain();

  oscGain1.gain.value = 1.0;
  oscGain2.gain.value = 0.8;
  oscGain3.gain.value = 0.6;
  oscGain4.gain.value = 0.4;
  oscGain5.gain.value = 0.2;
  oscGain6.gain.value = 0.1;

  osc1.frequency.value = 440;
  osc2.frequency.value = 880;
  osc3.frequency.value = 1320;
  osc4.frequency.value = 1760;
  osc5.frequency.value = 2200;
  osc6.frequency.value = 2640;

  osc1.connect(oscGain1).connect(synthCtx.destination);
  osc2.connect(oscGain2).connect(synthCtx.destination);
  osc3.connect(oscGain3).connect(synthCtx.destination);
  osc4.connect(oscGain4).connect(synthCtx.destination);
  osc5.connect(oscGain5).connect(synthCtx.destination);
  osc6.connect(oscGain6).connect(synthCtx.destination);

  //osc1.start();
  //osc2.start();
  //osc3.start();
  //osc4.start();
  //osc5.start();
  //osc6.start();

  $(".pageButton").click(function() {
    console.log("test");
    //synthCtx.resume();
  });
});
