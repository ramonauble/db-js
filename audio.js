'use strict';

$(document).ready(function() {
  //create audio context
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const synthCtx = new AudioContext();

  const $displayCanv = $("#displayCanv");
  const displayCanvCtx = $displayCanv[0].getContext("2d");
  const displayCanvWidth = displayCanv.width;
  const displayCanvHeight = displayCanv.height;
  displayCanvCtx.fillStyle = "#6a4086";
  displayCanvCtx.lineWidth = 3;
  displayCanvCtx.strokeStyle = "#FFFFFF";
  console.log(displayCanvWidth + ", " + displayCanvHeight);

  var scope = synthCtx.createAnalyser();
  scope.fftSize = 512;

  var binLength = scope.frequencyBinCount;
  var tDomainWave = new Uint8Array(binLength); //512 unsigned bytes

  var binWidth = (displayCanvWidth * 1.0) / binLength; //width of each "pixel"
  var x = 0; //init vertical position

  var $sliderDict = {
    s1: $("#s1"),
    s2: $("#s2"),
    s3: $("#s3"),
    s4: $("#s4"),
    s5: $("#s5"),
    s6: $("#s6")
  };

  //init active page to oscillator page
  var activePage = "oscPage";

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
      this.osc1.connect(this.oscGain1).connect(scope).connect(synthCtx.destination);
      this.osc2.connect(this.oscGain2).connect(scope).connect(synthCtx.destination);
      this.osc3.connect(this.oscGain3).connect(scope).connect(synthCtx.destination);
      this.osc4.connect(this.oscGain4).connect(scope).connect(synthCtx.destination);
      this.osc5.connect(this.oscGain5).connect(scope).connect(synthCtx.destination);
      this.osc6.connect(this.oscGain6).connect(scope).connect(synthCtx.destination);
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

  var gainNodeDict = {
    s1: voice1.oscGain1,
    s2: voice1.oscGain2,
    s3: voice1.oscGain3,
    s4: voice1.oscGain4,
    s5: voice1.oscGain5,
    s6: voice1.oscGain6
  };

  //start test
  $(".pageButton").click(function() {
    console.log("test");
    synthCtx.resume();
    pageChange($(this).attr("id"));
  });

  //handle slider input for all slider page classes
  $(".pSlider").on("input", function() {
    let $this = $(this);
    if ($this.hasClass("oscSlider")) {
      var currentGain = gainNodeDict[$this.attr("id")];
      currentGain.gain.value = $this.val()/256;
    } else if ($this.hasClass("ratSlider")) {
      console.log("rat: " + $this.val());
    } else if ($this.hasClass("ofxSlider")) {
      console.log("ofx: " + $this.val());
    } else if ($this.hasClass("panSlider")) {
      console.log("pan: " + $this.val());
    } else if ($this.hasClass("ampSlider")) {
      console.log("amp: " + $this.val());
    } else if ($this.hasClass("lfoSlider")) {
      console.log("lfo: " + $this.val());
    }
  });

  function pageChange(newPage) {
    if (newPage == "oscButton") {
      $sliderDict["s1"].val(voice1.oscGain1.gain.value * 255);
      $sliderDict["s2"].val(voice1.oscGain2.gain.value * 255);
      $sliderDict["s3"].val(voice1.oscGain3.gain.value * 255);
      $sliderDict["s4"].val(voice1.oscGain4.gain.value * 255);
      $sliderDict["s5"].val(voice1.oscGain5.gain.value * 255);
      $sliderDict["s6"].val(voice1.oscGain6.gain.value * 255);
    } else if (newPage == "ratButton") {

    } else if (newPage == "ofxButton") {

    } else if (newPage == "panButton") {

    } else if (newPage == "ampButton") {

    } else if (newPage == "lfoButton") {

    }
  }

  var lastUpdate;
  var updateTime = 33; //ms

  function oscilloscope(timestamp) {
    if (lastUpdate == undefined || (timestamp - lastUpdate) > 33) {
      lastUpdate = timestamp;
      scope.getByteTimeDomainData(tDomainWave);
      displayCanvCtx.fillRect(0, 0, displayCanvWidth, displayCanvHeight);
      displayCanvCtx.beginPath();

      for (let n = 0; n < binLength; n++) {
        let m = tDomainWave[n] / 255.0; //normalize to [0, 1)
        let y = m * (displayCanvHeight); //vert pos

        if (n == 0) {
          displayCanvCtx.moveTo(x, y); //init pos (0, )
        } else {
          displayCanvCtx.lineTo(x, y); //draw next segment
        }

        x += binWidth; //increment x by displayCanvWidth/binCount ~1.17px
      }
      displayCanvCtx.lineTo(displayCanvWidth, displayCanvHeight/2); //finish
      displayCanvCtx.stroke();
      x = 0;
    }
    window.requestAnimationFrame(oscilloscope);
  }
  window.requestAnimationFrame(oscilloscope);
});
