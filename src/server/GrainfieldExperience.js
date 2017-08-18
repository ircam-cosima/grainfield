import { Experience } from 'soundworks/server';
import { exec } from 'child_process';
import fse from 'fs-extra';

export default class GrainfieldExperience extends Experience {
  constructor(clientTypes, conductor) {
    super(clientTypes);

    this.sharedParams = this.require('shared-params');
    this.checkin = this.require('checkin');
    this.audioBufferManager = this.require('audio-buffer-manager');

    this.sharedRecorder = this.require('shared-recorder');

    this.sharedConfig = this.require('shared-config');
    this.sharedConfig.share('resamplingVarMax', 'player');
    this.sharedConfig.share('recordings', 'recorder');
  }

  start() {
    // this.sharedRecorder.addListener('available-file', (name, chunkIndex, path) => {
    //   this.broadcast('controller', null, 'stop', name);
    // });
  }

  enter(client) {
    super.enter(client);

    switch (client.type) {
      case 'player':
        this.sharedParams.update('numPlayers', this.getNumPlayers());
        break;
    }
  }

  exit(client) {
    super.exit(client);

    switch (client.type) {
      case 'player':
        this.sharedParams.update('numPlayers', this.getNumPlayers());
        break;
    }
  }

  getNumPlayers() {
    const players = this.clients.filter((client) => client.type === 'player');
    return players.length;
  }
}
