# TheDiverter
A tool for managing distractions in a self-collaborative way.

The spiritual successor to [daemon-nanny](https://github.com/dougpagani/daemon-nanny).

A collaboration between [Dylan Sessler](https://github.com/dylan-sessler) & [Doug Pagani](https://github.com/dougpagani).

Needs publishers:
- chrome-extension -- TODO-LINK
- macos-app-focus-events -- TODO-LINK
- linux-app-focus-events -- TODO-LINK

## Index
**Index:**
- [Concepts](#Concepts)
- [Motivation](#motivation--design-philosophy)
- [Installation](#Installation)
- [Architecture](#Architecture)
- [V1 design](#V1-design)
- [Milestones & Plan](#milestones--plan)
- [Targeted Platforms](#targeted-platforms)
- [Configuration](#Configuration)
- [Actuators Inventory](#Actuators-Inventory)
- [Interventions Inventory](#interventions-inventory)

## Concepts

- **EHook**: the Encounter Hook, the publishing channel for publishers to notify Diverter (this is simply a localhost-url)
- **Distractions**: things you'd like to moderate, via automatic rules
- **Diversions**: things with which you can replace Distractions
- **Encounters**: either an AppEvent, or WebsiteEvent (an ActivityChange event)
  - ... another way to view encounters are as "distraction clues"
- **Sources/Publishers**: a system-api (for AppEvents) or browser-extension (for WebsiteEvents)
- **Immediate vs. Deferred**
  - Immediate: on (any distraction), e.g. navigate to todo-list on todo-app in computer
  - Deferred: on (any distraction), e.g. after 15 minutes close reddit tab
- **singleton-encounter strategy**: this is the default -- it describes most of the strategies (EmotionalMenu, SnapOut, etc.)
- **cross-encounter strategy**: this is the exception -- really, just DailyTimeBudget, and maybe Barter
- **Dispersables:** this is for advanced interventions; ones that need a user-specific populated "bank" of items. e.g. tasks, motivators

Un-disambiguated concepts:
- Strategies:
- Interventions:
- Suggestions:
- Actions:
- Actuators: soft & hard modules which take an action, and implement it (e.g. close-tab, navigate-to-link, play-sound)

[⏎ index](#index)
## Motivation & Design Philosophy

Without getting too much into the cognitive neuroscientific considerations of it all, the complexity of self-moderation of digital device usage has ballooned exponentially, exacerbated especially by the internet, always-in-your-pocket computers, and infinite scroll interfaces (to name a few). There have been countless billions of dollars invested in software to distract you as frequently as possible, and keep you distracted for as long as possible. This endeavor, to distract the consumer public, has earned a few nicknames (e.g. [The Attention War](https://www.forbes.com/sites/onmarketing/2012/10/19/the-attention-war/?sh=708ec1ba6f59). More bluntly, this is manipulation, and manipulation is immoral. There's nothing that can simply be banned, but we can build tools to help ourselves minimize the manipulative efforts & effects of these companies, applications, and websites.

The existential reason for this project is that this attention war is _unwinnable_ if waged with pre-historic means (self-control); the force of FAANG et al. must be matched by equivalently powerful means.

The higher order effort of this project is to build a suite of tools to help the individual manage their usage of digital devices with respect to their long-term goals; this project is specifically aimed at _managing distractions effectively._

Daemon Nanny had certain problems, both technical & paradigmatic, which rendered it unworkable. Namely,
- focus on querying over interventions
- noisy data-store -- depending on counting each event to reconstruct a time-quantity meant redundant entries until a change, instead of simply relying upon no-entry == no-change, same activity
- necessity of polling (preventing immediate responses)
- QPA structure was hard to generalize, re-use
- QPA structure had awkward bleed-over between each component of Q,P,A into the others.

[⏎ index](#index)
## Architecture

This is a multi-component architecture, by practical necessity. The core of the application is in the "Diverter", which shoulders the burden of:
- Configuration (of [distraction-->Intervention])
- Actuation (of action -> actuator)
- Intervention (of condition -> action)

**External Component List:**
- Diverter -- a locally-run application
- [Encounter](#Concepts "AppEvent OR WebsiteEvent") Publishers
  - chrome-extension
  - sys-api app-watchers (one for linux, one for macos)
- Publishing channel (`localhost:5009/event`)

[⏎ index](#index)
## V1 design
- publishers just send a string (e.g. "reddit") to EHOOK
- EHook is just `localhost:9999/event`
- DiverterServer just has two routes:
  - `/ping` --> responds to anything with `pong`, for publishers to test if they're properly configured
  - `/event` --> the main workhorse; encounters are published here
- Diverter is just a server, whose `/event` route calls `handleEncounter(ev) to map to Intervention Strategies`
- Any setIntervals, setTimeouts etc. that must be set (for DeferredInterventions for example) will be handled internal by the intervention module itself (e.g. TimeBudget intervention).
- a simple plaintext YAML api for configuration of diversion-plans
- chrome-extension has two UI-features:
  - test event, to smoke-test and see if a handler is active for a given distraction & the diverter is listening
  - configure ehook-url

[⏎ index](#index)
## Targeted Platforms

Currently supported?
- [x] linux
- [x] macos
- [ ] iphone

Possible future support targeting:
- [ ] android
- [ ] windows

_Note on macos + linux:_
Linux & macos are both x11, or x11-ish, which is the necesesary foundation for capturing _app-focus change events._ They also have good support for system-actuation via commandline. (e.g. notification, menus through packages like Zenity, playing sounds, etc.)

_Note on iphone:_
I (Doug) have actually been building a diverter system for the iphone for quite some time. ios-shortcuts provides a decent (decent, not great) opportunity for phone-based publishing/intervention-planning/actuation, but it's a very much-so "some assembly required" situation. If anyone is interested in collaborating on this you can reach out to me via Issues on Github.

_Note on Windows:_
The platform this project will work for depends largely on whether it can be aggregating encounters, and acuating interventions. For macos & linux, since they both have \*NIX shells, this is no problem. Windows has its new linux-subsystem, but who knows if that would work easily/nicely with GUI-affecting actuations. (my guess is no, you'd have to build & maintain completely unique actuators for windows). But, due to the design of this project, it shouldn't be too much work. It would require having a windows machine to develop on though, of which none of the current team has :)



[⏎ index](#index)
## Milestones & Plan
- [x] initial design
- [x] start this repo
- [ ] implement **chrome-extension publisher**
- [ ] implement **Diverter V1**
- [ ] a **GUI configuration tool** for defining diversion plans
- [ ] **auto-logging** of potential distractions, for easier configurations (tree-like drilling of http://reddit -> http://reddit/cat-pics -> http://reddit/cat-pics/meme-that-I-like-too-much)
- [ ] **coredump** (of `global.db`) to decouple novel iteration from valuable working functionality
- [ ] **composite** interventions: consider way to combine interventions, for composite interventions (e.g. TimeBudget -> Menu, instead of auto-diversion)
- [ ] **remote publishing** for state management for multi-device usage
- [ ] **phone implementation** of most of this logic (actuators, publishers, interventions, etc). 
... A note on this: only one intervention-strategy, for the most part, needs cross-encounter state -- TimeBudget. So most of this logic can simply be implemented as a decoupled system, for simplicity's sake. There are a couple `phone-actions[real-code]` frameworks through which some of the NodeJS code could be re-used that deals with singleton-encounters (thus single-device-state-tracking-interventions). However, things like actuators (eg `present-with-menu(options)`), would have to be re-implemented for the phone. For iphone, this is ios-shortcuts, of which I'm already underway developing a framework, and for android, I've heard Tasker is a viable option.
- [ ] **LaunchAgent-ification of init of Diverter** -- for macos this is a PITA that was already encountered in daemon-nanny. It seemed very possible, just that it was a pain worth putting off for the time-being.

## Intervention Strategies Inventory
_(messy)_

These are named/focused-on psychology more than they are the technical implementations.

- DailyTimeBudget
- SessionTimeBudget
- Bartering -- do x task for y minutes of distraction, "what do I need too do to earn Y?"
- CoolOff -- block access to all device usage for a time-being, to do some de-stimulation (external: dim-lights, would be useful here)
- PayWall -- pay x-minutes of your "fun budget" to gain access to whatever distraction you have gated
- SnapOut -- immediately pull yourself out once or twice
- Nagger
- TimeLeash -- leave yourself a video/audio of what you were doing, to get back to
- TotemSound -- play an audible signal every 10 minutes of distraction-consumption
- EmotionMenu -- map mental-states (e.g. bored, tired, un-warmed-up, frustrated, stressed) to specific/differentiated interventions
    - [unmotivated] -> MotivationalRepair
    - [bored] -> top-ranked "fun" + "hard" item
    - [tired] -> top-ranked "easy" item
    - [stressed] -> CoolOff, orchestrate a cool-off activity with as much automation as possible (dim-lights, play-song, play-meditation, etc.)
- OptionMenu -- similar to AutoDivert, but instead of selecting the top-item, it injects some agency and lets you pick from a list of a few options

[⏎ index](#index)
## Actuators Inventory
_(messy)_
These are implementation targets, and in some advanced cases (e.g. shift Philips bulb to green), would require per-user setup & declaration of availability.

Axes:
- packaged vs. external (close-tab vs. open-url-on-computer)
- media vs. activity (play sound, vs. change-focus)
- auxillary vs. single-threaded (i.e. changes environment vs. force-changes your focus)
  - > change-lights-color vs. change-focus
- static vs. dynamic (open yoga video vs. start needed task) -- this is roughly about interventions that need "Dispersables"

Examples:
- setup-should-do -- a todo system of sorts needs too be hooked into this dynamic-diverter
- close-tab
- open-tab
- change-lights-color
- turn-off-internet (for cooloff)
- turn-off-computer
- dnd-phone
- red-shift-phone
- red-shift-computer
[⏎ index](#index)








