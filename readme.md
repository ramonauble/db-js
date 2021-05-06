![alt text](https://storage.googleapis.com/www.rsyn.co/db/assets/comb.png)
## OVERVIEW
----------------------------------------------------------------
db is a 6 oscillator additive fm synthesizer based on WebAudioAPI,
inspired in part by the ethos of the drawbar organ.

it is designed to be both immediate & easy to understand,
with a simple, symmetrical structure & instantly tweakable parameters.

to play chromatically, the keys are currently mapped as follows:\
    W   E       T   Y   U------------C#  D#      F#  G#  A#\
  A   S   D   F   G   H   J   K----C   D   E   F   G   A   B   C2\

 to shift 1 octave down, press and hold SHIFT & press UP ARROW\
 to shift 1 octave up, press and hold SHIFT & press DOWN ARROW
  * current range of -/+ 2 octaves from default position

## STRUCTURE
----------------------------------------------------------------
the main synthesis engine is made up of 6 sections,
each denoted by a different color & symbol.\
they are as follows, in order from left to right:

 * **oscillator** (dark purple) - controls the relative amplitudes of each of the 6 sinusoidal partials
 * **ratio**      (light purple) - sets the tuning ratio of each partial, in reference to the fundamental frequency
 * **shape**      (muted red) - applies a variable amount of waveshaping distortion to each partial
 * **pan**        (soft teal) - controls the L/R placement of each partial in the stereo field
 * **envelope**   (light blue) - controls the shape & curve of the ADSR envelope
 * **crush**      (muted pink) - applies a keytracked sample rate & bit reduction effect to each partial

### SYNTHESIS
----------------------------------------------------------------

#### OSCILLATOR
----------------------------------------------------
 the **oscillator** page controls the relative mix levels for each of the 6 partials.\
 each "partial" is made up of a single sine wave.\
 the gain of each sinusoid is controlled by its associated drawbar (parameter slider).\
 default position is off (0% mix) for all partials.

#### RATIO
----------------------------------------------------
 the **ratio** page sets the tuning ratios for each of the 6 partials.\
 the resultant pitch of each partial is determined in reference to the active fundamental frequency.\
 for example, a tuning ratio of 2.00, with a fundamental of 440Hz, gives an 880Hz pitch for that partial.\
 there are 64 possible ratios, ranging from .125x to 4.00x. 1.00x (fundamental) is ratio 16.\
 below 16 gives subharmonic (undertone) frequencies; above 16 gives harmonic (overtone) frequencies.

#### SHAPE
----------------------------------------------------
 the **shape** page is host to 6 independent waveshapers, one for each of the 6 partials.\
 the amount of shaping for each partial is determined by the position of the corresponding drawbar.\
 the sliders control both the pregain send & postgain mix amounts; as the output level is increased, the output spectrum will also become brighter.

#### PAN
----------------------------------------------------
 the **pan** page allows each partial to be panned to a specific region of the stereo field, between fully left & fully right.\
 the exact placement of each partial is controlled by the corresponding drawbar.\
 top position is fully right, bottom position is fully left, center position is equal panning (default).

#### ENVELOPE
----------------------------------------------------
 the **envelope** page contains one ADSR envelope, to allow control over the dynamics of the sound.\
 the envelope is retriggered whenever a NOTE ON event is received. it will always retrigger from its previous position (level). the release stage is executed on the final NOTE OFF event (last held key released).\
 the first four sliders provide control over **attack**, **decay**, **sustain** and **release**, in order from left to right.\
 the fifth slider determines the shape of the attack & decay/release curves, from **exponential** (fully down) to **linear** (fully up); intermediate values result in a smooth interpolation between the two shapes.\
 the final slider controls the peak value, effectively setting the maximum loudness level of the envelope. the maximum sustain level is bounded by this value.

#### CRUSH
----------------------------------------------------
 the **crush** page is comprised of 6 separate sample rate/bit reduction effect units.\
 the sample rate reduction is keytracked & related to the frequency of each of the partials.\
 the position of each drawbar sets the amount of reduction for the corresponding partial.\
 this page can be used to add anything between a subtle sparkle to a fully reduced distortion, to each of the partials individually.

### LFOs
----------------------------------------------------------------
 each page features its own independent LFO, offering separate control over LFO **speed**, **shape** & **depth**, using the 3 horizontal sliders beneath the synthesis window.\
 the current LFO parameter states are displayed beneath each of the sliders, and are updated accordingly when the parameter page is changed.\
 each page offers its own separate routing matrix, allowing the LFO to be routed to **any combination** of the 6 parameters for the active page.\
 each button essentially acts as a toggle switch, enabling or disabling the connection of the LFO to the corresponding page parameter when pressed.\
 the **speed** for each LFO is set according to the base frequency (displayed above the LFO sliders, left of center).\
 the speed slider moves through the same ratio table as the RATIO page, multiplying the base LFO frequency by a scaling factor to arrive at the actual LFO frequency (displayed above the LFO sliders, right of center).\
 the LFO has three possible base frequency modes, selected using the mode select switches beneath the sliders. they are as follows.

#### MODE 1: FIXED
 this is the default mode, represented by the **X** (leftmost mode button).\
 this mode sets the base frequency to a fixed value of 8Hz, providing a static base upon which to construct free-running, time-related parameter modulations across pages.

#### MODE 2: BPM
 this mode is selected using the middle mode button, expressed as a **very tiny metronome**.\
 this mode sets the base frequency according to the active BPM, to allow time-synchronized modulations when using the sequencer.\
 changing the bpm using the bpm slider will change the base frequencies of all LFOs in this mode.\
 the base frequency is determined as: **bpm/60** Hz; or, in other words, **quarter notes per second**.

#### MODE 3: TUNED (FM)
 this mode is selected using the rightmost mode button, visualized as a **small tuning fork**.\
 tuned mode is distinct from the other two modes, in that it is designed to facilitate modulation at **audio rates**.\
 every time a note event is received, the base frequency of each LFO in this mode is updated to the fundamental frequency.\
 this allows for audio rate modulation of **any parameter**, at frequencies equal to some ratio of the active fundamental.\
 the fundamental reference behavior ensures that the harmonic content generated by the modulation is more distinctly related to the overall character of the note.

### SEQUENCER
----------------------------------------------------------------
 db features a robust note & trig sequencer, resting just beneath the synthesis window.\
 the sequencer is based around 3 separate sequences - **two note sequences**, and **one trig sequence**.\
 to start/stop the sequencer, press the **spacebar**.

#### NOTE SEQUENCES
 the two note sequences are each represented by 8 little boxes, positioned above the trig sequence on either side; each box represents a single note in the sequence.\
 each note sequence is independent of the other, and can be between 1-8 steps in length.\
 to program the note sequence, press and hold either **left arrow** or **right arrow**; any notes subsequently entered will be appended to the corresponding sequence, up to the maximum amount of 8.\
 both note sequences are advanced by 1 step each trig, and are reset after reaching the last note in the sequence.

#### TRIG SEQUENCE
 the trig sequence is positioned directly beneath the two note sequences, represented by 16 contiguous boxes, and can be between 1-16 steps in length. each step corresponds to one **16th note** at the current tempo.\
 to enter trigs into the sequence, just click on the desired box to turn it on/off.\
 the trig sequence continues until reaching the **length** parameter, after which it will restart.

#### SEQUENCER PARAMS
 the sequencer features 3 sliders to control different aspects of its behavior; they are as follows:
  * **gate** - configures the amount of time that the NOTE ON event is held for each trig - in other words, the amount of time before the release stage is executed. ranges from instantaneous at 0%, to the length of the entire 16th note at 100% (tempo-dependent)
  * **mix** - controls the probability of the next note being taken from either sequence a (left) or sequence b (right). 0% is full probability to sequence a, 100% is full probability to sequence b. 50% gives a 50/50 chance that the next note will be taken from either sequence. this allows for continuous, probabilistic morphing between the two note sequences.
  * **length** - sets the maximum length of the trig sequence before repeating. ranges from 1-16 steps, and can be changed while the sequence is playing.

### DISPLAY MODES
----------------------------------------------------------------
 there are three different display modes for the central canvas, selectable using the display mode buttons at the top center of the console. they are as follows.

#### INFO PAGE
 select this page using the **left display button** (containing the "i" symbol).\
 this page displays information about the 6 parameter states for the selected synthesis page.\
 pages 1, 2 & 3 display numerical values for each of the 6 parameters.\
 pages 4, 5 & 6 display graphical representations of their parameters.\
 this page is useful for fine tuning of the parameters via the sliders.
#### SCOPE DISPLAY
 select this page by pressing the **right display button** once (containing a graphic of one cycle of a sine wave).\
 this page displays an oscilloscope-like representation of the current output.\
 the samples are taken after the final mix, so all parameters will affect the shape in some way.\
 in this mode, the **horizontal axis** is time, and the **vertical axis** is amplitude.
#### STEREO DISPLAY
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
    * oscillator, ratio & shape pages (numerical)
    * pan & crush pages (visual)
  * LFOs/routing matrix
    * pages 1, 2, 3, 4, & 6
  * asymmetric note & trig sequencer
#### currently implementing:
  * LFOs/routing matrix
    * page 5 (envelope)
  * parameter value display
    * envelope page (curve visualization)
#### to implement:
  * selective note sequence retrig (trig sequence sync)
  * parameter group control
#### wishful (not priority):
  * midi controller support (WebMIDI API)

<3
