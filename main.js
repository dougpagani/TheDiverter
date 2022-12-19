const http = require("http");

const HOST = 'localhost';
const PORT = 5678;
const CORE_DUMP_PATH = global.home + '.diverter-dump.json' // TODO
const CONFIG_PATH = global.home + '.diverter-config.yml' // TODO
const EVENT_EP_PATH = 'event'
const CANCEL = 'CANCEL'
const ONE_MINUTE_IN_MS = 60 * 1000

// ---------------------
// Database stuff
// ---------------------
function initDb() {
  // TODO: import from coredump here, on new-init
  const cd = getCoreDump()
  global.db = cd
}

function getCoreDump() {
  const json = fs.readFileSync(CORE_DUMP_PATH)
  return JSON.parse(json)
}
function dumpCore() {
  dbWriter(global.db)
}

function dbWriter(dbPayload) {
  // UNTESTED
  const dbAsJson = ppJson(dbPayload)
  fs.writeFileSync(CORE_DUMP_PATH, dbAsJson) // TODO: make this async so we can dump while running
}

function ppJson(jso) {
  return JSON.stringify(dbPayload, null, 2)
}

function dumpCoreAndExit() {
  gracefulStopServer() // stop before dumpCore so we get anything 
  dumpCore()
  process.exit(0) // a clean exit should show as 0
}

function gracefulStopServer() {
  // Not sure what to do here besides wait for the process to clear event-queue
  // ... publishers should possibly know to hold onto their events and publish them "later"
  // ... this would entail a ~5 second restart at most, when recompiling & deploying changes
  stopListening() // probably a method on 'app'
  finishQueue() // pseudo-code; probably needs to be a recursive-promise to allow threads chance to finish
}

function stopListening() {
  // TODO -- need a ref to the listener
}
function finishQueue() {
  // TODO -- probably need to check jobs of node internals, and async-recursively await until those are processed
}

function dumpCoreOnly() {
  // just a name shim for clarity
  dumpCore()
}

function initCoreDumpers() {
  // Some of these can't be ignored, and so are pointless. I don't remember which.
  process.on('SIGHUP', dumpCoreAndExit)
  process.on('SIGINT', dumpCoreAndExit)
  process.on('SIGQUIT', dumpCoreAndExit)
  process.on('SIGABRT', dumpCoreAndExit)
  process.on('SIGTERM', dumpCoreAndExit)
  process.on('SIGINT', dumpCoreAndExit)
  process.on('SIGUSR1', getActiveIntervention) // this is ^T i think
  process.on('SIGUSR2', dumpCoreOnly) // no control-char to do this, but can do manually
  process.on('SIGSTOP', dumpCoreAndExit)
  process.on('SIGTSTP', dumpCoreAndExit) // ^Z
  process.on('SIGCONT', dumpCoreAndExit) // send by fg, after ^Z
}

// ---------------------
// Server stuff
// ---------------------

function initServer() {
  const server = http.createServer(handleRequest);
  server.listen(port, host, () => {
    console.log(`Listening on: http://${host}:${port}/${EVENT_EP_PATH}`);
  });
}

function handleRequest(req, res) {
  const ee = req.
  // We can probably do this as soon as we've received the request and we know it's 
  res.writeHead(200);
  res.end(`pong`); // probably should only be for /ping route, change later
}

// ---------------------
// Intervention-mapping
// ---------------------

// The request-level stuff should be stripped away, leaving us with just a symbolic string
function handleEncounter(ee) {
  // TODO -- obviously a console print does nothing of interest
  console.log(ee)
  // ... should give a stream of EncounterEvents

  const relevantIntervention = lookupIntervention(ee)
  console.log(`Intervening on [${ee}] with: [${relevantIntervention}]`) // todo, add a datestamp, use a real logger lib
  relevantIntervention(ee)
}

function lookupIntervention(ee) {
  TODO // based-on loadConfig, probably set on global
}

function loadConfig() {
  const yamlString = fs.readFileSync(CONFIG_PATH)
  const diverterConfig = parseYaml(yamlString)
  global.diverterConfig = diverterConfig
}

function parseYaml(string) {
  const jso = TODO(string) // google: yaml parsing package for nodejs, add to reqs
  return jso
}

// These can get broken-out into modules later
// ---------------------
// Interventions
// ---------------------
// iby == intervene-by, signifying a top-level intervention strategy

function ibySessionTimeBudget(ee) {
  // This is more concerned about an individual session; there will be a minor
  // bit of persistence (hysteresis to prevent activity-chatter from
  // constantly restarting the timer), wherein the time-budget progress will be 
  // saved for a ~15-minute interval. This would be better to be used in conjunction 
  // with a subsequent intervention, like an emotion-menu, since it's meant to implement 
  // the sensation of "well, I've already gone on reddit once today".

  const timeOfEntry = date.now()

  if (ee === CANCEL) {
    const myTimer = setTimeout(resetSessionBudget, ONE_MINUTE_IN_MS)
    global.db.stbTimer = myTimer
    // alternative:
    // saveValue({ iby: stb, key: 'timerRefForPossibleAbortOfSessionResetIfTheUserReencounters', value: myTimer})

    return // BAIL ONCE TIMER IS SET
  }

  // else, is real event
  if (isResumption(ee)) {
    const spentBudget = getSpentBudget(ee)
    const timeLeftInBudget = calculateTimeLeft(allowanceInMinutes, spentBudget)    
    const actuationTimer = planActuator()
    global.db.stb.acuationTimer = actuationTimer
  } else { 
    // is fresh event
    const timeLeftInBudget = allowanceInMinutes
    const actuationTimer = planActuator()
    global.db.stb.acuationTimer = actuationTimer
  }

  const planActuator() => setTimeout(ACTUATOR, timeLeftInBudget)
  const isResumption(ee) => { /* if under resumption-threshold */ }
  const resetSessionBudget() => { global.db.TODO }
  const getSpentBudgetForEe(ee) => { TODO }
  const calculateTimeLeft(a, s) => { TODO }
  const calculateBudgetDecrement(start, finish) // this is for daily budget actually, not STB; STB doesn't even bother
}

// ---------------------
// INITs
// ---------------------
initDb()
initCoreDumpers()
initServer()
