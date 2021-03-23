'use strict';

$(document).ready(function() {
  document.body.addEventListener('touchstart', resume, false);
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
  displayCanvCtx.font = "32px monospace";
  displayCanvCtx.textAlign = "center";

  //instantiate analyser node (for oscilloscope)
  var scope = synthCtx.createAnalyser();
  scope.fftSize = 512;

  //configure variables for drawing time domain waveform
  var binLength = scope.frequencyBinCount; //fftSize/2 == 256
  var tDomainWave = new Uint8Array(binLength); //256 unsigned bytes
  var binWidth = (displayCanvWidth * 1.0) / binLength; //width of each "pixel"
  var x = 0; //init vertical position

  //reference to page title DOM object
  var $pageTitle = $("#pageTitle");

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

  var titleDict = {
    oscButton: "mix",
    ratButton: "ratio",
    ofxButton: "shape",
    panButton: "pan",
    ampButton: "envelope",
    lfoButton: "lfo"
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
      s1: 128,
      s2: 144,
      s3: 160,
      s4: 176,
      s5: 192,
      s6: 208
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
    lfoButton: {
      s1: 0,
      s2: 0,
      s3: 0,
      s4: 0,
      s5: 0,
      s6: 0
    },
  };

  //define exponent numerators for calculating frequencies
  //from key presses (single octave chromatic scale)
  var keyDict = {
    65: 0, //a - C
    87: 1, //w - C#
    83: 2, //s - D
    69: 3, //e - D#
    68: 4, //d - E
    70: 5, //f - F
    84: 6, //t - F#
    71: 7, //g - G
    89: 8, //y - G#
    72: 9, //h - A
    85: 10, //u - A#
    74: 11, //j - B
    75: 12  //k - C2
  };
  //default to 5th octave of chromatic scale
  var octaveOffset = 0;
  var shiftPressed = false; //shift state

  //init active param page to osc page
  var activePage = "oscPage";
  //init active display page to info page
  var activeUI = "wave";

  //voice class definition
  class Voice {
    //fundamental frequency of voice - C5 default
    fundamental = 261.625565301;

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
      //instantiate osc/dist mixer nodes (unity gain)
      this.LGain1 = synthCtx.createGain();
      this.LGain2 = synthCtx.createGain();
      this.LGain3 = synthCtx.createGain();
      this.LGain4 = synthCtx.createGain();
      this.LGain5 = synthCtx.createGain();
      this.LGain6 = synthCtx.createGain();
      this.RGain1 = synthCtx.createGain();
      this.RGain2 = synthCtx.createGain();
      this.RGain3 = synthCtx.createGain();
      this.RGain4 = synthCtx.createGain();
      this.RGain5 = synthCtx.createGain();
      this.RGain6 = synthCtx.createGain();
      //stereo VCAs
      this.LVCA = synthCtx.createGain();
      this.RVCA = synthCtx.createGain();
      //stereo channel merger for output to destination
      this.stereoMerge = synthCtx.createChannelMerger(2);

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

      //init distortion gain & mix - all 0 (no distortion)
      this.preGain1.gain.value = 0;
      this.preGain2.gain.value = 0;
      this.preGain3.gain.value = 0;
      this.preGain4.gain.value = 0;
      this.preGain5.gain.value = 0;
      this.preGain6.gain.value = 0;
      this.distGain1.gain.value = 0;
      this.distGain2.gain.value = 0;
      this.distGain3.gain.value = 0;
      this.distGain4.gain.value = 0;
      this.distGain5.gain.value = 0;
      this.distGain6.gain.value = 0;

      this.dist1.oversample = "4x";
      this.dist2.oversample = "4x";
      this.dist3.oversample = "4x";
      this.dist4.oversample = "4x";
      this.dist5.oversample = "4x";
      this.dist6.oversample = "4x";

      this.dist1.curve = distCurve;
      this.dist2.curve = distCurve;
      this.dist3.curve = distCurve;
      this.dist4.curve = distCurve;
      this.dist5.curve = distCurve;
      this.dist6.curve = distCurve;

      //center pan for all oscillators by default
      this.LGain1.gain.value = .5;
      this.LGain2.gain.value = .5;
      this.LGain3.gain.value = .5;
      this.LGain4.gain.value = .5;
      this.LGain5.gain.value = .5;
      this.LGain6.gain.value = .5;
      this.RGain1.gain.value = .5;
      this.RGain2.gain.value = .5;
      this.RGain3.gain.value = .5;
      this.RGain4.gain.value = .5;
      this.RGain5.gain.value = .5;
      this.RGain6.gain.value = .5;

      //route oscillators -> gain nodes
        //route gain outputs -> L/R gain nodes -> stereo VCAs
      //route oscillators -> dist nodes -> dist gain nodes
        //route dist gain outputs -> L/R gain nodes -> stereo VCAs
      this.osc1.connect(this.oscGain1);
        this.oscGain1.connect(this.LGain1).connect(this.LVCA);
        this.oscGain1.connect(this.RGain1).connect(this.RVCA);
      this.osc1.connect(this.preGain1).connect(this.dist1).connect(this.distGain1);
        this.distGain1.connect(this.LGain1).connect(this.LVCA);
        this.distGain1.connect(this.RGain1).connect(this.RVCA);

      this.osc2.connect(this.oscGain2);
        this.oscGain2.connect(this.LGain2).connect(this.LVCA);
        this.oscGain2.connect(this.RGain2).connect(this.RVCA);
      this.osc2.connect(this.preGain2).connect(this.dist2).connect(this.distGain2);
        this.distGain2.connect(this.LGain2).connect(this.LVCA);
        this.distGain2.connect(this.RGain2).connect(this.RVCA);

      this.osc3.connect(this.oscGain3);
        this.oscGain3.connect(this.LGain3).connect(this.LVCA);
        this.oscGain3.connect(this.RGain3).connect(this.RVCA);
      this.osc3.connect(this.preGain3).connect(this.dist3).connect(this.distGain3);
        this.distGain3.connect(this.LGain3).connect(this.LVCA);
        this.distGain3.connect(this.RGain3).connect(this.RVCA);

      this.osc4.connect(this.oscGain4);
        this.oscGain4.connect(this.LGain4).connect(this.LVCA);
        this.oscGain4.connect(this.RGain4).connect(this.RVCA);
      this.osc4.connect(this.preGain4).connect(this.dist4).connect(this.distGain4);
        this.distGain4.connect(this.LGain4).connect(this.LVCA);
        this.distGain4.connect(this.RGain4).connect(this.RVCA);

      this.osc5.connect(this.oscGain5);
        this.oscGain5.connect(this.LGain5).connect(this.LVCA);
        this.oscGain5.connect(this.RGain5).connect(this.RVCA);
      this.osc5.connect(this.preGain5).connect(this.dist5).connect(this.distGain5);
        this.distGain5.connect(this.LGain5).connect(this.LVCA);
        this.distGain5.connect(this.RGain5).connect(this.RVCA);

      this.osc6.connect(this.oscGain6);
        this.oscGain6.connect(this.LGain6).connect(this.LVCA);
        this.oscGain6.connect(this.RGain6).connect(this.RVCA);
      this.osc6.connect(this.preGain6).connect(this.dist6).connect(this.distGain6);
        this.distGain6.connect(this.LGain6).connect(this.LVCA);
        this.distGain6.connect(this.RGain6).connect(this.RVCA);

      //finalize signal path - merge stereo VCAs into 2 channel output
      //then connect merger output to destination (audio output)
      //also connect merger output to scope for TD visualization
      this.LVCA.connect(this.stereoMerge, 0, 0);
      this.RVCA.connect(this.stereoMerge, 0, 1);
      this.stereoMerge.connect(synthCtx.destination);
      this.stereoMerge.connect(scope);
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

  var preNodeDict = {
    s1: voice1.preGain1,
    s2: voice1.preGain2,
    s3: voice1.preGain3,
    s4: voice1.preGain4,
    s5: voice1.preGain5,
    s6: voice1.preGain6
  }
  var distNodeDict = {
    s1: voice1.distGain1,
    s2: voice1.distGain2,
    s3: voice1.distGain3,
    s4: voice1.distGain4,
    s5: voice1.distGain5,
    s6: voice1.distGain6
  }

  var leftGainDict = {
    s1: voice1.LGain1,
    s2: voice1.LGain2,
    s3: voice1.LGain3,
    s4: voice1.LGain4,
    s5: voice1.LGain5,
    s6: voice1.LGain6
  }
  var rightGainDict = {
    s1: voice1.RGain1,
    s2: voice1.RGain2,
    s3: voice1.RGain3,
    s4: voice1.RGain4,
    s5: voice1.RGain5,
    s6: voice1.RGain6
  }

  //init sliders
  pageChange("oscButton");
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
      currentGain.gain.setTargetAtTime(($this.val()/256), synthCtx.currentTime, .005);              //set gain
    } else if ($this.hasClass("ratSlider")) {
      sliderVals["ratButton"][$this.attr("id")] = $this.val();
      var currentOsc = oscNodeDict[$this.attr("id")];
      currentOsc.frequency.setTargetAtTime((voice1.fundamental)*ratioDict[$this.val() >>> 2], synthCtx.currentTime, .005) ;
    } else if ($this.hasClass("ofxSlider")) {
      sliderVals["ofxButton"][$this.attr("id")] = $this.val();
      var currentDist = distNodeDict[$this.attr("id")];
      var currentPre = preNodeDict[$this.attr("id")];
      currentPre.gain.setTargetAtTime(($this.val()/256), synthCtx.currentTime, .005);
      currentDist.gain.setTargetAtTime(($this.val()/256), synthCtx.currentTime, .005);
    } else if ($this.hasClass("panSlider")) {
      sliderVals["panButton"][$this.attr("id")] = $this.val();
      var currentLeft = leftGainDict[$this.attr("id")];
      var currentRight = rightGainDict[$this.attr("id")];
      currentRight.gain.setTargetAtTime((.95*((255 - $this.val())/255)), synthCtx.currentTime, .005);
      currentLeft.gain.setTargetAtTime((.95*(($this.val())/255)), synthCtx.currentTime, .005);;
    } else if ($this.hasClass("ampSlider")) {
      sliderVals["ampButton"][$this.attr("id")] = $this.val();
    } else if ($this.hasClass("lfoSlider")) {
      sliderVals["lfoButton"][$this.attr("id")] = $this.val();
    }
  });

  //change fill color & update slider values on page change
  function pageChange(newPage) {
    activePage = newPage;
    displayCanvCtx.fillStyle = colorsDict[newPage];
    $pageTitle.html(titleDict[newPage]);
    $pageTitle.css("color", colorsDict[newPage]);
    $sliderDict["s1"].val(sliderVals[newPage]["s1"]);
    $sliderDict["s2"].val(sliderVals[newPage]["s2"]);
    $sliderDict["s3"].val(sliderVals[newPage]["s3"]);
    $sliderDict["s4"].val(sliderVals[newPage]["s4"]);
    $sliderDict["s5"].val(sliderVals[newPage]["s5"]);
    $sliderDict["s6"].val(sliderVals[newPage]["s6"]);
  }

  //draw info & scope displays at ~60fps
  var lastUpdate;
  var updateTime = 16.6667; //ms

  function drawCanvas(timestamp) {
    if (lastUpdate == undefined || (timestamp - lastUpdate) > 33) {
      lastUpdate = timestamp; //record latest update time
      scope.getByteTimeDomainData(tDomainWave); //grab TD waveform snapshot
      displayCanvCtx.fillRect(0, 0, displayCanvWidth, displayCanvHeight); //clear canvas

      if (activeUI == "info") { //draw info
        if (activePage == "oscPage") {

        } else if (activePage == "ratPage") {

        } else if (activePage == "ofxPage") {

        } else if (activePage == "panPage") {

        } else if (activePage == "ampPage") {

        } else if (activePage == "lfoPage") {

        }
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

  var resume = function() {
    synthCtx.resume();
    voice1.start();
    setTimeout(function() {
      if (synthCtx.state === 'running') {
        document.body.removeEventListener('touchstart', resume, false);
      }
    }, 0);
  };

  $(document).keydown(function(event) {
    let root = 261.625565301; //C5
    let expOffset = keyDict[event.which];
    if (expOffset !== undefined) {
      expOffset += (12*octaveOffset); //account for octave
      let newFreq = root*(2**(expOffset/12.0)); //12tet
      changeFreqs(newFreq);
    } else if (event.which == 16) { //catch shift press
      shiftPressed = true;
    } else if (event.which == 37 && shiftPressed) {
      if (octaveOffset > -2) { //left arrow - octave down
        octaveOffset--;
      }
    } else if (event.which == 39 && shiftPressed) {
      if (octaveOffset < 2) { //right arrow - octave up
        octaveOffset++;
      }
    }
  });

  //catch shift release & change shift state
  $(document).keyup(function(event) {
    if (event.which == 16) {
      shiftPressed = false;
    }
  });

  function changeFreqs(newFund) {
    voice1.fundamental = newFund;
    oscNodeDict["s1"].frequency.setTargetAtTime
    (newFund*ratioDict[sliderVals["ratButton"]["s1"] >>> 2], synthCtx.currentTime, .00005);
    oscNodeDict["s2"].frequency.setTargetAtTime
    (newFund*ratioDict[sliderVals["ratButton"]["s2"] >>> 2], synthCtx.currentTime, .00005);
    oscNodeDict["s3"].frequency.setTargetAtTime
    (newFund*ratioDict[sliderVals["ratButton"]["s3"] >>> 2], synthCtx.currentTime, .00005);
    oscNodeDict["s4"].frequency.setTargetAtTime
    (newFund*ratioDict[sliderVals["ratButton"]["s4"] >>> 2], synthCtx.currentTime, .00005);
    oscNodeDict["s5"].frequency.setTargetAtTime
    (newFund*ratioDict[sliderVals["ratButton"]["s5"] >>> 2], synthCtx.currentTime, .00005);
    oscNodeDict["s6"].frequency.setTargetAtTime
    (newFund*ratioDict[sliderVals["ratButton"]["s6"] >>> 2], synthCtx.currentTime, .00005);
  }
});
