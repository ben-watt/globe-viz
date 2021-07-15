  import { ArcLayer } from '@deck.gl/layers';


  const fsDeclaration = `
  uniform float startTime;
  uniform float currentTime;
  uniform float animationSpeed;
  uniform float animationDuration;
  `

  const fsColorFilter = `
  float dateDiff = startTime - currentTime;
  float normalisedArch = fract(geometry.uv.x);

  float velocity = dateDiff * animationSpeed;

  //smoothstep(startTime, animationDuration, velocity);

  if(animationDuration < velocity) {
    discard;
  }


  // Head of the trip animation curve
  // delay, end, currentValue
  float rMax = smoothstep(0.0, animationDuration, velocity);

  // Tail of the trip animation curve distance between the head and tail
  float rMin = smoothstep(animationDuration, animationDuration + animationDuration, velocity);

  float alpha = 0.0;
  bool animationHasFinished = velocity > animationDuration;
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

  interface AnimatedArcLayerData {}

  interface AnimatedArchLayerProps {
    renderDate: Date
  }

  //@ts-ignore
  export class AnimatedArcLayer extends ArcLayer<AnimatedArcLayerData, AnimatedArchLayerProps> {
    /**
     *
     */
    constructor(props :AnimatedArchLayerProps) {
      super(props);

      console.log(props);
      
    }

    initializeState(context : any) {
      super.initializeState({ context, renderDate: Date.now() });

      console.log("AnimatedArcLayer.initializeState: ", context);
      console.log("AnimatedArcLayer State", this.state)

      
      // this.getAttributeManager().addInstanced({
      //   instanceDate: {
      //     size: 1,
      //     accessor: 'getRenderDate',
      //     transform: (x : any) => this.normal2(Date.now(), 10000),
      //     defaultValue: this.normal2(Date.now(), 10000),
      //   },
      // });
    }

    // Attemps to return a number between 0 - 1 for
    // the length of the animiation based on duration
    normal2(now: number, startDate: Date, durationMiliseconds: number) {
      let minDate = startDate.getDate();
      let maxDate = new Date(startDate).setMilliseconds(durationMiliseconds);
      return (now - minDate) / (maxDate - minDate)
    }

    getShaders() {
      const shaders = super.getShaders();
      shaders.inject = {
        // 'vs:#decl': vsDeclaration,
        // 'vs:#main-end': vsMain,
        'fs:#decl': fsDeclaration,
        'fs:DECKGL_FILTER_COLOR': fsColorFilter
      };
      return shaders;
    }

    draw(opts : any) {
      super.draw(opts);

      let rndDate = new Date(this.props.renderDate);
      console.log("Rndr Date:" + this.props.renderDate.getUTCSeconds())

      this.state.model.setUniforms({
        startTime: 0.0,
        animationSpeed: 1.0, 
        animationDuration : 5000,
        currentTime: this.normal2(Date.now(), rndDate, 5000),
      });

      this.setNeedsRedraw();
    }
  }

  AnimatedArcLayer.layerName = "ArcLayer"
  AnimatedArcLayer.defaultProps = {
    renderDate: Date
  }