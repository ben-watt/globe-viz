  import { ArcLayer } from '@deck.gl/layers';

  const vsDeclaration = `
  attribute float instanceDate;
  varying float vDate;
  varying float vArcLength;
  float test;
  `

  const vsMain = `
  vArcLength = distance(source, target);
  vDate = instanceDate;
  `

  const fsDeclaration = `
  uniform float tailLength;
  uniform float currentTime;
  uniform float animationSpeed;

  varying float vArcLength;
  varying float vDate;
  `

  const fsColorFilter = `
  float tripDuration = 5.0;

  // start = 0, end = 1;
  float normalisedArch = fract(geometry.uv.x);

  // Position as a percentage of where the head is on the curve
 
  float rMax = smoothstep(0.0, tripDuration, currentTime - vDate);

  // Tail of the trip (alpha = 0.0)
  float rMin = 0.0;

  // Only colour in from rMin to rMax
  float alpha = (normalisedArch > rMax ? 0.0 : 1.0);

  if (alpha == 0.0) {
    discard;
  }
  color.a *= alpha;
  `

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

    initializeState(params) {
      super.initializeState(params);
      
      this.getAttributeManager().addInstanced({
        instanceDate: {
          size: 1,
          accessor: 'getDate',
          defaultValue: 0.0
        },
      });
    }
    
    draw(opts) {      
      this.state.model.setUniforms({
        tailLength: this.props.tailLength,
        animationSpeed: this.props.animationSpeed,
        currentTime: (Date.now() - 1615746276338) / 1000,
      });

      super.draw(opts);
      this.setNeedsRedraw();
    }
  }

  export { AnimatedArcLayer }