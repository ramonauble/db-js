'use strict';

$(document).ready(function() {
  var activePage = "oscButton";
  var activeUI = "waveButton";

  var $pageDict = {
    oscButton: $("#oscButton"),
    ratButton: $("#ratButton"),
    ofxButton: $("#ofxButton"),
    panButton: $("#panButton"),
    ampButton: $("#ampButton"),
    revButton: $("#revButton")
  };
  var $uiDict = {
    infoButton: $("#infoButton"),
    waveButton: $("#waveButton")
  };

  var $pageSelectDict = {
    oscButton: $("#oscSelect"),
    ratButton: $("#ratSelect"),
    ofxButton: $("#ofxSelect"),
    panButton: $("#panSelect"),
    ampButton: $("#ampSelect"),
    revButton: $("#revSelect")
  };
  var $uiSelectDict = {
    infoButton: $("#infoSelect"),
    waveButton: $("#waveSelect")
  };

  var sliderClassDict = {
    oscButton: "oscSlider",
    ratButton: "ratSlider",
    ofxButton: "ofxSlider",
    panButton: "panSlider",
    ampButton: "ampSlider",
    revButton: "revSlider"
  };

  var colorDict = {
    oscButton: "#5D2E7B",
    ratButton: "#A15ECE",
    ofxButton: "#C75858",
    panButton: "#8AC497",
    ampButton: "#848EDF",
    revButton: "#DB689C"
  };

  var $pageSliders = $(".pSlider");
  var $auxSliders = $(".aSlider");
  var $lfoTitle = $("#lfoTitle");
  var $lfoPatch = $(".patchSelect");

  var $activePage = $pageDict[activePage];
  var $activePageSelect = $pageSelectDict[activePage];

  var $activeUI = $uiDict[activeUI];
  var $activeUISelect = $uiSelectDict[activeUI];

  $activePage.css("opacity", "100%");
  $activePageSelect.css("opacity", "100%");
  $activeUI.css("opacity", "100%");
  $activeUISelect.css("opacity", "100%");

  $(".patchSelect").hover(function() {
    if (!$(this).hasClass("selected")) {
      $(this).css("opacity", "81%");
    }
  }, function() {
    if (!$(this).hasClass("selected")) {
      $(this).css("opacity", "33%");
    }
  });

  $(".modeSelect").hover(function() {
    if (!$(this).hasClass("selected")) {
      $(this).css("opacity", "100%");
    }
  }, function() {
    if (!$(this).hasClass("selected")) {
      $(this).css("opacity", "50%");
    }
  });

  $(".uiButton, .pageButton").hover(function() {
    $(this).css("opacity", "100%");
  }, function() {
    let $this = $(this);
    if ($this.hasClass("pageButton")) {
      if ($this.attr("id") != activePage) {
        $this.css("opacity", "81%");
      }
    } else {
      if ($this.attr("id") != activeUI) {
        $this.css("opacity", "81%");
      }
    }
  }).click(function() {
    let $this = $(this);
    if ($this.hasClass("pageButton")) {
      if ($this.attr("id") != activePage) {
        $activePage.css("opacity", "81%");
        $this.css("opacity", "100%");
        $pageSelectDict[activePage].css("opacity", "20%");
        $pageSliders.removeClass(sliderClassDict[activePage]);
        $auxSliders.removeClass(sliderClassDict[activePage]);
        activePage = $this.attr("id");
        $pageSliders.addClass(sliderClassDict[activePage]);
        $auxSliders.addClass(sliderClassDict[activePage]);
        $lfoTitle.css("color", colorDict[activePage]);
        $lfoPatch.css("background", colorDict[activePage]);
        $activePage = $pageDict[activePage];
        $pageSelectDict[activePage].css("opacity", "100%");
        let newBgColor = $pageSelectDict[activePage].css("background");
        $("#displayCanv").css("background", newBgColor);
      }
    } else {
      if ($this.attr("id") != activeUI) {
        $activeUI.css("opacity", "81%");
        $this.css("opacity", "100%");
        $uiSelectDict[activeUI].css("opacity", "20%");
        activeUI = $this.attr("id");
        $activeUI = $uiDict[activeUI];
        $uiSelectDict[activeUI].css("opacity", "100%");
      }
    }
  });
});


//purple, red, black, green, blue, grey
//AE77D2 - purple
//E93F3F - red
//000000 - black
//7CDE89 - green
//7CA7DE - blue
//999999 - grey
