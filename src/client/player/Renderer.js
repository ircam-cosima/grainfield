import * as soundworks from 'soundworks/client';

class Renderer extends soundworks.Canvas2dRenderer {
  constructor() {
    super();

    this._position = null;
  }

  setPosition(value) {
    value = 0.5 * (value + 1);
    this._position = value;
  }

  render(ctx) {
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    const x = this._position * this.canvasWidth;
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, this.canvasHeight);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
}

export default Renderer;
