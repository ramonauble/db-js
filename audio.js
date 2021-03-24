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
  displayCanvCtx.font = "30px monospace";
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
    revButton: "#DB689C"
  };

  var titleDict = {
    oscButton: "mix",
    ratButton: "ratio",
    ofxButton: "shape",
    panButton: "pan",
    ampButton: "envelope",
    revButton: "reverb"
  };

  //LUT of oscillator tuning ratios (in ref. to fundamental)
  var ratioDict = {
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
  var activePage = "oscButton";
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
      this.LGain1.gain.value = .45;
      this.LGain2.gain.value = .45;
      this.LGain3.gain.value = .45;
      this.LGain4.gain.value = .45;
      this.LGain5.gain.value = .45;
      this.LGain6.gain.value = .45;
      this.RGain1.gain.value = .45;
      this.RGain2.gain.value = .45;
      this.RGain3.gain.value = .45;
      this.RGain4.gain.value = .45;
      this.RGain5.gain.value = .45;
      this.RGain6.gain.value = .45;

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

  //init oscillator frequencies
  changeFreqs(voice1.fundamental);
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
      changeFreqs(voice1.fundamental);
    } else if ($this.hasClass("ofxSlider")) {
      sliderVals["ofxButton"][$this.attr("id")] = $this.val();
      var currentDist = distNodeDict[$this.attr("id")];
      var currentPre = preNodeDict[$this.attr("id")];
      currentPre.gain.setTargetAtTime(($this.val()/256), synthCtx.currentTime, .005);
      currentDist.gain.setTargetAtTime(.9*($this.val()/256), synthCtx.currentTime, .005);
    } else if ($this.hasClass("panSlider")) {
      sliderVals["panButton"][$this.attr("id")] = $this.val();
      var currentLeft = leftGainDict[$this.attr("id")];
      var currentRight = rightGainDict[$this.attr("id")];
      currentRight.gain.setTargetAtTime((.75*((255 - $this.val())/255)), synthCtx.currentTime, .005);
      currentLeft.gain.setTargetAtTime((.75*(($this.val())/255)), synthCtx.currentTime, .005);;
    } else if ($this.hasClass("ampSlider")) {
      sliderVals["ampButton"][$this.attr("id")] = $this.val();
    } else if ($this.hasClass("revSlider")) {
      sliderVals["revButton"][$this.attr("id")] = $this.val();
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
        let p1 = sliderVals[activePage]["s1"];
        let p2 = sliderVals[activePage]["s2"];
        let p3 = sliderVals[activePage]["s3"];
        let p4 = sliderVals[activePage]["s4"];
        let p5 = sliderVals[activePage]["s5"];
        let p6 = sliderVals[activePage]["s6"];
        //draw oscillator & shape mix values
        if (activePage == "oscButton" || activePage == "ofxButton") {
          displayCanvCtx.strokeText((p1/255.0).toFixed(2), 55, 55);
          displayCanvCtx.strokeText((p2/255.0).toFixed(2), 150, 55);
          displayCanvCtx.strokeText((p3/255.0).toFixed(2), 245, 55);
          displayCanvCtx.strokeText((p4/255.0).toFixed(2), 55, 120);
          displayCanvCtx.strokeText((p5/255.0).toFixed(2), 150, 120);
          displayCanvCtx.strokeText((p6/255.0).toFixed(2), 245, 120);
        //draw ratio values
        } else if (activePage == "ratButton") {
          displayCanvCtx.strokeText((ratioDict[p1 >>> 2]).toFixed(2), 55, 55);
          displayCanvCtx.strokeText((ratioDict[p2 >>> 2]).toFixed(2), 150, 55);
          displayCanvCtx.strokeText((ratioDict[p3 >>> 2]).toFixed(2), 245, 55);
          displayCanvCtx.strokeText((ratioDict[p4 >>> 2]).toFixed(2), 55, 120);
          displayCanvCtx.strokeText((ratioDict[p5 >>> 2]).toFixed(2), 150, 120);
          displayCanvCtx.strokeText((ratioDict[p6 >>> 2]).toFixed(2), 245, 120);
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

  //calculate sigmoid distortion curve
  function makeCurve(amount) {
    let curveOut = new Float32Array(256);
    let xVal = 0;
    for (let i = 0; i < 256; i++) {
      xVal = ((i/255)*2) - 1; //normalize input value to [-1, 1]
      curveOut[i] = ((Math.PI + amount)*xVal)/(Math.PI + (amount*Math.abs(xVal)));
    }
    return curveOut;
  }

  //resume context
  //remove touch end event listener (for iOS support)
  var resume = function() {
    synthCtx.resume();
    voice1.start();
    setTimeout(function() {
      if (synthCtx.state === 'running') {
        document.body.removeEventListener('touchstart', resume, false);
      }
    }, 0);
  };

  //catches input for the following:
  //  keyboard press - recalculates new fundamental
  //  shift press - logs shift state
  //  L/R arrow keys - shifts keyboard octave down/up
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

  //recalculate all frequencies on note change event
  function changeFreqs(newFund) {
    voice1.fundamental = newFund;
    let r1 = ratioDict[sliderVals["ratButton"]["s1"] >>> 2];
    let r2 = ratioDict[sliderVals["ratButton"]["s2"] >>> 2];
    let r3 = ratioDict[sliderVals["ratButton"]["s3"] >>> 2];
    let r4 = ratioDict[sliderVals["ratButton"]["s4"] >>> 2];
    let r5 = ratioDict[sliderVals["ratButton"]["s5"] >>> 2];
    let r6 = ratioDict[sliderVals["ratButton"]["s6"] >>> 2];
    oscNodeDict["s1"].frequency.setTargetAtTime
    (newFund*r1, synthCtx.currentTime, .00005);
    oscNodeDict["s2"].frequency.setTargetAtTime
    (newFund*r2, synthCtx.currentTime, .00005);
    oscNodeDict["s3"].frequency.setTargetAtTime
    (newFund*r3, synthCtx.currentTime, .00005);
    oscNodeDict["s4"].frequency.setTargetAtTime
    (newFund*r4, synthCtx.currentTime, .00005);
    oscNodeDict["s5"].frequency.setTargetAtTime
    (newFund*r5, synthCtx.currentTime, .00005);
    oscNodeDict["s6"].frequency.setTargetAtTime
    (newFund*r6, synthCtx.currentTime, .00005);
  }
});
