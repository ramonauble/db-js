![alt text](https://storage.googleapis.com/www.rsyn.co/db/assets/comb.png)
### OVERVIEW
----------------------------------------------------------------
db is a 6 oscillator additive synthesizer based on WebAudioAPI,
inspired in part by the ethos of the drawbar organ.

it is designed to be both immediate & easy to understand,
with a simple, symmetrical structure & instantly tweakable parameters.

to play chromatically, the keys are mapped as follows:
 * A W  S E  D F T  G Y  H U  J K
 * C C# D D# E F F# G G# A A# B C

 * to shift 1 octave down, press and hold SHIFT & press L ARROW
 * to shift 1 octave up, press and hold SHIFT & press R ARROW
    * present range of -/+ 2 octaves from default position


### STRUCTURE
----------------------------------------------------------------
the synthesis engine is comprised of 6 main sections,
each denoted by a different color & symbol.
they are as follows, in order from left to right:

 * **oscillator** (OSC, dark purple) - controls the relative amplitudes of each of the 6 partials
 * **ratio**      (RAT, light purple) - controls the tuning ratio of each partial, in reference to the fundamental
 * **shape**      (OFX, muted red) - applies a variable amount of waveshaping distortion to each partial
 * **pan**        (PAN, soft teal) - controls the L/R placement of each partial in the stereo field
 * **envelope**   (AMP, light blue) - controls the shape & curve of the ADSR envelope, applied in stereo
 * **reverb**     (REV, muted pink) - controls the relative send amounts for the stereo convolution reverb

#### OSC
----------------------------------------------------
 each "partial" is comprised of a single sine wave.
 the gain of each sinusoid is controlled by the corresponding drawbar on the OSC page.
 each partial is thus assigned its own independent pre-mix level bounded between 0 & unity gain.
 the default positions fall in line with a simple harmonic series,
 with each partial N [N == 1 to 6] being 1/N the maximum amplitude (unity).
 coupled with the default ratio settings (below), this creates a starting sound
 similar in character to a sawtooth wave.

#### RAT
----------------------------------------------------
 each partial also has an independent frequency, determined in reference to the fundamental of each note.
 frequencies are set by the corresponding ratio parameter on the RAT page.
 the sliders default to a simple harmonic series, similar to a sawtooth -
 1st is quarter freq (.25x), 2nd is .5x, 3rd is 1x, 4th is 2x, 5th is 3x, 6th is 4x.
 * the top 48 ratios (top 75%) range from 1.125x to 4.00x (overtones).
 * the bottom 16 ratios (bottom 25%) range from 1.00x to .125x (fundamental & undertones).

#### OFX
----------------------------------------------------
 each partial also has its own independent waveshaping distortion applied to it.
 the distortion mix level for each partial is set by the corresponding drawbar on the OFX page, starting with no distortion (bottom position, default state) to full distortion (top position).
 the distortion itself takes the form of a nonlinear waveshaper, using a sigmoid curve to generate rich harmonics from a simple sine wave
  * note: the distortion is applied as a mix, which is to say that both the oscillator & distortion are mixed together in the amounts determined by their drawbars, prior to being panned, attenuated & sent to the reverb.

#### PAN
----------------------------------------------------
 the PAN page allows each partial to be panned to a specific region of the stereo field, prior to being mixed down, attenuated & sent to the stereo reverb.
 the exact L/R placement of each partial is controlled by the corresponding drawbar.
 the graphic display represents the current panning location as a moving white dot atop a horizontal black line.
 default position is center (equal panning) for all partials.
 top position is fully right, bottom position is fully left.

#### AMP
----------------------------------------------------
 the AMP page contains one stereo ADSR envelope, with controls for attack, decay, sustain and release.
 an additional control allows for a time offset to be introduced between the stereo envelopes, delaying the trigger of either the left or right envelope by a configurable amount.
 another control introduces an amount of attenuated randomness into the delay parameter, allowing the trigger times to continually vary by a small, chaotic amount.

#### REV
----------------------------------------------------
 the REV page is host to a stereo convolution reverb, based on an impulse response taken from the Innocent Railway Tunnel (†).
 the 6 sliders control the relative reverb send amounts for each of the 6 stereo panned waveshaper/oscillator pairings.
 the effect can thus be applied in varying amounts to each partial individually, offering granular control over the overall timbre of the reverberated signal.
 reverb send is represented visually by a single white circle (one per partial), which grows in size as the send for each partial is increased.

### LFOS
----------------------------------------------------------------
 each parameter page features its own independent LFO, offering
 separate control over LFO speed, shape & depth, using the 3 horizontal sliders positioned beneath the synthesis window.
 the LFO parameter states are displayed beneath each of the sliders. each page also offers its own separate routing matrix, allowing the LFO to be routed to any combination of the 6 parameters for the active page. each button acts as a toggle switch, instantly enabling or disabling the connection of the LFO to the corresponding page parameter. the 6 switches are 1:1 with the 6 parameters, from right to left.

### DISPLAY MODES
----------------------------------------------------------------
 there are three different display modes for the central canvas. selectable using the display mode buttons at the top center of the console. they are as follows.

#### information page
 select this page using the **left display button** (containing the "i" symbol). this page displays information about the 6 parameter states for the selected synthesis page. pages 1, 2 & 3 display numerical values for each of the 6 parameters; pages 4, 5 & 6 display graphical representations of their parameters. this page is useful for fine tuning of the parameters via the sliders.
#### oscilloscope display
 select this page by pressing the **right display button** once (containing a graphic of one cycle of a triangle wave). this page displays an oscilloscope-like representation of the current output. the samples are taken after the final mix, so all parameters will affect the shape in some way. in this mode, the **horizontal axis** is time, and the **vertical axis** is amplitude.
#### x/y stereo display
 select this page by pressing the **right display button** twice. on second press, the oscilloscope will turn into the x/y display. this mode preserves the stereo information of the signal - panning the oscillators will exert the most noticeable affect on its shape. in this mode, the **horizontal axis** is the left channel, and the **vertical axis** is the right.
 * note: to toggle between the x/y & oscilloscope display, just press the right display button again. doing so continually will alternate between them in succession.

### NOTES
----------------------------------------------------------------
this project is still very much in development; the aforementioned structure is mostly
finalized, but may be subject to change as the project moves toward completion.

the current alpha build runs just a single voice,
which begins sounding at receipt of user interaction (page select).

#### currently implemented:
  * oscillators & mix controls (page 1)
  * ratio table & ratio select (page 2)
  * waveshapers & mix controls (page 3)
  * per partial pan & controls (page 4)
  * stereo convolution reverb  (page 6)
    * using impulse response from Innocent Railway Tunnel
    * (†) (www.openairlib.net)
  * keyboard note change
  * oscilloscope display
  * x/y stereo display
  * parameter value displays
    * OSC, RAT & OFX pages (numerical)
    * PAN & REV pages (visual)
  * LFOs/routing matrix
    * pages 1 & 3
#### currently implementing:
  * LFOs/routing matrix
    * pages 2, 4, 5 & 6
#### to implement:
  * stereo envelopes & control (page 5)
  * parameter value display
    * AMP page (envelope visualization)
  * virtual (onscreen) keyboard
    * for triggering the envelopes & changing the fundamental
    * for programming notes into the sequencer
  * asymmetric note & trig sequencer
#### wishful (not priority):
  * 3 part polyphony
  * midi controller support (WebMIDI API)

<3
