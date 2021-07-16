  import { ArcLayer, ArcLayerProps } from '@deck.gl/layers';


  const fsDeclaration = `
  uniform float animationPerc;
  uniform float animationSpeed;
  uniform float animationDuration;
  `

  const fsColorFilter = `
  float normalisedArch = fract(geometry.uv.x);
  float velocity = animationPerc * animationSpeed;

  float arcHead = smoothstep(0.0, 1.0, velocity);
  float arcTail = smoothstep(1.0, 2.0, velocity);

  float alpha = 0.0;
  bool animationHasFinished = velocity >= animationDuration;
  if(!animationHasFinished)
  {
    alpha = normalisedArch > arcHead ? 0.0 : 1.0;
  }
  else
  {
    alpha = normalisedArch > arcTail ? 1.0 : 0.0;
  }

  if (alpha == 0.0) {
    discard;
  }

  color.a *= alpha;
  `

  //@ts-ignore
  export class AnimatedArcLayer extends ArcLayer<AnimatedArcLayerData, AnimatedArchLayerProps> {
    initializeState(context : any) {
      super.initializeState({ context });
    }

    getShaders() {
      const shaders = super.getShaders();
      shaders.inject = {
        'fs:#decl': fsDeclaration,
        'fs:DECKGL_FILTER_COLOR': fsColorFilter
      };
      return shaders;
    }

    normalise(now: number, startDate: Date, durationMiliseconds: number) {
      let minDate = startDate.getTime();
      let maxDate = new Date(startDate).setMilliseconds(durationMiliseconds);
      return ((now - minDate) / (maxDate - minDate))
    }

    //@ts-ignore
    shouldUpdateState({ props, oldProps, context, changeFlags }) {
      if(changeFlags.propsChanged === "props.renderDate changed deeply") {
        return false;
      }

      super.shouldUpdateState({ props, oldProps, context, changeFlags });
    }

    draw(opts : any) {
      let animationDurationMilliseconds = 5000;

      let renderDate = new Date(this.props.renderDate);
      let currentTime = Date.now();
      let animationPerc = this.normalise(currentTime, renderDate, animationDurationMilliseconds);

      this.state.model.setUniforms({
        animationSpeed: 1.0, 
        animationDuration : 1.0,
        animationPerc: animationPerc,
      });
      
      super.draw(opts);
      this.setNeedsRedraw();
    }
  }

  interface Loc {
    name: string,
    latitude: number,
    longitude: number,
  }

  export interface AnimatedArcLayerData {
    id: string,
    date: string,
    from: Loc,
    to: Loc
  }

  interface AnimatedArchLayerProps extends ArcLayerProps<AnimatedArcLayerData> {
    renderDate: Date
  }

  AnimatedArcLayer.layerName = "ArcLayer"
  AnimatedArcLayer.defaultProps = {
    renderDate: Date
  }