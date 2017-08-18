// enable source-maps in node
import 'source-map-support/register';
import path from 'path';
import * as soundworks from 'soundworks/server';
import GrainfieldExperience from './GrainfieldExperience';
import ControllerExperience from './ControllerExperience';

const configName = process.env.ENV || 'default';
const configPath = path.join(__dirname, 'config', configName);
let config = null;

// rely on node `require` for synchronicity
try {
  config = require(configPath).default;
} catch(err) {
  console.error(`Invalid ENV "${configName}", file "${configPath}.js" not found`);
  process.exit(1);
}

process.env.NODE_ENV = config.env;

// configure application
config.resamplingVarMax = 1200;

config.recordings = {
  'record': {
    duration: 2,
    period: 1,
    num: 10,
    cyclic: true,
  },
}

// initialize the server with configuration informations
soundworks.server.init(config);

// define the configuration object to be passed to the `.ejs` template
soundworks.server.setClientConfigDefinition((clientType, config, httpRequest) => {
  return {
    env: config.env,
    clientType: clientType,
    websockets: config.websockets,
    appName: config.appName,
    version: config.version,
    defaultType: config.defaultClient,
    assetsDomain: config.assetsDomain,
  };
});

const sharedParams = soundworks.server.require('shared-params');

sharedParams.addText('numPlayers', 'Num Players', 0, ['controller']);
sharedParams.addEnum('state', 'State', ['wait', 'start', 'end'], 'wait');
// recorders
sharedParams.addEnum('record', 'Record', ['record', 'stop'], 'stop');
sharedParams.addNumber('gain', 'Volume', -60, 26, .1, 0);
// granular engine params
sharedParams.addNumber('periodAbs', 'Period', 0.02, 0.2, 0.001, 0.05);
sharedParams.addNumber('durationAbs', 'Duration', 0.01, 0.5, 0.001, 0.2);
sharedParams.addNumber('positionVar', 'Position Var', 0.01, 0.5, 0.001, 0.02);
sharedParams.addNumber('resamplingVar', 'Resampling Var', 0, 1200, 1, 0);

// create the common server experience for both the soloists and the players
const controller = new ControllerExperience('controller');
const soundfieldExperience = new GrainfieldExperience(['player', 'recorder']);

// start the application
soundworks.server.start();
