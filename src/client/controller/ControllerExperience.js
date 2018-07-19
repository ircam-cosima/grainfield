import { Experience, View } from 'soundworks/client';
import SharedParamsComponent from './SharedParamsComponent';
import LogComponent from './LogComponent';

const template = `
  <div id="shared-params"></div>
  <div id="log"></div>
`;

class ControllerExperience extends Experience {
  constructor(options = {}) {
    super();

    this.sharedParams = this.require('shared-params');
    this.sharedParamsComponent = new SharedParamsComponent(this, this.sharedParams);
    this.logComponent = new LogComponent(this);

    this.setGuiOptions('numPlayers', { readonly: true });

    this.setGuiOptions('state', { type: 'buttons' });

    this.setGuiOptions('record', { type: 'buttons' });
    this.setGuiOptions('gain', { type: 'slider', size: 'large' });
    // granular options
    this.setGuiOptions('periodAbs', { type: 'slider', size: 'large' });
    this.setGuiOptions('durationAbs', { type: 'slider', size: 'large' });
    this.setGuiOptions('positionVar', { type: 'slider', size: 'large' });
    this.setGuiOptions('resamplingVar', { type: 'slider', size: 'large' });
    // levels
    this.setGuiOptions('outputGain', { type: 'slider', size: 'large' });

    if (options.auth)
      this.auth = this.require('auth');
  }

  start() {
    super.start();

    this.view = new View(template, {}, {}, { id: 'controller' });

    this.show().then(() => {
      this.sharedParamsComponent.enter();
      this.logComponent.enter();

      this.receive('log', (type, ...args) => {
        switch (type) {
          case 'error':
            this.logComponent.error(...args);
            break;
        }
      });

    });
  }

  setGuiOptions(name, options) {
    this.sharedParamsComponent.setGuiOptions(name, options);
  }
}

export default ControllerExperience;
