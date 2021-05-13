  import { ArcLayer } from '@deck.gl/layers';

  const vsDeclaration = `
  attribute float instanceDate;
  varying float vDate;
  `

  const vsMain = `
  vDate = instanceDate;
  `

  const fsDeclaration = `
  uniform float currentTime;
  varying float vDate;
  `

  const fsColorFilter = `
  float tripDuration = 10.0;
  float dateDiff = currentTime - vDate;
  float delay = 0.0;
  float normalisedArch = fract(geometry.uv.x);

  // Head of the trip animation curve
  // delay, end, currentValue
  float rMax = smoothstep(delay, tripDuration, dateDiff);

  // Tail of the trip animation curve
  float rMin = smoothstep(tripDuration, tripDuration + tripDuration, dateDiff);

  float alpha = 0.0;
  bool animationHasFinished = dateDiff > tripDuration;
  if(!animationHasFinished)
  {
    alpha = normalisedArch > rMax ? 0.0 : 1.0;
  }
  else
  {
    alpha = normalisedArch > rMin ? 1.0 : 0.0;
  }

  if (alpha == 0.0) {
    discard;
  }

  color.a *= alpha;
  `

  //@ts-ignore
  export class AnimatedArcLayer extends ArcLayer {
    initializeState(params : any) {
      console.log("AnimatedArcLayer.initializeState", params)
      super.initializeState(params);
      
      //@ts-ignore
      this.getAttributeManager().addInstanced({
        instanceDate: {
          size: 1,
          accessor: 'getRenderDate',
          transform: this.normaliseTime,
          defaultValue: this.normaliseTime(Date.now()),
        },
      });
    }

    normaliseTime(date: number) {
      return (date / 1000) - 1620677383
    }

    getShaders() {
      const shaders = super.getShaders();
      shaders.inject = {
        'vs:#decl': vsDeclaration,
        'vs:#main-end': vsMain,
        'fs:#decl': fsDeclaration,
        'fs:DECKGL_FILTER_COLOR': fsColorFilter
      };
      return shaders;
    }

    draw(opts : any) {
      super.draw(opts);

      //@ts-ignore
      this.state.model.setUniforms({
        currentTime: this.normaliseTime(Date.now()),
      });

      //@ts-ignore
      this.setNeedsRedraw();
    }
  }