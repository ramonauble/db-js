OVERVIEW
----------------------------------------------------------------------------
db is a 6 oscillator additive synthesizer based on WebAudioAPI,
inspired by the ethos of the drawbar organ.
it is designed to be both immediate & easy to understand,
with a simple, modular structure & instantly tweakable parameters.

this implementation will host 6 voices of true polyphony (duplicated signal paths),
with separate oscillators, effects, and envelopes for each of the 6 voices.
the voices share the same parameter values, and all voices are changed uniformly
when modifying the parameters during playback.

STRUCTURE
----------------------------------------------------------------------------
the synthesis engine is comprised of 6 main sections
each denoted by a different color & symbol
they are as follows, in order from left to right:

> oscillator (OSC, dark purple) - controls the relative amplitudes of each of the 6 partials
> ratio      (RAT, light purple) - controls the tuning ratio of each partial, in reference to the fundamental
> crush      (OFX, muted red) - applies a variable amount of bitcrushing distortion to each partial
> pan        (PAN, soft teal) - controls the L/R placement of each partial in the stereo field
> envelope   (AMP, light blue) - controls the shape & curve of the ADSR envelope, applied in stereo
> lfo        (LFO, muted pink) - controls the shape, speed & depth of 2 configurable LFOs

OSC
----------------------------------------------------
each "partial" is comprised of a single sine wave
the gain for which is controlled by the corresponding drawbar on the OSC page.
each partial is thus assigned its own independent pre-mix level
bounded between 0 & unity gain.
the default position falls in line with a simple harmonic series
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
above center sweeps through ascending multiples of the fundamental (harmonics)
below center sweeps through descending divisions of the fundamental (µharmonics)

OFX
----------------------------------------------------
each partial can have its own independent distortion applied to it,
prior to being panned & attenuated according to the VCA envelope.
the distortion for each partial is set by the corresponding drawbar on the OFX page,
starting with no distortion (bottom position, default state) to full distortion (top position).
the distortion itself takes the form of a bitcrush effect, dynamically changing the
sampling depth of each partial individually as it is applied

PAN
----------------------------------------------------
the PAN page allows each partial to be panned to a specific region of the stereo field,
prior to being mixed down & attenuated.
the exact placement of each partial is controlled by the corresponding drawbar.
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

NOTES
----------------------------------------------------------------------------
this project is still very much in development; the aforementioned structure is mostly
finalized, but may change in minor ways as the project moves forward.

additional functionality will include MIDI controller support (using WebMIDI API),
configurable root note & scale, as well as a configurable semitone offset to the fundamental.

this synthesizer is intended as a software realization of a hardware prototype,
also presently in development, based on the atmega328 platform.
