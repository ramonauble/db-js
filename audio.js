//'use strict';

$(document).ready(function() {
  document.body.addEventListener('touchstart', resume, false);
  //create audio context
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const synthCtx = new AudioContext();
  const distCurve = makeCurve(20); //generate distortion curve
  //create voice
  let voice1 = new Voice(synthCtx, distCurve);
  //instantiate analyser node (for oscilloscope display)
  var scopeX = synthCtx.createAnalyser();
  var scopeY = synthCtx.createAnalyser();
  var scopeW = synthCtx.createAnalyser();
  var scopeSplitter = synthCtx.createChannelSplitter();
  scopeX.fftSize = 512;
  scopeY.fftSize = 512;
  scopeW.fftSize = 512;
  //calculate reverb impulse response & assign to convolver node buffer
  calcIR();
  //init voice
  voice1.mixGain.connect(scopeW); //oscilloscope analyzer
  voice1.mixGain.connect(scopeSplitter); //lissajous analyzer
  scopeSplitter.connect(scopeX, 0);
  scopeSplitter.connect(scopeY, 1);
  voice1.start();

  //reference canvas & get/configure context for drawing
  const $displayCanv = $("#displayCanv");
  const displayCanvCtx = $displayCanv[0].getContext("2d");
  const dCanvW = displayCanv.width;
  const dCanvH = displayCanv.height;
  displayCanvCtx.fillStyle = "#5D2E7B";
  displayCanvCtx.lineWidth = 3;
  displayCanvCtx.strokeStyle = "#FFFFFF";
  displayCanvCtx.font = "30px monospace";
  displayCanvCtx.textAlign = "center";

  //reference lfo parameter span elements & index with slider ids
  const $lfoInfo = {
    lfoS1: $("#lfoInfo1"),
    lfoS2: $("#lfoInfo2"),
    lfoS3: $("#lfoInfo3")
  };

  //reference lfo patch state elements & index with integers
  const $patchButtons = {
    1: $("#PS1"),
    2: $("#PS2"),
    3: $("#PS3"),
    4: $("#PS4"),
    5: $("#PS5"),
    6: $("#PS6")
  };
  //to convert between index & id
  const patchConv = {
    1: "PS1",
    2: "PS2",
    3: "PS3",
    4: "PS4",
    5: "PS5",
    6: "PS6"
  };

  //configure variables for drawing canvas
  const pi = Math.PI;
  var binLength = scopeX.frequencyBinCount; //fftSize/2 == 256
  var tdWaveX = new Float32Array(binLength); //256 floats [-1, 1]
  var tdWaveY = new Float32Array(binLength); //256 floats [-1, 1]
  var tdWaveW = new Float32Array(binLength); //256 floats [-1, 1]
  var binWidth = (dCanvW * 1.0) / binLength; //width of each "pixel"

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
  //same for lfo sliders
  var $lfoSliderDict = {
    lfoS1: $("#lfoS1"),
    lfoS2: $("#lfoS2"),
    lfoS3: $("#lfoS3")
  };
  var lfoShapeDict = {
    1: "sin",
    2: "tri",
    3: "sqr",
    4: "saw"
  };
  var lfoShapeSetDict = {
    1: "sine",
    2: "triangle",
    3: "square",
    4: "sawtooth"
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
      var currentGain = voice1.gainNodeDict[$this.attr("id")];
      currentGain.setTargetAtTime(($this.val()/255.0), synthCtx.currentTime, .005); //set gain
    } else if ($this.hasClass("ratSlider")) {
      voice1.sliderVals["ratButton"][$this.attr("id")] = $this.val();
      changeFreqs(voice1.fundamental);
    } else if ($this.hasClass("ofxSlider")) {
      voice1.sliderVals["ofxButton"][$this.attr("id")] = $this.val();
      var currentDist = voice1.distNodeDict[$this.attr("id")];
      var currentPre = voice1.preNodeDict[$this.attr("id")];
      currentPre.setTargetAtTime(($this.val()/256), synthCtx.currentTime, .005);
      currentDist.gain.setTargetAtTime(($this.val()/256), synthCtx.currentTime, .005);
    } else if ($this.hasClass("panSlider")) {
      voice1.sliderVals["panButton"][$this.attr("id")] = $this.val();
      var currentOscP = voice1.oscPanDict[$this.attr("id")];
      var currentDistP = voice1.distPanDict[$this.attr("id")];
      currentOscP.setTargetAtTime(($this.val()/255.0), synthCtx.currentTime, .005);
      currentDistP.setTargetAtTime(($this.val()/255.0), synthCtx.currentTime, .005);
    } else if ($this.hasClass("ampSlider")) {
      voice1.sliderVals["ampButton"][$this.attr("id")] = $this.val();
      var currentEnvP = voice1.envParamDict[$this.attr("id")];
      currentEnvP.setTargetAtTime(($this.val()/255.0), synthCtx.currentTime, .005);
    } else if ($this.hasClass("revSlider")) {
      voice1.sliderVals["revButton"][$this.attr("id")] = $this.val();
      var currentRevGain = voice1.revGainDict[$this.attr("id")];
      var currentDryGain = voice1.dryGainDict[$this.attr("id")];
      //currentDryGain.gain.setTargetAtTime(((255 - ($this.val()))/255.0), synthCtx.currentTime, .005);
      currentRevGain.gain.setTargetAtTime(($this.val()/255.0), synthCtx.currentTime, .005);
    }
  });

  $(".aSlider").on("input", function() {
    let $this = $(this);
    let id = $this.attr("id");
    if (id == "lfoS1") {
      $lfoInfo[id].html("speed: " + parseFloat($this.val()).toFixed(1) + "hz");
      voice1.lfoVals[activePage][$this.attr("id")] = $this.val();
      voice1.lfoNodeDict[activePage].frequency
      .setTargetAtTime($this.val(), synthCtx.currentTime, .005);
    } else if (id == "lfoS2") {
      $lfoInfo[id].html("shape: " + lfoShapeDict[$this.val()]);
      voice1.lfoVals[activePage][$this.attr("id")] = $this.val();
      voice1.lfoNodeDict[activePage].type = lfoShapeSetDict[$this.val()];
    } else if (id == "lfoS3") {
      $lfoInfo[id].html("depth: " + parseFloat($this.val()).toFixed(1) + "%");
      voice1.lfoVals[activePage][$this.attr("id")] = $this.val();
      if (activePage == "ratButton") {
        voice1.lfoGainDict[activePage].gain
        .setTargetAtTime(($this.val()), synthCtx.currentTime, .005);
      } else {
        voice1.lfoGainDict[activePage].gain
        .setTargetAtTime(($this.val()/100.0), synthCtx.currentTime, .005);
      }
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

    $lfoSliderDict["lfoS1"].val(voice1.lfoVals[newPage]["lfoS1"]);
    $lfoSliderDict["lfoS2"].val(voice1.lfoVals[newPage]["lfoS2"]);
    $lfoSliderDict["lfoS3"].val(voice1.lfoVals[newPage]["lfoS3"]);
    $lfoInfo["lfoS1"].html("speed: " + parseFloat(voice1.lfoVals[newPage]["lfoS1"]).toFixed(1) + "hz");
    $lfoInfo["lfoS2"].html("shape: " + lfoShapeDict[voice1.lfoVals[newPage]["lfoS2"]]);
    $lfoInfo["lfoS3"].html("depth: " + parseFloat(voice1.lfoVals[newPage]["lfoS3"]).toFixed(1) + "%");

    for (let patch = 1; patch <= 6; patch++) {
      if (voice1.patchStates[activePage][patchConv[patch]] == 1) {
        $patchButtons[patch].addClass("selected");
        $patchButtons[patch].css("opacity", "100%");
      } else if (voice1.patchStates[activePage][patchConv[patch]] == 0) {
        $patchButtons[patch].removeClass("selected");
        $patchButtons[patch].css("opacity", "33%");
      }

    }
  }

  //draw info & scope displays at ~60fps
  var lastUpdate;
  var updateTime = 16.6667; //ms

  function drawCanvas(timestamp) {
    if (lastUpdate == undefined || (timestamp - lastUpdate) > 33) {
      lastUpdate = timestamp; //record latest update time
      displayCanvCtx.fillRect(0, 0, dCanvW, dCanvH); //clear canvas

      if (activeUI == "info") { //draw info
        let p1 = voice1.sliderVals[activePage]["s1"];
        let p2 = voice1.sliderVals[activePage]["s2"];
        let p3 = voice1.sliderVals[activePage]["s3"];
        let p4 = voice1.sliderVals[activePage]["s4"];
        let p5 = voice1.sliderVals[activePage]["s5"];
        let p6 = voice1.sliderVals[activePage]["s6"];
        //draw oscillator & shape mix values
        if (activePage == "oscButton" || activePage == "ofxButton") {
          displayCanvCtx.lineWidth = 2.33;
          displayCanvCtx.strokeText(Math.trunc(100*(p1/255.0)) + "%", 55, 55);
          displayCanvCtx.strokeText(Math.trunc(100*(p2/255.0)) + "%", 150, 55);
          displayCanvCtx.strokeText(Math.trunc(100*(p3/255.0)) + "%", 245, 55);
          displayCanvCtx.strokeText(Math.trunc(100*(p4/255.0)) + "%", 55, 120);
          displayCanvCtx.strokeText(Math.trunc(100*(p5/255.0)) + "%", 150, 120);
          displayCanvCtx.strokeText(Math.trunc(100*(p6/255.0)) + "%", 245, 120);
        //draw ratio values
        } else if (activePage == "ratButton") {
          displayCanvCtx.lineWidth = 2.33;
          displayCanvCtx.strokeText((voice1.ratioDict[p1 >>> 2]).toFixed(2), 55, 55);
          displayCanvCtx.strokeText((voice1.ratioDict[p2 >>> 2]).toFixed(2), 150, 55);
          displayCanvCtx.strokeText((voice1.ratioDict[p3 >>> 2]).toFixed(2), 245, 55);
          displayCanvCtx.strokeText((voice1.ratioDict[p4 >>> 2]).toFixed(2), 55, 120);
          displayCanvCtx.strokeText((voice1.ratioDict[p5 >>> 2]).toFixed(2), 150, 120);
          displayCanvCtx.strokeText((voice1.ratioDict[p6 >>> 2]).toFixed(2), 245, 120);
        //draw panning position display
        } else if (activePage == "panButton") {
          //draw horizontal lines
          displayCanvCtx.lineWidth = 4;
          displayCanvCtx.beginPath();
          displayCanvCtx.strokeStyle = "#000000"
          displayCanvCtx.moveTo(25, 45); displayCanvCtx.lineTo(85, 45); displayCanvCtx.stroke();
          displayCanvCtx.moveTo(120, 45); displayCanvCtx.lineTo(180, 45); displayCanvCtx.stroke();
          displayCanvCtx.moveTo(215, 45); displayCanvCtx.lineTo(275, 45); displayCanvCtx.stroke();
          displayCanvCtx.moveTo(25, 110); displayCanvCtx.lineTo(85, 110); displayCanvCtx.stroke();
          displayCanvCtx.moveTo(120, 110); displayCanvCtx.lineTo(180, 110); displayCanvCtx.stroke();
          displayCanvCtx.moveTo(215, 110); displayCanvCtx.lineTo(275, 110); displayCanvCtx.stroke();
          //draw vertical lines at center
          displayCanvCtx.lineWidth = 3;
          displayCanvCtx.beginPath();
          displayCanvCtx.strokeStyle = "#d5f5dc"
          displayCanvCtx.moveTo(55, 36.5); displayCanvCtx.lineTo(55, 53.5); displayCanvCtx.stroke();
          displayCanvCtx.moveTo(150, 36.5); displayCanvCtx.lineTo(150, 53.5); displayCanvCtx.stroke();
          displayCanvCtx.moveTo(245, 36.5); displayCanvCtx.lineTo(245, 53.5); displayCanvCtx.stroke();
          displayCanvCtx.moveTo(55, 101.5); displayCanvCtx.lineTo(55, 118.5); displayCanvCtx.stroke();
          displayCanvCtx.moveTo(150, 101.5); displayCanvCtx.lineTo(150, 118.5); displayCanvCtx.stroke();
          displayCanvCtx.moveTo(245, 101.5); displayCanvCtx.lineTo(245, 118.5); displayCanvCtx.stroke();
          //draw characters to display active pan locations
          displayCanvCtx.fillStyle = "#FFFFFF";
          displayCanvCtx.font = "40px monospace"
          displayCanvCtx.fillText("•", 25 + 60*(p1/255.0), 55.5);
          displayCanvCtx.fillText("•", 120 + 60*(p2/255.0), 55.5);
          displayCanvCtx.fillText("•", 215 + 60*(p3/255.0), 55.5);
          displayCanvCtx.fillText("•", 25 + 60*(p4/255.0), 120.5);
          displayCanvCtx.fillText("•", 120 + 60*(p5/255.0), 120.5);
          displayCanvCtx.fillText("•", 215 + 60*(p6/255.0), 120.5);
          displayCanvCtx.font = "30px monospace"
          displayCanvCtx.fillStyle = colorsDict["panButton"];
          displayCanvCtx.strokeStyle = "#FFFFFF"
        } else if (activePage == "revButton") {
          displayCanvCtx.lineWidth = 3;
          displayCanvCtx.beginPath();
          displayCanvCtx.fillStyle = "#FFFFFF";
          displayCanvCtx.arc(55, 45, (25*(p1/255.0) + 3), 0, 2*pi);
          displayCanvCtx.arc(150, 45, (25*(p2/255.0) + 3), 0, 2*pi);
          displayCanvCtx.arc(245, 45, (25*(p3/255.0) + 3), 0, 2*pi);
          displayCanvCtx.fill();
          displayCanvCtx.beginPath();
          displayCanvCtx.arc(55, 110, (25*(p4/255.0) + 3), 0, 2*pi);
          displayCanvCtx.arc(150, 110, (25*(p5/255.0) + 3), 0, 2*pi);
          displayCanvCtx.arc(245, 110, (25*(p6/255.0) + 3), 0, 2*pi);
          displayCanvCtx.fill();
          displayCanvCtx.fillStyle = colorsDict["revButton"];
        }
      } else if (activeUI == "wave") { //draw scope
        scopeW.getFloatTimeDomainData(tdWaveW);
        displayCanvCtx.lineWidth = 4;
        displayCanvCtx.beginPath();
        let xW = 0; //horizontal accumulator
        for (let n = 0; n < binLength; n++) {
          let yW = (dCanvH/2) - tdWaveW[n]*(dCanvH/2);
          if (n == 0) {
            displayCanvCtx.moveTo(xW, yW);
          } else {
            displayCanvCtx.lineTo(xW, yW);
          }
          xW += binWidth;
        }
        displayCanvCtx.stroke();
      } else if (activeUI == "liss") { //draw lissajous curve
        scopeX.getFloatTimeDomainData(tdWaveX); //grab TD waveforms for X/Y
        scopeY.getFloatTimeDomainData(tdWaveY);
        displayCanvCtx.lineWidth = 4;
        displayCanvCtx.beginPath();
        for (let n = 0; n < binLength; n++) {
          let x = (dCanvW/2) + tdWaveX[n]*(dCanvW/2);
          let y = (dCanvH/2) - tdWaveY[n]*(dCanvH/2);
          if (n == 0) {
            displayCanvCtx.moveTo(x, y);
          } else {
            displayCanvCtx.lineTo(x, y);
          }
        }
        displayCanvCtx.stroke();
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
      if (activeUI == "wave") {
        activeUI = "liss";
      } else if (activeUI == "liss" || activeUI == "info") {
        activeUI = "wave";
      }
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
    let wavFile = await fetch("./wavData/ir4.wav");
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
      voice1.trigEnv.setValueAtTime(1, synthCtx.currentTime);
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
    let expOffset = keyDict[event.which];
    if (expOffset !== undefined) {
      voice1.trigEnv.setValueAtTime(0, synthCtx.currentTime);
    } else if (event.which == 16) {
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

  $(".patchSelect").click(function() {
    let $this = $(this);
    if (voice1.patchStates[activePage][$this.attr("id")] == 1) {
      if (activePage == "ratButton") {
        voice1.lfoGainDict[activePage].disconnect(voice1.oscNodeDictP[$this.attr("id")]);
      } else if (activePage == "oscButton" || activePage == "ofxButton") {
        voice1.lfoGainDict[activePage].disconnect(voice1.modDestDict[activePage][$this.attr("id")]);
      } else if (activePage == "panButton") {
        voice1.lfoGainDict[activePage].disconnect(voice1.oscPanModDict[$this.attr("id")]);
        voice1.lfoGainDict[activePage].disconnect(voice1.distPanModDict[$this.attr("id")]);
      }
      voice1.patchStates[activePage][$this.attr("id")] = 0;
      $this.css("opacity", "33%");
      $this.removeClass("selected");
    } else if (voice1.patchStates[activePage][$this.attr("id")] == 0) {
      if (activePage == "ratButton") {
        voice1.lfoGainDict[activePage].connect(voice1.oscNodeDictP[$this.attr("id")]);
      } else if (activePage == "oscButton" || activePage == "ofxButton") {
        voice1.lfoGainDict[activePage].connect(voice1.modDestDict[activePage][$this.attr("id")]);
      } else if (activePage == "panButton") {
        voice1.lfoGainDict[activePage].connect(voice1.oscPanModDict[$this.attr("id")]);
        voice1.lfoGainDict[activePage].connect(voice1.distPanModDict[$this.attr("id")]);
      }
      voice1.patchStates[activePage][$this.attr("id")] = 1;
      $this.css("opacity", "100%");
      $this.addClass("selected");
    }
  });
});
