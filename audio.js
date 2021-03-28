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

  //instantiate analyser node (for oscilloscope display)
  var scope = synthCtx.createAnalyser();
  scope.fftSize = 512;

  //configure variables for drawing time domain waveform
  var binLength = scope.frequencyBinCount; //fftSize/2 == 256
  var tDomainWave = new Uint8Array(binLength); //256 unsigned bytes
  var binWidth = (displayCanvWidth * 1.0) / binLength; //width of each "pixel"
  var x = 0; //init vertical position

  //reference to page title DOM object
  var $pageTitle = $("#pageTitle");

  //slider jquery object dictionary
  //(for faster selection during page changes)
  var $sliderDict = {
    s1: $("#s1"),
    s2: $("#s2"),
    s3: $("#s3"),
    s4: $("#s4"),
    s5: $("#s5"),
    s6: $("#s6")
  };

  //color dictionary to assocate page selection
  //with canvas fill & title colors
  var colorsDict = {
    oscButton: "#5D2E7B",
    ratButton: "#A15ECE",
    ofxButton: "#C75858",
    panButton: "#8AC497",
    ampButton: "#848EDF",
    revButton: "#DB689C"
  };

  //title dictionary to map page selection to page title
  var titleDict = {
    oscButton: "mix",
    ratButton: "ratio",
    ofxButton: "shape",
    panButton: "pan",
    ampButton: "envelope",
    revButton: "reverb"
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

  //create & init voice (test)
  let voice1 = new Voice(synthCtx, distCurve);
  voice1.mixGain.connect(scope);
  voice1.reverb.connect(scope);
  voice1.start();

  //calculate reverb impulse response & assign to convolver node buffer
  calcIR();
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
      voice1.sliderVals["oscButton"][$this.attr("id")] = $this.val(); //save value
      var currentGain = voice1.gainNodeDict[$this.attr("id")];       //get gain node
      currentGain.gain.setTargetAtTime(($this.val()/256), synthCtx.currentTime, .005);              //set gain
    } else if ($this.hasClass("ratSlider")) {
      voice1.sliderVals["ratButton"][$this.attr("id")] = $this.val();
      changeFreqs(voice1.fundamental);
    } else if ($this.hasClass("ofxSlider")) {
      voice1.sliderVals["ofxButton"][$this.attr("id")] = $this.val();
      var currentDist = voice1.distNodeDict[$this.attr("id")];
      var currentPre = voice1.preNodeDict[$this.attr("id")];
      currentPre.gain.setTargetAtTime(($this.val()/256), synthCtx.currentTime, .005);
      currentDist.gain.setTargetAtTime(.9*($this.val()/256), synthCtx.currentTime, .005);
    } else if ($this.hasClass("panSlider")) {
      voice1.sliderVals["panButton"][$this.attr("id")] = $this.val();
      var currentLeft = voice1.leftGainDict[$this.attr("id")];
      var currentRight = voice1.rightGainDict[$this.attr("id")];
      currentLeft.gain.setTargetAtTime((.75*((255 - $this.val())/255)), synthCtx.currentTime, .005);
      currentRight.gain.setTargetAtTime((.75*(($this.val())/255)), synthCtx.currentTime, .005);
    } else if ($this.hasClass("ampSlider")) {
      voice1.sliderVals["ampButton"][$this.attr("id")] = $this.val();
    } else if ($this.hasClass("revSlider")) {
      voice1.sliderVals["revButton"][$this.attr("id")] = $this.val();
      var currentRevGain = voice1.revGainDict[$this.attr("id")];
      var currentDryGain = voice1.dryGainDict[$this.attr("id")];
      currentDryGain.gain.setTargetAtTime(((255 - $this.val())/255.0), synthCtx.currentTime, .005);
      currentRevGain.gain.setTargetAtTime(($this.val()/255.0), synthCtx.currentTime, .005);
    }
  });

  //change fill color & update slider values on page change
  function pageChange(newPage) {
    activePage = newPage;
    displayCanvCtx.fillStyle = colorsDict[newPage];
    $pageTitle.html(titleDict[newPage]);
    $pageTitle.css("color", colorsDict[newPage]);
    $sliderDict["s1"].val(voice1.sliderVals[newPage]["s1"]);
    $sliderDict["s2"].val(voice1.sliderVals[newPage]["s2"]);
    $sliderDict["s3"].val(voice1.sliderVals[newPage]["s3"]);
    $sliderDict["s4"].val(voice1.sliderVals[newPage]["s4"]);
    $sliderDict["s5"].val(voice1.sliderVals[newPage]["s5"]);
    $sliderDict["s6"].val(voice1.sliderVals[newPage]["s6"]);
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
        let p1 = voice1.sliderVals[activePage]["s1"];
        let p2 = voice1.sliderVals[activePage]["s2"];
        let p3 = voice1.sliderVals[activePage]["s3"];
        let p4 = voice1.sliderVals[activePage]["s4"];
        let p5 = voice1.sliderVals[activePage]["s5"];
        let p6 = voice1.sliderVals[activePage]["s6"];
        //draw oscillator & shape mix values
        if (activePage == "oscButton" || activePage == "ofxButton") {
          displayCanvCtx.lineWidth = 3;
          displayCanvCtx.strokeText(Math.trunc(100*(p1/255.0)) + "%", 55, 55);
          displayCanvCtx.strokeText(Math.trunc(100*(p2/255.0)) + "%", 150, 55);
          displayCanvCtx.strokeText(Math.trunc(100*(p3/255.0)) + "%", 245, 55);
          displayCanvCtx.strokeText(Math.trunc(100*(p4/255.0)) + "%", 55, 120);
          displayCanvCtx.strokeText(Math.trunc(100*(p5/255.0)) + "%", 150, 120);
          displayCanvCtx.strokeText(Math.trunc(100*(p6/255.0)) + "%", 245, 120);
        //draw ratio values
        } else if (activePage == "ratButton") {
          displayCanvCtx.lineWidth = 3;
          displayCanvCtx.strokeText((voice1.ratioDict[p1 >>> 2]).toFixed(2), 55, 55);
          displayCanvCtx.strokeText((voice1.ratioDict[p2 >>> 2]).toFixed(2), 150, 55);
          displayCanvCtx.strokeText((voice1.ratioDict[p3 >>> 2]).toFixed(2), 245, 55);
          displayCanvCtx.strokeText((voice1.ratioDict[p4 >>> 2]).toFixed(2), 55, 120);
          displayCanvCtx.strokeText((voice1.ratioDict[p5 >>> 2]).toFixed(2), 150, 120);
          displayCanvCtx.strokeText((voice1.ratioDict[p6 >>> 2]).toFixed(2), 245, 120);
        //draw panning position display
        } else if (activePage == "panButton") {
          displayCanvCtx.lineWidth = 4;
          displayCanvCtx.beginPath();
            //draw horizontal lines
            displayCanvCtx.moveTo(25, 45); displayCanvCtx.lineTo(85, 45); displayCanvCtx.stroke();
            displayCanvCtx.moveTo(120, 45); displayCanvCtx.lineTo(180, 45); displayCanvCtx.stroke();
            displayCanvCtx.moveTo(215, 45); displayCanvCtx.lineTo(275, 45); displayCanvCtx.stroke();
            displayCanvCtx.moveTo(25, 110); displayCanvCtx.lineTo(85, 110); displayCanvCtx.stroke();
            displayCanvCtx.moveTo(120, 110); displayCanvCtx.lineTo(180, 110); displayCanvCtx.stroke();
            displayCanvCtx.moveTo(215, 110); displayCanvCtx.lineTo(275, 110); displayCanvCtx.stroke();
            //draw vertical lines at center
            displayCanvCtx.lineWidth = 2.5;
            displayCanvCtx.moveTo(55, 35); displayCanvCtx.lineTo(55, 55); displayCanvCtx.stroke();
            displayCanvCtx.moveTo(150, 35); displayCanvCtx.lineTo(150, 55); displayCanvCtx.stroke();
            displayCanvCtx.moveTo(245, 35); displayCanvCtx.lineTo(245, 55); displayCanvCtx.stroke();
            displayCanvCtx.moveTo(55, 100); displayCanvCtx.lineTo(55, 120); displayCanvCtx.stroke();
            displayCanvCtx.moveTo(150, 100); displayCanvCtx.lineTo(150, 120); displayCanvCtx.stroke();
            displayCanvCtx.moveTo(245, 100); displayCanvCtx.lineTo(245, 120); displayCanvCtx.stroke();
            //draw characters to display active pan locations
            displayCanvCtx.lineWidth = 4;
            displayCanvCtx.fillStyle = "#000000";
            displayCanvCtx.font = "36px monospace"
            displayCanvCtx.fillText("•", 25 + 60*(p1/255.0), 55);
            displayCanvCtx.fillText("•", 120 + 60*(p2/255.0), 55);
            displayCanvCtx.fillText("•", 215 + 60*(p3/255.0), 55);
            displayCanvCtx.fillText("•", 25 + 60*(p4/255.0), 120.5);
            displayCanvCtx.fillText("•", 120 + 60*(p5/255.0), 120.5);
            displayCanvCtx.fillText("•", 215 + 60*(p6/255.0), 120.5);
            displayCanvCtx.font = "30px monospace"
            displayCanvCtx.fillStyle = colorsDict["panButton"];
        }
      } else if (activeUI == "wave") { //draw scope
        displayCanvCtx.lineWidth = 4;
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

  async function calcIR() {
    let wavFile = await fetch("./wavData/1stbap_impulse_response.wav");
    let wavBuffer = await wavFile.arrayBuffer();
    voice1.reverb.buffer = await synthCtx.decodeAudioData(wavBuffer);
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
    let r1 = voice1.ratioDict[voice1.sliderVals["ratButton"]["s1"] >>> 2];
    let r2 = voice1.ratioDict[voice1.sliderVals["ratButton"]["s2"] >>> 2];
    let r3 = voice1.ratioDict[voice1.sliderVals["ratButton"]["s3"] >>> 2];
    let r4 = voice1.ratioDict[voice1.sliderVals["ratButton"]["s4"] >>> 2];
    let r5 = voice1.ratioDict[voice1.sliderVals["ratButton"]["s5"] >>> 2];
    let r6 = voice1.ratioDict[voice1.sliderVals["ratButton"]["s6"] >>> 2];
    voice1.oscNodeDict["s1"].frequency.setTargetAtTime
    (newFund*r1, synthCtx.currentTime, .00005);
    voice1.oscNodeDict["s2"].frequency.setTargetAtTime
    (newFund*r2, synthCtx.currentTime, .00005);
    voice1.oscNodeDict["s3"].frequency.setTargetAtTime
    (newFund*r3, synthCtx.currentTime, .00005);
    voice1.oscNodeDict["s4"].frequency.setTargetAtTime
    (newFund*r4, synthCtx.currentTime, .00005);
    voice1.oscNodeDict["s5"].frequency.setTargetAtTime
    (newFund*r5, synthCtx.currentTime, .00005);
    voice1.oscNodeDict["s6"].frequency.setTargetAtTime
    (newFund*r6, synthCtx.currentTime, .00005);
  }
});
