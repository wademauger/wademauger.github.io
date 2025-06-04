/**
 * Testing script for Google Drive Service Migration
 * 
 * This script helps verify that the modern Google Drive service
 * works correctly and provides the same functionality as the old service.
 */

// Test configuration
const TEST_CONFIG = {
    CLIENT_ID: 'your-google-client-id.apps.googleusercontent.com',
    MOCK_LIBRARY: {
        artists: [
            {
                name: 'Test Artist',
                albums: [
                    {
                        title: 'Test Album',
                        songs: [
                            {
                                title: 'Test Song',
                                lyrics: ['[C]Test lyrics [F]line 1', '[G]Test lyrics [Am]line 2'],
                                notes: 'Test notes',
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            }
                        ]
                    }
                ]
            }
        ],
        TEST_LIBRARY: {
            "artists": [
                {
                    "name": "Rebecca Sugar",
                    "albums": [
                        {
                            "title": "Steven Universe Soundtrack",
                            "songs": [
                                {
                                    "title": "Giant Woman",
                                    "lyrics": [
                                        "All I wanna [F]do is see you turn in[G7]to a giant [Cmaj7]woman, a giant [E7]woman",
                                        "All I wanna [F]be is someone who gets to [G7]see a giant [Cmaj7]woman",
                                        "All I wanna [F]do is help you turn [G7]into a giant [Cmaj7]woman, a giant [E7]woman",
                                        "All I wanna [F]be is someone who gets to [G7]see a giant [Cmaj7]woman",
                                        "Oh, I know it'll be [B7]great and I just can't wait",
                                        "to see the [Em7]person you [G7]are [Cmaj7]together",
                                        "If you give it a [B7]chance you could do a huge dance,",
                                        "because you [Em7]are a giant woman.",
                                        "You might even [F]like being to[G7]gether and if you [Cmaj7]don't it won't be [E7]forever",
                                        "But if it were [F]me I'd really wanna [G7]be a giant [Cmaj7]woman",
                                        "A giant [E7]woman",
                                        "All I wanna [F]do is see you turn [G7]into a giant [Cmaj7]woman"
                                    ],
                                    "chords": [
                                        "F",
                                        "G7",
                                        "Cmaj7",
                                        "E7",
                                        "B7",
                                        "Em7"
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "id": "1",
                    "name": "The Beatles",
                    "albums": [
                        {
                            "id": "101",
                            "title": "Abbey Road",
                            "songs": [
                                {
                                    "id": "1001",
                                    "title": "Come Together",
                                    "lyrics": [
                                        "Here come old flat top, he come grooving up slowly..."
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "Lady Gaga",
                    "albums": [
                        {
                            "title": "The Fame",
                            "songs": [
                                {
                                    "title": "Retro Dance Freak",
                                    "id": "1748037546938",
                                    "lyrics": [
                                        "[C]Retro dance freak",
                                        "[D]Singin [Em]retro [D7]dance [C]beat"
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "Joywave",
                    "albums": [
                        {
                            "title": "How Do You Feel Now?",
                            "songs": [
                                {
                                    "title": "Destruction",
                                    "lyrics": [
                                        "[Em]    [F]   [Em]    [F] (2x)",
                                        "[Em]Oh my god, there's nobody who can [F]set me right   [Em]    [F]",
                                        "[Em]I've been sent to torch the [F]palace down in broad day[Em]light  [F]",
                                        "[Em]I wanna [D]know who you told 'til they're [C]all laying on the floor",
                                        "Frozen to the [Am]core",
                                        "[Em]I wanna [D]know who you told 'til it's [C]nobody anymore [Em] [D] [C]",
                                        "Nobody [Am]anymore",
                                        "[Em]    [F]   [Em]    [F] (2x)",
                                        "[Em]Oh my [F]God, I'm a [Em]giant with an [F]appetite",
                                        "[Em]Pushing people to the [F]ground, running '[Em]round the halls at [F]night",
                                        "[Em]I wanna [D]know who you told 'til they're [C]all laying on the floor",
                                        "Frozen to the [Am]core",
                                        "[Em]I wanna [D]know who you told 'til it's [C]nobody anymore [Em] [D] [C]",
                                        "Nobody [Am]anymore",
                                        "[Em]    [F]   [Em]    [F] (2x)",
                                        "[Em]I've been [D]creeping 'round I saw a [C]little thing I didn't [Am]like",
                                        "[Em]You tried to [D]hide",
                                        "[Em]I've been [D]creeping 'round and saw a [C]little thing I didn't [F]like",
                                        "[Em]You tried to [D]hide from [C]me [F]",
                                        "[Em]I wanna [D]know who you [C]took, there's nobody [F]any...",
                                        "[Em]Nobody [D]anymore [C] [Am]",
                                        "[Em]Nobody [D]anymore [C] [F]"
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "Ariana Grande",
                    "albums": [
                        {
                            "title": "Eternal Sunshine: Brighter Days Ahead",
                            "songs": [
                                {
                                    "title": "Intro End of the World (Extended)",
                                    "lyrics": [
                                        "[E]     [G#7]     [C#7]     [F#m7]     [B7]",
                                        "[E]How can I [G#7]tell if I'm in the right [C#7]relationship?",
                                        "Aren't you really s'posed to [F#m7]know that shit?",
                                        "Feel it in your bones and [B7]own that shit? I don't know",
                                        "[E]Then I had this [G#7]interaction I've been thinkin' [C#7]'bout for like five [G#7]weeks",
                                        "Wonder if he's thinkin' [F#m7]'bout it too and smiling",
                                        "Wonder if he knows that [B7]that's been what's inspirin' me",
                                        "Wonder if he's [E]judgin' me like I am right [G#7]now [G#7]",
                                        " ",
                                        "[C#7]I don't care",
                                        "I'd rather tell the [F#m7]truth (Truth)",
                                        "Than make it worse for [B7]you, mm (You)",
                                        " ",
                                        "If the [E]sun re[G#7]fused to [C#7]shine",
                                        "Baby, would [F#m7]I still be your lover?",
                                        "[B7]Would you want me there?",
                                        "If the [E]moon went [G#7]dark to[C#7]night",
                                        "And if it [F#m7]all ended tomorrow",
                                        "[B7]Would I be the one on your [E]mind, your [G#7]mind, your [C#7]mind?",
                                        "And if it all ended to[F#m7]morrow",
                                        "[B7]Would you be the one on mine?",
                                        " ",
                                        "[A]Please pay [G#m]me no [F#]mind",
                                        "While I jump in[A]to your skin and [G#m]change your [F#]eyes",
                                        "So [A]you see things through mine ([G#m]Through mine, through [F#]mine, through mine, through mine)",
                                        "Can't you sense me? I've been [A]right here all this [G#m]time ([B7]All this time) [F#m7]",
                                        "Would you still be here pretending you still like [B7]me?",
                                        "Pre[E]tending you don't [G#7]regret not [C#7]thinking before asking",
                                        "Now you're long gone in [F#m7]Cali (Now you're long)",
                                        "And me, I'm still un[B7]packing (Still unpacking)",
                                        "Why I even allowed you on the [E]flight [G#7] [C#7]",
                                        " ",
                                        "I broke your heart because you broke [F#m7]mine (I broke your heart)",
                                        "So me, I am the bad [B7]guy (I am the bad guy)",
                                        "'Cause I'd already [E]grieved you [G#7]",
                                        "And you started to [C#7]realize",
                                        "I do need ya, I [F#m7]did ([B7]Mm)",
                                        "I wish I could un-need ya, so I [F#m7]did [B7]"
                                    ],
                                    "chords": [
                                        "E",
                                        "G#7",
                                        "C#7",
                                        "F#m7",
                                        "B7",
                                        "A",
                                        "G#m",
                                        "F#"
                                    ]
                                },
                                {
                                    "title": "Hampstead",
                                    "lyrics": [
                                        "[C]    [E7]    [Am]    [G]    [F]    [G]    [C]",
                                        "[C]I left my [E7]heart at a [Am]pub in [G]Hampstead",
                                        "And I [Dm]misplaced my [C]mind in a [G]good way",
                                        "[C]Threw away my repu[E7]tation, but [Am]saved us more [G]heartache",
                                        "Yes, I [F]know it seems fucked [G]up and you're [C]right",
                                        "[C]But quite frankly, you're [E7]still wrong about [Am]everything [G]",
                                        "[Dm]So far off, your [C]seat's nowhere near the [G]table",
                                        "[C]But I find something [E7]sweet in your [Am]peculiar beha[G]vior",
                                        "[F]'Cause I think to be so [G]dumb must be [C]nice",
                                        "[E7]I do, I do, I do, I do [Am]",
                                        "",
                                        "[D7]What makes you think you’re even in[G]vited?",
                                        "[E7]The doors are closed with lights off [Am]inside and all the [G]while [F]",
                                        "[Am]There's no one home, you're [G]still out[Fm]side",
                                        "I wonder why",
                                        "",
                                        "[C]What's wrong with a little bit of [D]poison? Tell me",
                                        "[F]I would rather feel everything than [G]nothing every time",
                                        "[C]Ooh, fear me, stranger, a little bit of [D]sugar, danger",
                                        "[F]I'd rather be seen and a[Em]live than [Dm]dying by your point of [G]view",
                                        "[G]I do, I do, I do, I do",
                                        "",
                                        "[C]I don't remember too [E7]much of the [Am]last year",
                                        "[G]But I knew who I was when I got here [Dm] [C] [G]",
                                        "[C]'Cause I'm still the same but [E7]only entirely [Am]different [G]",
                                        "[F]And my lover's just some [G]lines in some [C]songs, mm [E7] [Am]",
                                        "",
                                        "[D7]You think you’ve read the book I’m still [G]writing",
                                        "[E7]I can't imagine wanting so [Am]badly to be [G]right [F]",
                                        "[Am]Guess I’m forever on your [G]mind [Fm]",
                                        "I wonder why",
                                        "",
                                        "[C]What's wrong with a little bit of [D]poison? Tell me (Tell me)",
                                        "[F]I would rather feel everything than [G]nothing every time (Every, every time)",
                                        "[C]Ooh, fear me, stranger, a little bit of [D]sugar (Sugar), danger (Danger)",
                                        "[F]I'd rather be seen and a[Em]live than [Dm]dying by your point of [G]view",
                                        "",
                                        "[F]Rather be swimming with [Em]you than [Dm]drowning in a crowded room",
                                        "[G]I do, I do, I do, I do [C]"
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "Kesha",
                    "albums": [
                        {
                            "title": "Eat The Acid (Gag Order)",
                            "songs": [
                                {
                                    "title": "Eat The Acid",
                                    "lyrics": [
                                        "[B5]You don't wanna be [G6]changed like it changed me",
                                        "[Em]You don't wanna be [Bm]changed like it changed me",
                                        "[Bm]You don't wanna be [G6]changed like it changed me",
                                        "[Em]You don't wanna be [Bm]changed like it changed me",
                                        "",
                                        "[Bm]Been dodgin' gods I didn't [G6]want",
                                        "(You don't wanna be changed like it changed me)",
                                        "[Em]I'd gotten used to bein' [Bm]lost",
                                        "(You don't wanna be changed like it changed me)",
                                        "[Bm]I never felt like I feel be[G6]longed",
                                        "(You don't wanna be changed like it changеd me)",
                                        "[Em]Turns out my mama wasn't [Bm]wrong",
                                        "(You don't wanna be changed likе it changed me)",
                                        "",
                                        "[Bm]You said, \"Don't ever eat the [D5]acid if",
                                        "[G6]You don't wanna be changed like it changed me\"",
                                        "[Em]You said, \"All the edges got so [A]jagged now",
                                        "[Bm]Everything you saw then can't be unseen\"",
                                        "",
                                        "[Bm]Last night, I [D5]saw it [G6]all",
                                        "[Em]Last night, I [A]talked to [Bm]God",
                                        "",
                                        "[Bm](Ah-ah, [D5]ah-ah) [G6]",
                                        "You don't wanna be changed like it changed me",
                                        "[Em](Ah-ah, [A]ah-ah) [Bm]",
                                        "You don't wanna be changed like it changed me",
                                        "[Bm](Ah-ah, [D5]ah-ah) [G6]",
                                        "You don't wanna be changed like it changed me",
                                        "[Em](Ah-ah, [A]ah-ah) [Bm]",
                                        "You don't wanna be changed like it changed me",
                                        "",
                                        "[Bm]I swear to God, I closed my [G6]eyes",
                                        "[Em]I heard a voice inside my [Bm]mind",
                                        "[Bm]The universe said, \"Now's your [G6]time\"",
                                        "[Em]And told me everything's al[Bm]right",
                                        "",
                                        "[Bm]You said, \"Don't ever eat the [D5]acid if",
                                        "[G6]You don't wanna be changed like it changed me\"",
                                        "[Em]You said, \"All the edges got so [A]jagged now",
                                        "[Bm]Everything you saw then can't be unseen\"",
                                        "",
                                        "[Bm]You said, \"Don't ever eat the [D5]acid if",
                                        "[G6]You don't wanna be changed like it changed me\"",
                                        "[Em]You said, \"All the edges got so [A]jagged now",
                                        "[Bm]Everything you saw then can't be unseen\"",
                                        "",
                                        "[Bm]Last night, I [D5]saw it [G6]all",
                                        "[Em]Last night, I [A]talked to [Bm]God",
                                        "",
                                        "[Bm](Ah-ah, [D5]ah-ah) [G6]",
                                        "You don't wanna be changed like it changed me",
                                        "[Em](Ah-ah, [A]ah-ah) [Bm]",
                                        "You don't wanna be changed like it changed me",
                                        "",
                                        "[Bm]I searched for answers all my [G6]life",
                                        "[Em]Dead in the dark, I saw a [Bm]light",
                                        "I am the one that I've been fighting the whole time",
                                        "Hate has no place in the divine",
                                        "",
                                        "[G]In the di[D]vine",
                                        "[A]In the di[Bm]vine",
                                        "[G]In the di[D]vine",
                                        "[A]In the di[Bm]vine",
                                        "",
                                        "[G](Place in the divine)",
                                        "You said, \"Don't ever eat the [D]acid if",
                                        "[A]You don't wanna be changed like it [Bm]changed me\"",
                                        "[G]You said, \"All the edges got so [D]jagged now",
                                        "[A]Everything you saw then can't be [Bm]unseen\"",
                                        "",
                                        "[G]You said that the universe is [D]magic",
                                        "[A]Just open up your eyes, the signs are [Bm]waiting",
                                        "[G]You said, \"Don't ever eat the [D]acid if",
                                        "[A]You don't wanna be changed like it [Bm]changed me\"",
                                        "",
                                        "[G]Last night, I [D]saw it [A]all [Bm]",
                                        "[G]Last night, I [D]talked to [A]God [Bm]",
                                        "",
                                        "[Bm](Ah-ah, ah-ah)",
                                        "You don't wanna be changed like it changed me",
                                        "[Bm](Ah-ah, ah-ah)",
                                        "You don't wanna be changed like it changed me",
                                        "[Bm](Ah-ah, ah-ah)",
                                        "You don't wanna be changed like it changed me",
                                        "[Bm](Ah-ah, ah-ah)",
                                        "You don't wanna be changed like it changed me"
                                    ],
                                    "transpose": 1
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "Miley Cyrus",
                    "albums": [
                        {
                            "title": "Something Beautiful",
                            "songs": [
                                {
                                    "title": "Something Beautiful",
                                    "id": "1749001135656",
                                    "chords": [
                                        "Fmaj7",
                                        "Cmaj7",
                                        "D7",
                                        "G7",
                                        "D",
                                        "Gmaj7",
                                        "F#7",
                                        "Bm",
                                        "C7",
                                        "Am",
                                        "F#m",
                                        "E",
                                        "C#m"
                                    ],
                                    "lyrics": [
                                        "[Fmaj7]        [Cmaj7]         [D7]",
                                        "[Fmaj7]Tell me something [Cmaj7]beautiful [D7]tonight",
                                        "Until your [Fmaj7]lips turn blue",
                                        "Said I don't wanna [Cmaj7]talk about it for too [D7]long",
                                        "Baby, now I think I [Fmaj7]do",
                                        "[Cmaj7]Ah, water to red wine, [D7]kissing to kill time",
                                        "Oh [G7]my, [Fmaj7]yeah",
                                        "[Cmaj7]Ah, watching the doves cry [D7]into the sunrise",
                                        "[D]Oh, [Gmaj7]flash, [F#7]bang, [Bm]spark",
                                        "[C7]Send home the [Gmaj7]guards and [F#7]lay [Bm]down your [Cmaj7]arms",
                                        "[Fmaj7]And da----da-da-da[F#7]-da-[Am]da",
                                        "[Cmaj7]The great golden [Gmaj7]bomb, [F#7]bomb, [Bm]bomb",
                                        "[Bm]Boy, I'm losing my breath, yes",
                                        "[Bm]Boy, you're marking up my necklace",
                                        "[Bm]Boy, I'm losing my breath",
                                        "[Bm]I'm undressing and confessing that I'm so obsessed, yes",
                                        "[Fmaj7]Tell me something [Cmaj7]beautiful, yeah, about this [D7]world",
                                        "When I'm in your [Fmaj7]palm, I'm like a pearl",
                                        "[Fmaj7]Tell me something, [Cmaj7]I can hold on to, you're who I belong to",
                                        "[D7]I drown in devotion as deep as the ocean (Devotion the ocean)",
                                        "So don't let me go, no, no, no",
                                        "[Gmaj7]Flash, [F#7]bang, [Bm]spark",
                                        "[Gmaj7]Flash, [F#7]bang, [Bm]spark",
                                        "[F#7]Bomb, [Bm]bomb",
                                        "[Bm]Boy, I'm losing my breath, yes",
                                        "[Bm]Boy, you're marking up my necklace",
                                        "[Bm]Boy, I'm losing my breath",
                                        "[Bm]I'm undressing and confessing that I'm so obsessed, yes",
                                        "[F#m]      [E]    [C#m]      [Bm]",
                                        "[F#m]Eat my heart, [E]break my soul",
                                        "[C#m]Take my parts, [Bm]let me go",
                                        "[F#m]Eat my heart, [E]break my soul",
                                        "[C#m]Take my parts, [Bm]let me go",
                                        "[F#m]Eat my heart, [E]break my soul",
                                        "[C#m]Take my parts, [Bm]let me go",
                                        "[F#m]Eat my heart, [E]break my soul",
                                        "[C#m]Take my parts, [Bm]let me go",
                                        "[F#m]     [E]    [C#m]     [Bm]",
                                        "[F#m]     [E]    [Bm]     [C#m]",
                                        "[F#m]     [E]    [F#m]     [E]",
                                        "[F#m]     [E]   [F#m]"
                                    ]
                                },
                                {
                                    "title": "End of the World",
                                    "id": "1749002152876",
                                    "chords": [],
                                    "lyrics": []
                                }
                            ]
                        }
                    ]
                }
            ]

        },
        version: '1.0',
        lastUpdated: new Date().toISOString()
    }
};

class GoogleDriveServiceTester {
    constructor(service) {
        this.service = service;
        this.testResults = [];
    }

    log(test, result, error = null) {
        const testResult = {
            test,
            passed: result,
            error: error?.message || null,
            timestamp: new Date().toISOString()
        };
        this.testResults.push(testResult);

        const status = result ? '✅' : '❌';
        console.log(`${status} ${test}${error ? ` - ${error.message}` : ''}`);
    }

    async runTests() {
        console.log('🚀 Starting Google Drive Service Tests');
        console.log('=====================================');

        await this.testInitialization();
        await this.testAuthentication();
        await this.testLibraryOperations();
        await this.testCRUDOperations();
        await this.testErrorHandling();

        this.printSummary();
    }

    async testInitialization() {
        console.log('\\n📦 Testing Initialization');

        try {
            await this.service.initialize(TEST_CONFIG.CLIENT_ID);
            this.log('Service initialization', true);
        } catch (error) {
            this.log('Service initialization', false, error);
        }
    }

    async testAuthentication() {
        console.log('\\n🔐 Testing Authentication');

        // Test initial state
        this.log('Initial signed-in state is false', !this.service.isSignedIn);
        this.log('Initial access token is null', !this.service.accessToken);

        // Note: Actual sign-in testing requires user interaction
        console.log('ℹ️  Manual test required: Test sign-in process in browser');
        console.log('ℹ️  Manual test required: Test sign-out process in browser');
        console.log('ℹ️  Manual test required: Test token validation after page refresh');
    }

    async testLibraryOperations() {
        console.log('\\n📚 Testing Library Operations');

        // Mock library operations (when not signed in)
        try {
            // These should throw "not signed in" errors when not authenticated
            await this.service.loadLibrary();
            this.log('Load library (unauthenticated)', false, new Error('Should have thrown auth error'));
        } catch (error) {
            const expectedError = error.message === 'User not signed in to Google Drive';
            this.log('Load library throws auth error when not signed in', expectedError, expectedError ? null : error);
        }

        try {
            await this.service.saveLibrary(TEST_CONFIG.MOCK_LIBRARY);
            this.log('Save library (unauthenticated)', false, new Error('Should have thrown auth error'));
        } catch (error) {
            const expectedError = error.message === 'User not signed in to Google Drive';
            this.log('Save library throws auth error when not signed in', expectedError, expectedError ? null : error);
        }
    }

    async testCRUDOperations() {
        console.log('\\n🔧 Testing CRUD Operations');

        const mockLibrary = JSON.parse(JSON.stringify(TEST_CONFIG.MOCK_LIBRARY));

        // Test adding artist
        try {
            await this.service.addArtist(mockLibrary, 'New Test Artist');
            this.log('Add artist (unauthenticated)', false, new Error('Should have thrown auth error'));
        } catch (error) {
            const expectedError = error.message === 'User not signed in to Google Drive';
            this.log('Add artist throws auth error when not signed in', expectedError, expectedError ? null : error);
        }

        // Test adding album
        try {
            await this.service.addAlbum(mockLibrary, 'test-artist-1', 'New Test Album');
            this.log('Add album (unauthenticated)', false, new Error('Should have thrown auth error'));
        } catch (error) {
            const expectedError = error.message === 'User not signed in to Google Drive';
            this.log('Add album throws auth error when not signed in', expectedError, expectedError ? null : error);
        }

        // Test adding song
        try {
            const songData = {
                name: 'New Test Song',
                chords: '[C] [G] [Am] [F]',
                lyrics: 'New test lyrics',
                notes: 'New test notes'
            };
            await this.service.addSong(mockLibrary, 'test-artist-1', 'test-album-1', songData);
            this.log('Add song (unauthenticated)', false, new Error('Should have thrown auth error'));
        } catch (error) {
            const expectedError = error.message === 'User not signed in to Google Drive';
            this.log('Add song throws auth error when not signed in', expectedError, expectedError ? null : error);
        }

        // Test updating song
        try {
            const updateData = { name: 'Updated Test Song' };
            await this.service.updateSong(mockLibrary, 'test-artist-1', 'test-album-1', 'test-song-1', updateData);
            this.log('Update song (unauthenticated)', false, new Error('Should have thrown auth error'));
        } catch (error) {
            const expectedError = error.message === 'User not signed in to Google Drive';
            this.log('Update song throws auth error when not signed in', expectedError, expectedError ? null : error);
        }
    }

    async testErrorHandling() {
        console.log('\\n⚠️  Testing Error Handling');

        // Test token validation when not signed in
        try {
            const isValid = await this.service.validateToken();
            this.log('Token validation returns false when not signed in', !isValid);
        } catch (error) {
            this.log('Token validation handles errors gracefully', true);
        }

        // Test sign out when not signed in
        try {
            await this.service.signOut();
            this.log('Sign out handles not-signed-in state gracefully', true);
        } catch (error) {
            this.log('Sign out handles not-signed-in state gracefully', false, error);
        }
    }

    printSummary() {
        console.log('\\n📊 Test Summary');
        console.log('================');

        const passed = this.testResults.filter(r => r.passed).length;
        const failed = this.testResults.filter(r => !r.passed).length;
        const total = this.testResults.length;

        console.log(`Total tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`Success rate: ${((passed / total) * 100).toFixed(1)}%`);

        if (failed > 0) {
            console.log('\\n❌ Failed Tests:');
            this.testResults
                .filter(r => !r.passed)
                .forEach(r => console.log(`  - ${r.test}: ${r.error}`));
        }

        console.log('\\n🔍 Manual Tests Required:');
        console.log('  1. Test sign-in flow in browser');
        console.log('  2. Test sign-out flow in browser');
        console.log('  3. Test library loading when authenticated');
        console.log('  4. Test library saving when authenticated');
        console.log('  5. Test CRUD operations when authenticated');
        console.log('  6. Test token persistence across page refreshes');
        console.log('  7. Test automatic token refresh (wait ~1 hour)');
    }
}

// Usage example:
// import GoogleDriveServiceModern from './services/GoogleDriveServiceModern.js';
// const tester = new GoogleDriveServiceTester(GoogleDriveServiceModern);
// tester.runTests();

export default GoogleDriveServiceTester;
