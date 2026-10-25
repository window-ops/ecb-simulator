# Sound

[Back to Developing](developing.md)

## Interface sounds

`js/audio/sound.js` makes every sound in the browser with the Web Audio API, as in Selk. Every sound ends in a high-pass filter and a compressor. `S.SOUND_LIST` lists every sound with its group, its name, when it plays and whether it is on at first.

The audio context is made at the first click, tap or key press, never before: a browser refuses to start one earlier and warns of it. Its buffer is larger than the lowest-latency one, so the sound does not crackle while the page is busy.

Noise bursts are rendered once into a buffer from a fixed seed, so a control sounds the same each time. Every burst of the set is rendered when the context is made and when the sound settings change. A burst whose buffer is not ready yet plays live from the same graph, so it is never late or missing. Every sound starts 20 ms ahead, so its first milliseconds are not cut.

| Category | Sounds |
| --- | --- |
| Clicks | Buttons, choices, check boxes and switches (one sound for on and one for off), drop-down lists, sliders, folding boxes, popovers, opening and closing a dialog or a menu |
| Alerts | Warnings, good and bad results, notifications |
| Votes | Each vote in the Council and the gavel |
| End of a year | The turn transition |
| Alerts, added | An action refused (error: a key that cannot be used, a file refused, saving refused), an achievement unlocked |
| Saves | A save made or overwritten, a save loaded, saves imported, saves exported, a save or other data deleted |
| Typing and pointer | A key typed in a text field (at most every 40 ms), the pointer moving onto a button; both off at first |

A button clicks after its action. When the action plays a sound of its own, such as Save, Load or Export, the click goes into that sound: the noise of Click alone, at 40% of its volume, with the sound 12 ms after it. The click leads and the sound keeps its shape.

A sound that begins with noise of its own, such as Open or Delete, needs no click and plays alone, and so does a sound played from its Play button in Settings. A sound switched off leaves the click to play alone. A notification raised by an action that played a sound adds no second sound.

The save sounds are each one gliding tone, with no noise: save rises and load falls (sine), import rises and export falls (triangle, a fifth lower).

Check boxes, switches, lists, sliders and folding boxes sound through listeners on the whole page, so a new control of these kinds needs no code of its own to sound.

A menu, such as More above the phone's tabs or the menu at the right of the phone's toolbar, sounds as it opens and as it closes: from its button, a tap outside it, Escape or a scroll. Choosing an item closes it without the closing sound, since the item makes its own.

Settings > Sound has an **All sound** switch for all audio, which the toolbar button also sets. Below it, **Soundtrack and interface sounds** turns both category switches on or off together; it is on only when both are on. The separate **Interface sounds** switch controls these sounds alone, with a volume and a level for each category.

Sound set holds a seed (`soundSeed`, 0 to 999 999), with Random and The set as designed. Each seed gives every sound its own pitch (within a fifth either way, in semitones), length (80% to 125%), filter width and soft tone (sine or triangle), drawn from the seed and the sound's name, so a seed always gives the same set; 0 is the set as designed. Each group of sounds has a card, as the soundtrack's pieces do: a row for each sound with its check box, a volume from 0 to 100% with a button back to 100%, a pitch from an octave below to an octave above (in semitones), and Play, which sounds it even while it is off; a note under the card says when each sound plays; `sounds` keeps only what differs from the default, by sound. The seed and each sound's settings apply on top of each other, and both under the group's level.

Speakers sets every level at once for the default, laptop speakers, headphones, a phone speaker, or desktop or TV speakers (`S.sound.PRESETS`); a level moved by hand shows as Custom. Each slider has a button that sets it back to its default.

While All sound is off, the combined switch remains available to turn both categories on or off together; the other sound controls are disabled. While the soundtrack is off, its music controls are disabled, with a line that says why. The soundtrack has its own switch, so it can play with interface sounds off.

## Music

`js/audio/music.js` plays the soundtrack, off by default, from the notes in `js/data/music/` (a folder for each playlist, `european/` and `resistance/`). Nine pieces follow the state of the game:

| Piece | Plays | Key and tempo |
| --- | --- | --- |
| Eurocrisis | By default | D minor, 72 beats a minute |
| Draghi | For three years after a Draghi measure | F major, 84 |
| Troika | While the bank sits in a Troika | A minor, 64 |
| Superbad | While the bank sits in a Troika within three years of a Draghi measure | B, 60, a diminished chord, square tones, bells and a slow kick |
| Bankrupt | When a run ends badly | C minor, 54 |
| Ode to Joy | When a period ends with no grade better than the record (C): the status quo kept and the crisis no smaller. The melody of the European anthem (Beethoven, 1824, public domain) over plain chords | D major, 96 |
| October | The move into the Federation: the end of the first period, unless it kept the status quo, and the year 2041. Named after the Red October | E minor, 108, a march |
| Kremlin | Every federal year from 2042 until the period ends, whatever the year brings short of a breakup; the name is ironic | G minor, 72, a hymn with bells |
| Finally | When a period ends well, and in calm years: a backstop of at least 0.6, unemployment at or below 8%, inflation between 0 and 3%, no loan program | G major, 92 |

Before a game, on the title screen and the form for a new game, Strasbourg plays (D major, 96, stately, with a fanfare tune, after the seat of the European Parliament). When Settings > Appearance > Title screen has a theme and its music switch is on (the default), the theme's own piece plays in its place:

| Theme | Piece | Key, tempo and voice |
| --- | --- | --- |
| Popular | Subsidiarity | B flat major, 72, a slow chorale with bells, no arpeggio |
| Social | Solidarity | A minor, 108, an oom-pah march with soft drums and a brass tune |
| Renew | Ever Closer | E flat major, 116, bright syncopated pop with drums |
| Green | Green Deal | G major, 80, a flute tune over a held bass |
| Conservative | Nations | F major, a waltz in three with bells |
| Patriot | Borders | D minor, 100, a drummed march with a bugle tune |
| Sovereign | Own Money | C minor, 66, a sparse music box with bells and no held chords |
| Left | Another Europe | B minor, 120, a rising tune over pumping bass, offbeat stabs and soft drums |

Strasbourg has a fanfare tune of its own. A theme's piece that is off defaults to Strasbourg.

Bankrupt, then Superbad, then Troika come first, then Ode to Joy, then October, then Finally at the end of a period, then Kremlin in the Federation; before 2041, Finally in calm years, then Draghi, then Eurocrisis.

When one piece gives way to another, the piece playing fades out as the next piece swells in, so the soundtrack sounds continuous. TROIKA.RUN keeps its hard cut.

### The resistance playlist

Settings > Sound > Playlist picks European (the pieces above) or Resistance. A change of playlist crossfades at once: the piece playing fades out as its counterpart fades in, both over about half a second. In the resistance playlist each of the nine game pieces, and each of the nine title pieces, has a variant made from a public domain song of resistance, in the key and tempo of the piece it stands for:

| Piece | Variant | Key and tempo |
| --- | --- | --- |
| Eurocrisis | Bella ciao (Italian, traditional) | D minor, 72 |
| Draghi | Bandiera rossa (Italian, traditional) | F major, 84 |
| Troika | Le Temps des cerises (Antoine Renard, 1868), in 3/8 | A minor, 64, with a bell |
| Superbad | Bella ciao | B minor, 60, square tones and bells |
| Bankrupt | Warszawianka (Józef Pławiński, 1905) | C minor, 54, low |
| Ode to Joy | L'Internationale (Pierre De Geyter, 1888) | D major, 96 |
| Finally | Bandiera rossa | G major, 92 |
| October | Warszawianka | E minor, 108, a march |
| Kremlin | L'Internationale | G major, 72, a hymn with bells |

Bandiera rossa, Warszawianka and Le Temps des cerises are taken from scores: the arrangement of Bandiera rossa by Bruno Bizzarri, the 1905 Polish version of Warszawianka, and the voice line of Le Temps des cerises published by Profs-Edition (2014). Only the melodies, which are in the public domain, are used. The variants keep the settings of the piece they stand for: its switch and its volume. Changing the playlist hands over to the other playlist's piece at once on the title screen and in a game, and the Play buttons in Settings play the chosen playlist's piece.

The title screen's pieces take the voices of their theme:

| Piece | Variant | Key and tempo |
| --- | --- | --- |
| Strasbourg | L'Internationale | D major, 96 |
| Subsidiarity | Bandiera rossa, a chorale with bells | B flat major, 72 |
| Solidarity | Warszawianka, an oom-pah march | A minor, 108 |
| Ever Closer | Bandiera rossa, with drums | E flat major, 116 |
| Green Deal | Bella ciao, in sine tones | G major, 80 |
| Nations | Le Temps des cerises, in 3/8 with bells | F major, 100 |
| Borders | Warszawianka, a drummed march | D minor, 100 |
| Own Money | Le Temps des cerises, a music box | C minor, 66 |
| Another Europe | L'Internationale, with drums | B minor, 120 |

The time-lapse of the run, played from the finale of 2070, plays Bella ciao at 120 beats a minute in both playlists. It waits for the downbeat, and the piece before fades quickly as the next piece swells in, so Bella ciao has faded into the finale's piece before the player goes back to the finale.

The ending film makes no sound of its own; its title is silent, and the click of its Show summary is the player's own.

Each piece is a loop of chords with a soft pad, a bass and a quiet arpeggio; the Troika and Kremlin pieces add a bell. Every voice plays at a fixed level, so the music stays even, and at full volume it peaks at about a fifth of a click.

A change of piece follows the music: it waits for the next downbeat of the piece playing, or its next half bar when a bar would keep it waiting more than two seconds.

There the piece playing adds no more notes and fades quickly. The new piece enters and swells in, so there is no silence and no clash of chords; its drums enter on its second bar.

Leaving the title screen for a game lets the title piece go at once, and a preview from Settings starts at once. Turning the music off fades it out where it stands; leaving the tab or the window pauses it, as below. Each piece plays through a gain of its own, so the notes of one piece still ringing out fade with it.

The music pauses while the game does not have the focus: when the tab changes or is hidden, or the window loses the focus. Settings > Sound > Music > In the background keeps it playing instead. The focus is kept by `S.pageFocused()` (see [Architecture](architecture.md#events)).

Coming back resumes the piece where it paused, never from its start: it comes in over 0.4 s, with the rest of its bar's chord.

The master switch, which the sound button in the toolbar also sets, silences the music with every other sound. Settings > Sound sets the music's volume and, for each piece, a switch, a volume and a 20-second preview; a piece that is off gives way to Eurocrisis.

An easter egg, left out of the player's documents: with Sound and Music on, Greece clicked five times in a row, in the Countries table or on the map, no more than a second and a half apart, shows only the normal text "You seem obsessed with Greece and its euro crisis." in Greece's map tooltip on the fifth click.

The clue clears as TROIKA.RUN starts immediately after. The song loops in the background. Its name appears in the existing status area: in the sidebar foot or in the bottom status bar, according to Settings > Appearance > Status. Pause hands the music back to the game's soundtrack, and play brings the song back where it stopped; X stops it and removes its status player.

Repeating the clicks starts it again. The song does not make a hidden status bar appear. The piece (`troikarun` in `js/audio/music.js`) follows Selk's `troika.js`: the hijaz mode on D at 132 beats a minute, a sine bass in a 3-3-2 rhythm, a kick on the beat, a square arpeggio and the square melody. It is in no list in Settings. Turning Sound or Music off stops the song and removes its status player.

Motion, text and keyboard are on [Accessibility](accessibility.md).
