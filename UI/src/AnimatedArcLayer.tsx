  import { ArcLayer, ArcLayerProps } from '@deck.gl/layers';


  const fsDeclaration = `
  uniform float animationPerc;
  `

  const fsColorFilter = `
  float normalisedArch = fract(geometry.uv.x);

  float start = 0.0;
  float middle = 0.5;
  float end = 1.0;
  float alpha = 0.0;

  float arcHead = smoothstep(start, middle, animationPerc);
  float arcTail = smoothstep(middle, end, animationPerc);

  bool halfAnimationKeyFrame = animationPerc > middle;
  if(!halfAnimationKeyFrame)
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
      this.setState({ renderDate: new Date(this.props.renderDate) })
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
      if(oldProps.seeAllData !== props.seeAllData) {
        return true;
      }

      return super.shouldUpdateState({ props, oldProps, context, changeFlags });
    }

    draw(opts : any) {
      
      let animationPerc = 0.0;

      if(this.props.seeAllData) {
        animationPerc = 0.5;
      } else {
        let renderDate = new Date(this.state.renderDate);
        let currentTime = Date.now();
        animationPerc = this.normalise(currentTime, renderDate, this.props.animationDuration);
      }
      
      this.state.model.setUniforms({
        animationPerc: animationPerc,
      });
      
      super.draw(opts);
      setTimeout(() => this.setNeedsRedraw(), 100);
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
    renderDate: Date,
    animationDuration: number,
    seeAllData: boolean
  }

  AnimatedArcLayer.layerName = "ArcLayer"
  AnimatedArcLayer.defaultProps = {
    renderDate: Date
  }