'use strict';

$(document).ready(function() {
  //create audio context
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const synthCtx = new AudioContext();
  const distCurve = makeCurve(20); //generate distortion curve

  //reference canvas & get/configure context for drawing
  const $displayCanv = $("#displayCanv");
  const displayCanvCtx = $displayCanv[0].getContext("2d");
  const displayCanvWidth = displayCanv.width;
  const displayCanvHeight = displayCanv.height;
  displayCanvCtx.fillStyle = "#5D2E7B";
  displayCanvCtx.lineWidth = 3;
  displayCanvCtx.strokeStyle = "#FFFFFF";

  //instantiate analyser node (for oscilloscope)
  var scope = synthCtx.createAnalyser();
  scope.fftSize = 512;

  //configure variables for drawing time domain waveform
  var binLength = scope.frequencyBinCount; //fftSize/2 == 256
  var tDomainWave = new Uint8Array(binLength); //256 unsigned bytes
  var binWidth = (displayCanvWidth * 1.0) / binLength; //width of each "pixel"
  var x = 0; //init vertical position

  //define dictionaries for sliders & fill colors
  var $sliderDict = {
    s1: $("#s1"),
    s2: $("#s2"),
    s3: $("#s3"),
    s4: $("#s4"),
    s5: $("#s5"),
    s6: $("#s6")
  };

  var colorsDict = {
    oscButton: "#5D2E7B",
    ratButton: "#A15ECE",
    ofxButton: "#C75858",
    panButton: "#8AC497",
    ampButton: "#848EDF",
    lfoButton: "#DB689C"
  };

  //LUT of oscillator tuning ratios (in ref. to fundamental)
  var ratioDict = {
    63: 8.67, 62: 8.50, 61: 8.33, 60: 8.00,
    59: 7.67, 58: 7.50, 57: 7.33, 56: 7.00,
    55: 6.67, 54: 6.50, 53: 6.33, 52: 6.00,
    51: 5.67, 50: 5.50, 49: 5.33, 48: 5.00,
    47: 4.67, 46: 4.50, 45: 4.33, 44: 4.00,
    43: 3.67, 42: 3.50, 41: 3.33, 40: 3.00,
    39: 2.67, 38: 2.50, 37: 2.33, 36: 2.00,
    35: 1.67, 34: 1.50, 33: 1.33, 32: 1.00,
    31: 1.00, 30: 0.80, 29: 0.75, 28: 0.67,
    27: 0.60, 26: .571, 25: 0.50, 24: 0.44,
    23: .429, 22: 0.40, 21: .375, 20: .364,
    19: .333, 18: .308, 17: .300, 16: .286,
    15: .272, 14: .267, 13: 0.25, 12: .235,
    11: .231, 10: .222, 9: .214, 8: .211,
    7: 0.20, 6: .190, 5: .188, 4: .181,
    3: .176, 2: .174, 1: .167, 0: 0.16,
  };

  //instantiate memory for all instantaneous param states
  var sliderVals = {
    oscButton: {
      s1: 255,
      s2: 127,
      s3: 63,
      s4: 31,
      s5: 15,
      s6: 7
    },
    ratButton: {
      s1: 0,
      s2: 0,
      s3: 0,
      s4: 0,
      s5: 0,
      s6: 0
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
      s1: 0,
      s2: 0,
      s3: 0,
      s4: 0,
      s5: 0,
      s6: 0
    },
    ampButton: {
      s1: 0,
      s2: 0,
      s3: 0,
      s4: 0,
      s5: 0,
      s6: 0
    },
    lfoButton: {
      s1: 0,
      s2: 0,
      s3: 0,
      s4: 0,
      s5: 0,
      s6: 0
    },
  };

  //init active param page to osc page
  var activePage = "oscPage";
  //init active display page to info page
  var activeUI = "wave";

  //voice class definition
  class Voice {
    //fundamental frequency of voice
    fundamental = 440;

    //new voice constructor - create audio nodes
    constructor() {
      //instantiate oscillator nodes
      this.osc1 = synthCtx.createOscillator();
      this.osc2 = synthCtx.createOscillator();
      this.osc3 = synthCtx.createOscillator();
      this.osc4 = synthCtx.createOscillator();
      this.osc5 = synthCtx.createOscillator();
      this.osc6 = synthCtx.createOscillator();
      //instantiate oscillator gain nodes
      this.oscGain1 = synthCtx.createGain();
      this.oscGain2 = synthCtx.createGain();
      this.oscGain3 = synthCtx.createGain();
      this.oscGain4 = synthCtx.createGain();
      this.oscGain5 = synthCtx.createGain();
      this.oscGain6 = synthCtx.createGain();
      //instantiate distortion gain nodes
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

      this.init();
    }

    //initalize voice properties & route nodes
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

      //init distortion mix - all 0 (no distortion)
      this.distGain1.gain.value = 0;
      this.distGain2.gain.value = 0;
      this.distGain3.gain.value = 0;
      this.distGain4.gain.value = 0;
      this.distGain5.gain.value = 0;
      this.distGain6.gain.value = 0;

      this.dist1.curve = distCurve;
      this.dist2.curve = distCurve;
      this.dist3.curve = distCurve;
      this.dist4.curve = distCurve;
      this.dist5.curve = distCurve;
      this.dist6.curve = distCurve;

      //route oscillators -> gain nodes -> analyser -> output
      this.osc1.connect(this.oscGain1).connect(scope).connect(synthCtx.destination);
      this.osc2.connect(this.oscGain2).connect(scope).connect(synthCtx.destination);
      this.osc3.connect(this.oscGain3).connect(scope).connect(synthCtx.destination);
      this.osc4.connect(this.oscGain4).connect(scope).connect(synthCtx.destination);
      this.osc5.connect(this.oscGain5).connect(scope).connect(synthCtx.destination);
      this.osc6.connect(this.oscGain6).connect(scope).connect(synthCtx.destination);
      //route oscillators -> dist. gain nodes -> distortion -> output
      this.osc1.connect(this.distGain1).connect(this.dist1).connect(scope).connect(synthCtx.destination);
      this.osc2.connect(this.distGain2).connect(this.dist2).connect(scope).connect(synthCtx.destination);
      this.osc3.connect(this.distGain3).connect(this.dist3).connect(scope).connect(synthCtx.destination);
      this.osc4.connect(this.distGain4).connect(this.dist4).connect(scope).connect(synthCtx.destination);
      this.osc5.connect(this.distGain5).connect(this.dist5).connect(scope).connect(synthCtx.destination);
      this.osc6.connect(this.distGain6).connect(this.dist6).connect(scope).connect(synthCtx.destination);
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

  //create & init voice (test)
  let voice1 = new Voice();
  voice1.start();

  //define dictionaries for node selection
  var gainNodeDict = {
    s1: voice1.oscGain1,
    s2: voice1.oscGain2,
    s3: voice1.oscGain3,
    s4: voice1.oscGain4,
    s5: voice1.oscGain5,
    s6: voice1.oscGain6
  };

  var oscNodeDict = {
    s1: voice1.osc1,
    s2: voice1.osc2,
    s3: voice1.osc3,
    s4: voice1.osc4,
    s5: voice1.osc5,
    s6: voice1.osc6
  }

  var distNodeDict = {
    s1: voice1.distGain1,
    s2: voice1.distGain2,
    s3: voice1.distGain3,
    s4: voice1.distGain4,
    s5: voice1.distGain5,
    s6: voice1.distGain6
  }

  //start test
  $(".pageButton").click(function() {
    synthCtx.resume();
    pageChange($(this).attr("id"));
  });

  //handle slider input for all slider page classes
  $(".pSlider").on("input", function() {
    let $this = $(this);
    if ($this.hasClass("oscSlider")) {
      sliderVals["oscButton"][$this.attr("id")] = $this.val(); //save value
      var currentGain = gainNodeDict[$this.attr("id")];       //get gain node
      currentGain.gain.value = $this.val()/256;              //set gain
    } else if ($this.hasClass("ratSlider")) {
      sliderVals["ratButton"][$this.attr("id")] = $this.val();
      var currentOsc = oscNodeDict[$this.attr("id")];
      currentOsc.frequency.value = (voice1.fundamental)*ratioDict[$this.val() >>> 2];
    } else if ($this.hasClass("ofxSlider")) {
      sliderVals["ofxButton"][$this.attr("id")] = $this.val();
      var currentDist = distNodeDict[$this.attr("id")];
      currentDist.gain.value = $this.val()/256;
    } else if ($this.hasClass("panSlider")) {
      sliderVals["panButton"][$this.attr("id")] = $this.val();
    } else if ($this.hasClass("ampSlider")) {
      sliderVals["ampButton"][$this.attr("id")] = $this.val();
    } else if ($this.hasClass("lfoSlider")) {
      sliderVals["lfoButton"][$this.attr("id")] = $this.val();
    }
  });

  //change fill color & update slider values on page change
  function pageChange(newPage) {
    displayCanvCtx.fillStyle = colorsDict[newPage];
    $sliderDict["s1"].val(sliderVals[newPage]["s1"]);
    $sliderDict["s2"].val(sliderVals[newPage]["s2"]);
    $sliderDict["s3"].val(sliderVals[newPage]["s3"]);
    $sliderDict["s4"].val(sliderVals[newPage]["s4"]);
    $sliderDict["s5"].val(sliderVals[newPage]["s5"]);
    $sliderDict["s6"].val(sliderVals[newPage]["s6"]);
  }

  //draw info & scope displays at ~30fps
  var lastUpdate;
  var updateTime = 33; //ms

  function drawCanvas(timestamp) {
    if (lastUpdate == undefined || (timestamp - lastUpdate) > 33) {
      lastUpdate = timestamp; //record latest update time
      scope.getByteTimeDomainData(tDomainWave); //grab TD waveform snapshot
      displayCanvCtx.fillRect(0, 0, displayCanvWidth, displayCanvHeight); //clear canvas

      if (activeUI == "info") { //draw info

      } else if (activeUI == "wave") { //draw scope
        displayCanvCtx.beginPath();
        for (let n = 0; n < binLength; n++) {
          let m = tDomainWave[n] / 255.0; //normalize to [0, 1)
          let y = m * (displayCanvHeight); //vert pos
          if (n == 0) {
            displayCanvCtx.moveTo(x, y); //init pos (0, y)
          } else {
            displayCanvCtx.lineTo(x, y); //draw next segment
          }
          x += binWidth; //increment x by displayCanvWidth/binCount ~1.17px
        }
        displayCanvCtx.stroke();
        x = 0;
      }
    }
    window.requestAnimationFrame(drawCanvas);
  }
  window.requestAnimationFrame(drawCanvas);

  //handle display page change
  $(".uiButton").click(function() {
    let $this = $(this);
    if ($this.attr("id") == "infoButton") {
      activeUI = "info";
    } else if ($this.attr("id") == "waveButton") {
      activeUI = "wave";
    }
  });

  //calculate distortion curve
  function makeCurve(amount) {
    let curveOut = new Float32Array(256);
    let xVal = 0;
    for (let i = 0; i < 256; i++) {
      xVal = ((i/255)*2) - 1; //normalize input value to [-1, 1]
      curveOut[i] = ((Math.PI + amount)*xVal)/(Math.PI + (amount*Math.abs(xVal)));
    }
    return curveOut;
  }
});
