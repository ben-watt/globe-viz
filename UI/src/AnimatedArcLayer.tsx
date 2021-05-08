  import { ArcLayer } from '@deck.gl/layers';

  const vsDeclaration = `
  attribute float instanceDate;
  varying float vDate;
  varying float vArcLength;
  `

  const vsMain = `
  vArcLength = distance(source, target);
  vDate = instanceDate;
  `

  const fsDeclaration = `
  uniform float currentTime;

  varying float vArcLength;
  varying float vDate;
  `

  const fsColorFilter = `
  // Duration of trip in seconds * multiplier;
  float tripDuration = 5.0 * 100.0;
  float normalisedArch = fract(geometry.uv.x);
  float dateDiff = (currentTime - vDate) * 10.0;

  // Head of the trip animation curve
  float rMax = smoothstep(0.0, tripDuration, dateDiff);

  // Tail of the trip animation curve
  float rMin = smoothstep(tripDuration, tripDuration + tripDuration, dateDiff);

  // Only colour in from rMin to rMax
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
  class AnimatedArcLayer extends ArcLayer {
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

    initializeState(params : any) {
      console.log(params)
      super.initializeState(params);
      
      //@ts-ignore
      this.getAttributeManager().addInstanced({
        instanceDate: {
          size: 1,
          accessor: 'getDate',
          defaultValue: 0.0
        },
      });
    }
    
    draw(opts : any) {
      console.log("draw");
      //@ts-ignore
      this.state.model.setUniforms({
        currentTime: (Date.now() - 1615746276338) / 100,
      });

      super.draw(opts);
      //@ts-ignore
      this.setNeedsRedraw();
    }
  }

  export { AnimatedArcLayer }