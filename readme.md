### OVERVIEW
----------------------------------------------------------------
db is a 6 oscillator additive synthesizer based on WebAudioAPI,
inspired in part by the ethos of the drawbar organ.

it is designed to be both immediate & easy to understand,
with a simple, symmetrical structure & instantly tweakable parameters.

to play chromatically, the keys are mapped as follows:
 *  W E   T Y U
 * A S D F G H J K

 *  C# D#   F# G# A#
 * C  D  E F  G  A  B C

 * to shift 1 octave down, press and hold SHIFT & press L ARROW
 * to shift 1 octave up, press and hold SHIFT & press R ARROW
  * present range of -/+ 2 octaves from default position


### STRUCTURE
----------------------------------------------------------------
the synthesis engine is comprised of 6 main sections
each denoted by a different color & symbol
they are as follows, in order from left to right:

 * oscillator (OSC, dark purple) - controls the relative amplitudes of each of the 6 partials
 * ratio      (RAT, light purple) - controls the tuning ratio of each partial, in reference to the fundamental
 * shape      (OFX, muted red) - applies a variable amount of waveshaping distortion to each partial
 * pan        (PAN, soft teal) - controls the L/R placement of each partial in the stereo field
 * envelope   (AMP, light blue) - controls the shape & curve of the ADSR envelope, applied in stereo
 * reverb     (REV, muted pink) - controls the relative send amounts for the stereo reverb

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
  * 1st is quarter freq (.25x), 2nd is .5x, 3rd is 1x, 4th is 2x, 5th is 3x, 6th is 4x.
 the top 48 ratios (top 75%) range from 1.125x to 4.00x (overtones).
 the bottom 16 ratios (bottom 25%) range from 1.00x to .125x (fundamental & undertones).

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
 the REV page is host to a stereo convolution reverb, based on an impulse response taken from the Nashville First Baptist Church (†).
 the 6 sliders control the relative reverb send amounts for each of the 6 stereo panned waveshaper/oscillator pairings.
 the effect can thus be applied in varying amounts to each partial individually, offering granular control over the overall timbre of the reverberated signal.
 reverb send is represented visually by a single white circle (one per partial), which grows in size as the send for each partial is increased.


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
  * using impulse response from Nashville First Baptist Church
  * (†) (www.openairlib.net)
  * keyboard note change
  * oscilloscope display
  * parameter value displays
   * OSC, RAT & OFX pages (numerical)
   * PAN & REV pages (visual)
#### currently implementing:
 * parameter value display
  * AMP page (envelope visualization)
#### to implement:
 * stereo envelopes & control (page 5)
 * 1 freely assignable LFO per page
  * independent frequency, shape & depth controls per page
  * freely routable to any combination of the 6 parameters
  * toggle switch to change between free running & tempo locked
  * virtual (onscreen) keyboard
   * for triggering the envelopes & changing the fundamental
   * for programming notes into the sequencer
  * asymmetric note & trig sequencer
#### wishful (not priority):
 * 3 part polyphony
 * midi controller support (WebMIDI API)

<3
