OVERVIEW
----------------------------------------------------------------------------
db is a 6 oscillator additive synthesizer based on WebAudioAPI,
inspired by the ethos of the drawbar organ.
it is designed to be both immediate & easy to understand,
with a simple, modular structure & 36 instantly tweakable parameters.

to play chromatically, the keys are mapped as follows:
    W   E       T   Y   U
  A   S   D   F   G   H   J   K
  -----------------------------
    C#  D#      F#  G#  A#
  C   D   E   F   G   A   B   C

to shift octave down, press and hold SHIFT & press L ARROW
to shift octave up, press and hold SHIFT & press R ARROW
(-/+ 5 octaves from default position)

STRUCTURE
----------------------------------------------------------------------------
the synthesis engine is comprised of 6 main sections
each denoted by a different color & symbol
they are as follows, in order from left to right:

> oscillator (OSC, dark purple) - controls the relative amplitudes of each of the 6 partials
> ratio      (RAT, light purple) - controls the tuning ratio of each partial, in reference to the fundamental
> shaper     (OFX, muted red) - applies a variable amount of waveshaping distortion to each partial
> pan        (PAN, soft teal) - controls the L/R placement of each partial in the stereo field
> envelope   (AMP, light blue) - controls the shape & curve of the ADSR envelope, applied in stereo
> lfo        (LFO, muted pink) - controls the shape, speed & depth of 2 configurable LFOs

OSC
----------------------------------------------------
each "partial" is comprised of a single sine wave
the gain for each is controlled by the corresponding drawbar on the OSC page.
each partial is thus assigned its own independent pre-mix level
bounded between 0 & unity gain.
the default positions fall in line with a simple harmonic series
with each partial N [N == 1 to 6] being 1/N the maximum amplitude (unity).
coupled with the default ratio settings (see below), this creates a starting sound
similar in character to a sawtooth wave

RAT
----------------------------------------------------
each partial also has an independent frequency
determined in reference to the fundamental of each note;
frequencies are set by the corresponding ratio parameter on the RAT page.
the sliders default to a simple harmonic series, similar to a sawtooth -
1st has no multiplier (1x), 2nd is x2, 3rd is x3, 4th is x4, 5th is x5, 6th is x6
the center drawbar position yields no multiplier for that partial (frequency == fundamental)
above center sweeps through ascending multiples of the fundamental (overtones)
  1.00x - 8.00x in increments of .33
below center sweeps through descending divisions of the fundamental (µndertones)
  0.80x - 0.16x in varying increments

OFX
----------------------------------------------------
each partial also has its own independent waveshaping distortion applied to it,
prior to being panned & attenuated according to the VCA envelope.
the distortion mix level for each partial is set by the corresponding drawbar on the OFX page,
starting with no distortion (bottom position, default state) to full distortion (top position).
the distortion itself takes the form of a nonlinear waveshaper, using a sigmoid curve
to generate rich harmonics from a simple sine wave
  note: the distortion is applied as a mix, which is to say that
  both the oscillator & distortion are mixed together in the amounts
  determined by their drawbars, prior to being panned & attenuated

PAN
----------------------------------------------------
the PAN page allows each partial to be panned to a specific region of the stereo field,
prior to being mixed down & attenuated.
the exact L/R placement of each partial is controlled by the corresponding drawbar.
default position is center (equal panning) for all partials.
top position is fully left, bottom position is fully right.

AMP
----------------------------------------------------
the AMP page contains a standard ADSR envelope,
with controls for attack, decay, sustain and release.
an additional control allows for a time offset to be introduced between the stereo envelopes,
delaying the trigger of either the left or right envelope by a configurable amount.
another control introduces an amount of attenuated randomness into the delay parameter,
allowing the trigger times to continually vary by a small, chaotic amount.
this will be especially noticeable when playing polyphonically (chords)

LFO
----------------------------------------------------
the LFO page is fairly standard, hosting two identical LFOs, with separate shape,
speed and depth controls for each.
the left LFO (sliders 1-3) affects the amount of tremolo (ampltiude variation)
the right LFO (sliders 4-6) affects the amount of vibrato (pitch variation)

EDIT:
this page will most likely be nixed;
instead offering one LFO per page, freely routable to any of the parameters on that page.
this page will most likely be changed to a master reverb effect.

NOTES
----------------------------------------------------------------------------
this project is still very much in development; the aforementioned structure is mostly
finalized, but may change in minor ways as the project moves forward.

the current alpha build runs just a single voice,
which begins sounding at receipt of user interaction (page select).

currently implemented:
  • oscillators & mix controls (page 1)
  • ratio table & ratio select (page 2)
  • waveshapers & mix controls (page 3)
  • per partial pan & controls (page 4)
  • oscilloscope display
to implement:
  • stereo envelopes & control (page 5)
  • LFO modulators & routing   (page 6)
  • info page display (to show param changes)
  • keyboard note change & trigger
  • 6 voice polyphony
  • pattern sequencer

additional functionality will include MIDI controller support (using WebMIDI API),
configurable root note & scale, as well as a selectable semitone offset to the fundamental.

^w^
