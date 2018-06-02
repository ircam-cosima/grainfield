import * as soundworks from 'soundworks/client';
import Synth from './Synth';
import Renderer from './Renderer';
import PitchAndRollEstimator from './PitchAndRollEstimator.js';

const client = soundworks.client;


function dBToLin(val) {
  return Math.exp(0.11512925464970229 * val); // pow(10, val / 20)
};

function linToDB(val) {
  return 8.685889638065035 * Math.log(val); // 20 * log10(val)
};

// const colors = [
//   'rgb(255, 112, 0)',
//   'rgb(218, 32, 9)',
//   'rgb(32, 1, 135)',
// ];

const colors = [
  '#dd0085', // 'pink'
  '#ee0000', // 'red'
  '#ff7700', // 'orange'
  '#ffaa00', // 'yellow'
  '#43af00', // 'green'
  '#0062e2', // 'darkBlue'
  '#009ed8', // 'lightBlue'
  '#6b7884', // 'grey'
  '#6700f7', // 'purple'
];

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="section-top"></div>
    <div class="section-center flex-center">
      <p class="normal">
        <% if (state === 'wait') { %>
          Connected,<br/>
          Please wait.
        <% } else if (state === 'starting') { %>
          Starting sound...
        <% } else if (state === 'playing') { %>
          Playing,<br/>
          Move your device.
        <% } else if (state === 'end') { %>
          Thanks,<br/>
          That's all!
        <% } %>
      </p>
    </div>
    <div class="section-bottom"></div>
  </div>
`;

class PlayerView extends soundworks.CanvasView {
  constructor(template, model, events, options) {
    super(template, model, events, options);

    this.currentColorIndex = undefined;
  }

  setState(state) {
    if (state !== this.model.state) {
      this.model.state = state;
      this.render('.foreground');
    }
  }

  updateBackgroundColor() {
    let newColorIndex = Math.floor(Math.random() * colors.length);

    while (newColorIndex === this.currentColorIndex)
      newColorIndex = Math.floor(Math.random() * colors.length);

    const backgroundColor = colors[newColorIndex];

    this.$el.style.backgroundColor = backgroundColor;
    this.currentColorIndex = newColorIndex;
  }

  clearBackgroundColor(releaseTime) {
    this.$el.style.transition = `background-color ${releaseTime}s`;
    this.$el.style.backgroundColor = 'transparent';
    this.currentColorIndex = undefined;
  }
}

class PlayerExperience extends soundworks.Experience {
  constructor(kind = 'player') {
    super();

    this.kind = kind;

    this.platform = this.require('platform', { features: 'web-audio' });
    // this.require('locator');
    this.checkin = this.require('checkin');
    this.audioBufferManager = this.require('audio-buffer-manager');
    this.sharedParams = this.require('shared-params');

    this.sharedConfig = this.require('shared-config', {
      items: ['recordings'],
    });

    this.motionInput = this.require('motion-input', {
      descriptors: ['accelerationIncludingGravity'],
    });

    this.sharedRecorder = this.require('shared-recorder', {
      recorder: false,
    });

    this._processAccelerationData = this._processAccelerationData.bind(this);
    this._onBuffer = this._onBuffer.bind(this);
  }

  start() {
    super.start();

    const recordings = this.sharedConfig.get('recordings');
    this.phase = client.index % recordings.record.num;
    console.log(this.phase);

    this.synth = new Synth();
    this.pitchAndRoll = new PitchAndRollEstimator();
    this.view = new PlayerView(template, { state: 'none' });
    this.renderer = new Renderer();

    this.show();

    // global synth parameters
    this.sharedParams.addParamListener('periodAbs', (value) => {
      this.synth.setPeriodAbs(value);
    });

    this.sharedParams.addParamListener('durationAbs', (value) => {
      this.synth.setDurationAbs(value);
    });

    this.sharedParams.addParamListener('positionVar', (value) => {
      this.synth.setPositionVar(value);
    });

    this.sharedParams.addParamListener('resamplingVar', (value) => {
      this.synth.setResamplingVar(value);
    });

    // gain for each group
    this.sharedParams.addParamListener(`gain`, (value) => {
      const gain = dBToLin(value);
      this.synth.setGain(gain);
    });

    // once * is initialized, update state of the application
    this.sharedParams.addParamListener('state', (value) => {
      this[`${value}State`]();
    });

    this.motionInput.addListener('accelerationIncludingGravity', this._processAccelerationData);
  }

  waitState() {
    this.view.setState('wait');
  }

  startState() {
    this.sharedRecorder.addListener('record', [this.phase], this._onBuffer);

    this.view.setState('starting');
  }

  endState() {
    this.sharedRecorder.removeListener('record');

    const releaseTime = 5 + Math.random() * 5;
    this.synth.stop(releaseTime);

    this.view.clearBackgroundColor(releaseTime);
    this.view.removeRenderer(this.renderer);

    setTimeout(() => this.view.setState('end'), (releaseTime + 2) * 1000);
  }

  _onBuffer(buffer, phase) {
    console.log('new buffer', phase);
    this.synth.setBuffer(buffer);

    if (!this.synth.isPlaying) {
      this.synth.start();
      this.view.addRenderer(this.renderer);
    }

    this.view.setState('playing');
    this.view.updateBackgroundColor();
  }

  _processAccelerationData(data) {
    const accX = data[0];
    const accY = data[1];
    const accZ = data[2];

    const pitchAndRoll = this.pitchAndRoll;
    pitchAndRoll.estimateFromAccelerationIncludingGravity(accX, accY, accZ);

    const cutoffFactor = 1 - Math.max(0, Math.min(90, pitchAndRoll.pitch)) / 90;

    const maxRoll = 65;
    let positionFactor = Math.max(-maxRoll, Math.min(maxRoll, pitchAndRoll.roll)) / maxRoll;

    this.synth.setCutoffFactor(cutoffFactor);
    this.synth.setPositionFactor(positionFactor);

    this.renderer.setPosition(positionFactor);
  }

}

export default PlayerExperience;
