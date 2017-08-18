import * as soundworks from 'soundworks/client';

const template = `
  <div class="foreground">
    <div class="section-top"></div>
    <div class="section-center flex-center">
      <p><%= msg %></p>
    </div>
    <div class="section-bottom"></div>
  </div>
`;

class RecorderExperience extends soundworks.Experience {
  constructor() {
    super();

    this.sharedRecorder = this.require('shared-recorder', { recorder: true });
    this.sharedParams = this.require('shared-params');
    this.sharedConfig = this.require('shared-config', { items: ['recordings'] });
  }

  start() {
    super.start();

    const recordingsConfig = this.sharedConfig.get('recordings');
    const { duration, period, num, cyclic } = recordingsConfig['record'];
    this.sharedRecorder.createBuffer('record', duration, period, num, cyclic);

    console.log('record', duration, period, num, cyclic);

    this.view = new soundworks.SegmentedView(template, { msg: 'stopped' });

    this.show().then(() => {
      this.sharedParams.addParamListener('record', (state) => {
        if (state === 'record') {
          this.sharedRecorder.startRecord('record');
          this.view.model.msg = 'recording';
        } else {
          this.sharedRecorder.stopRecord('record');
          this.view.model.msg = 'stopped';
        }

        this.view.render();
      });
    });
  }
}

export default RecorderExperience;
