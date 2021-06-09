<p align="center">
  <img width="497" height="654" src="https://storage.googleapis.com/www.rsyn.co/db/assets/comb.png">
</p>

## OVERVIEW
----------------------------------------------------------------
db is an additive/fm synthesizer based on WebAudioAPI, designed to run in your web browser (chrome/chromium work best).

it is made to be both immediate & easy to understand,
with a simple, symmetrical structure & instantly tweakable parameters.

centered around a unique 6 part synthesis engine, db features 6 flexible LFOs, keytracked FM & bpm sync modes, a dual asymmetric pattern sequencer, probabilistic note morphing, dynamic scale & root selection, oscilloscope & x/y lissajous display, and a master stereo reverb effect.


## SYNTHESIS
----------------------------------------------------------------
<p align="center">
  <img width="446" height="63" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/synthesis.png">
</p>

the main synthesis engine is made up of 6 sections,
each denoted by a different color & symbol.\
they are as follows, in order from left to right:

 * **mix** (dark purple) - controls the relative mix levels of each of the 6 partials
 * **tune**      (light purple) - sets the scale degree offset from the fundamental for each partial
 * **shape**      (muted red) - applies a variable amount of waveshaping distortion to each partial
 * **pan**        (soft teal) - controls the L/R placement of each partial in the stereo field
 * **envelope**   (light blue) - controls the shape & curve of the master ADSR envelope
 * **crush**      (muted pink) - applies a keytracked sample rate/bit reduction effect to each partial

### mix
----------------------------------------------------------------
<p align="center">
  <img width="482" height="257" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/mix.png">
</p>

 the **mix** page controls the relative mix levels for each of the 6 partials.\
 each "partial" is made up of a single sine wave.\
 the gain of each sinusoid is controlled by its associated drawbar (parameter slider).\
 default position is off (0% mix) for all partials.

### tune
----------------------------------------------------
<p align="center">
  <img width="482" height="257" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/tune.png">
</p>

 the **tune** page sets the tuning offsets for each of the 6 oscillators.\
 the offsets are expressed in units of **scale degrees**, both positive and negative.\
 given the selected scale & root settings (detailed below), the offset will "select" the corresponding note from said scale, starting from the **root note** at center position.\
 for example, an offset of +2 selects the second note up from the root - in C Major, this would be C-D-(**E**).\
 this behavior is retained for each note of the selected scale; if a C is played in C major, 2 scale degrees up gives a tuning of the E above. however, if a D is then played, the same offset of +2 degrees will give F, not E (as F is 2 degrees above D). this ensures all partials remain tuned in a consistent way for each possible note that can be played.

### shape
----------------------------------------------------
<p align="center">
  <img width="482" height="257" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/shape.png">
</p>

 the **shape** page is host to 6 independent waveshaper distortions, one for each of the 6 partials.\
 the amount of shaping for each partial is determined by the position of the corresponding drawbar.\
 the sliders control both the pregain send & postgain mix amounts; as the output level is increased, the output spectrum will also become brighter.

### pan
----------------------------------------------------
<p align="center">
  <img width="482" height="257" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/pan.png">
</p>

 the **pan** page allows each partial to be panned to a specific region of the stereo field, between fully left & fully right.\
 the exact placement of each partial is controlled by the corresponding drawbar.\
 top position is fully right, bottom position is fully left, center position is equal panning (default).

### envelope
----------------------------------------------------
<p align="center">
  <img width="482" height="257" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/envelope.png">
</p>

 the **envelope** page contains one ADSR envelope, to allow control over the dynamics of the sound.\
 the envelope is retriggered whenever a NOTE ON event is received. it will always retrigger from its previous position (level). the release stage is executed on the final NOTE OFF event (last held key released).\
 the first four sliders provide control over **attack**, **decay**, **sustain** and **release**, in order from left to right.\
 the fifth slider determines the shape of the attack & decay/release curves, from **exponential** (fully down) to **linear** (fully up); intermediate values result in a continuous interpolation between the two shapes.\
 the final slider controls the peak value, effectively setting the maximum loudness level of the envelope. the maximum sustain level is then bounded by this value.

### crush
----------------------------------------------------
<p align="center">
  <img width="482" height="257" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/crush.png">
</p>

 the **crush** page is comprised of 6 separate sample rate/bit reduction effects (one per partial).\
 the sample rate reduction is keytracked & related to the frequency of the associated partial.\
 the position of each drawbar sets the amount of reduction for the corresponding partial.\
 this page can be used to add anything between a subtle sparkle to a fully reduced distortion, to each of the partials individually.


## SEQUENCER
----------------------------------------------------------------
<p align="center">
  <img width="442" height="121" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/sequencer.png">
</p>

 db features a robust note & trig sequencer, positioned directly beneath the synthesis window.\
 the sequencer is based around 3 separate sequences - **two note sequences**, and **one trig sequence**.\
 to start/stop the sequencer, press the **spacebar**.

### note sequences
<p align="center">
  <img width="442" height="35" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/noteseq.png">
</p>

 the two note sequences are each represented by 8 little boxes, positioned above the trig sequence on either side; each box represents a single note in the sequence.\
 each note sequence is independent of the other, and can be between 1-8 steps in length.\
 to program the note sequence, press and hold either **left arrow** or **right arrow**; any notes subsequently entered will be appended to the corresponding sequence, up to the maximum amount of 8.\
 both note sequences are advanced by 1 step each trig, and are reset after reaching the last note in the sequence.

### trig sequence
<p align="center">
  <img width="442" height="37" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/trigseq.png">
</p>

 the trig sequence is positioned directly beneath the two note sequences, represented by 16 contiguous boxes, and can be between 1-16 steps in length. each step corresponds to one **16th note** at the current tempo.\
 to enter trigs into the sequence, just click on the desired box to turn it on/off.\
 the trig sequence continues until reaching the **length** parameter, after which it will restart.

### sequencer parameters
<p align="center">
  <img width="442" height="59" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/paramseq.png">
</p>

 the sequencer features 3 sliders to control different aspects of its behavior; they are as follows:
  * **gate** - configures the amount of time that the NOTE ON event is held for each trig - in other words, the amount of time before the release stage is executed. ranges from instantaneous at 0%, to the length of the entire 16th note at 100% (tempo-dependent)
  * **morph** - controls the probability of the next note being taken from either sequence a (left) or sequence b (right). 0% is full probability to sequence a, 100% is full probability to sequence b. 50% gives a 50/50 chance that the next note will be taken from either sequence. this allows for continuous, probabilistic morphing between the two note sequences.
  * **length** - sets the maximum length of the trig sequence before repeating. ranges from 1-16 steps, and can be changed while the sequence is playing.


## LFOs
----------------------------------------------------------------
<p align="center">
  <img width="466" height="143" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/lfo.png">
</p>

 each page features its own independent LFO, allowing each of its synthesis parameters to be selectively modulated.\
 the lfo can be free running, bpm synced or tuned via the fundamental frequency of the active note.\
 the base frequency of the LFO is displayed beneath the routing matrix; the actual frequency is shown to the right of this, and changes depending on the selected mode & frequency multiplier.

### routing matrix
<p align="center">
  <img width="198" height="40" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/matrix.png">
</p>

 the LFO routing matrix is expressed as 6 horizontal toggle switches (boxes), corresponding left-for-right to the 6 parameter sliders of the active page.\
 the parameters of each page can be selectively modulated by clicking the corresponding box, to turn on/off the matrix connection for that parameter.

### parameters
<p align="center">
  <img width="448" height="58" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/lfoparams.png">
</p>

 the **speed** slider selects the frequency multiplier for the given base frequency, to determine the actual frequency of the active LFO. it moves through a table of multipliers, from **.125x** to **4.00x**. default is **1.00x**\
 the **shape** slider selects the shape of the active LFO; options are **sine**, **triangle**, **square** & **saw**.\
 the **depth** slider controls the depth of the modulation for the active LFO, affecting each of the matrix connections equally.

### modes
 each of the page LFOs can configured to operate in one of three different frequency **modes**.\
 the selected mode affects how the base frequency of the active LFO is determined.\
 the modes are as follows:

#### mode 1: fixed
<p align="center">
  <img width="101" height="38" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/mode1.png">
</p>

 this is the default mode, represented by the **X** (leftmost mode button).\
 this mode sets the base frequency to a fixed value of 8Hz, providing a static base upon which to construct free-running, time-related parameter modulations across pages.

#### mode 2: bpm synced
<p align="center">
  <img width="101" height="38" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/mode2.png">
</p>

 this mode is selected using the middle mode button, expressed as a **very tiny metronome**.\
 this mode sets the base frequency according to the active BPM, to allow time-synchronized modulations when using the sequencer.\
 changing the bpm using the bpm slider will change the base frequencies of all LFOs in this mode.\
 the base frequency is determined as: **bpm/60** Hz; or, in other words, **quarter notes per second**.

#### mode 3: keytracked (fm)
<p align="center">
  <img width="101" height="38" src="https://storage.googleapis.com/www.rsyn.co/db/assets/readme/mode3.png">
</p>

 this mode is selected using the rightmost mode button, visualized as a **small tuning fork**.\
 tuned mode is distinct from the other two modes, in that it is designed to facilitate modulation at **audio rates**.\
 every time a note event is received, the base frequency of each LFO in this mode is updated to the fundamental frequency.\
 this allows for audio rate modulation of **any parameter**, at frequencies equal to some ratio of the active fundamental.\
 the fundamental reference behavior ensures that the harmonic content generated by the modulation is more distinctly related to the overall character of the note.


## SCALE & ROOT SELECTION
----------------------------------------------------------------
 beneath the LFO section there are two sliders - **scale** and **root**. these allow the sound of the synth to be tuned to a particular set of notes, as defined by the selected scale type & root note.

### scale
 the scale slider moves through a selected list of musical scales. a scale is defined by its unique arrangement of **whole** and **half** step intervals (one half step == one **semitone**).\
 the effect of this slider is two fold: first, the keys are changed to only play notes from the chosen scale, making it easier and more intuitive to build consonant melodies from scratch.\
 second, the frequencies of each oscillator are instantly retuned to fall within the selected scale; as the oscillators are tuned by means of a **scale degree offset**.\
 each offset points to a different position within each scale. so, an offset of +2 may be a major third in the major scale, but that same offset becomes a minor third in any of the minor scales. in the chromatic scale (full 12 notes), +2 would just be the third note up from the root (counting all keys).

### root
 as the name implies, this slider sets the **root note** (or "starting note") of the selected scale (and thus, the keyboard).\
 the root note of C major is **C**; F minor is **F**, and so forth.\
 changing this while the sequencer is playing a melody will transpose the entire melody (and all oscillator tunings) into a different key.

## DISPLAY MODES
----------------------------------------------------------------
 there are three different display modes for the central canvas, selectable using the display mode buttons at the top center of the console. they are as follows.

### info page
 select this page using the **left display button** (containing the "i" symbol).\
 this page displays information about the 6 parameter states for the selected synthesis page.\
 pages 1, 2 & 3 display numerical values for each of the 6 parameters.\
 pages 4, 5 & 6 display graphical representations of their parameters.\
 this page is useful for fine tuning of the parameters via the sliders.
### oscilloscope display
 select this page by pressing the **right display button** once (containing a graphic of one cycle of a sine wave).\
 this page displays an oscilloscope-like representation of the current output.\
 the samples are taken after the final mix, so all parameters will affect the shape in some way.\
 in this mode, the **horizontal axis** is time, and the **vertical axis** is amplitude.
### stereo display
 select this page by pressing the **right display button** twice. on second press, the oscilloscope will turn into the x/y display.\
 this mode preserves the stereo information of the signal - panning the oscillators (or utilizing the PAN LFO) will exert the most noticeable affect on its shape.\
 in this mode, the **horizontal axis** is the left channel, and the **vertical axis** is the right.
 * note: to toggle between the x/y & oscilloscope display, just press the right display button again. doing so continually will alternate between them in succession.

## NOTES
----------------------------------------------------------------
this project is nearly finished, and the structure will not be changing much going forward. that said, there may be minor additions and tweaks - the following details the current status, as well as any prospective additions/changes to be implemented.

#### currently implemented:
  * oscillators & mix controls (page 1)
  * ratio table & ratio select (page 2)
  * waveshapers & mix controls (page 3)
  * per partial pan & controls (page 4)
  * VCA envelope & controls (page 5)
  * sample rate & bit reduction (page 6)
  * stereo convolution reverb
    * using impulse response from Innocent Railway Tunnel
    * (†) (www.openairlib.net)
  * keyboard note change
  * oscilloscope display
  * x/y stereo display
  * parameter value displays
    * oscillator, rune & shape pages (numerical)
    * pan, envelope & crush pages (visual)
  * LFOs/routing matrix
    * all pages
  * asymmetric note & trig sequencer
  * scale & root selection
#### to implement:
  * selective note sequence retrig (trig sequence sync)
  * parameter group control
#### wishful (not priority):
  * midi controller support (WebMIDI API)

<3
