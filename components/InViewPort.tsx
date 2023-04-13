//'use strict';

import React, { Component, ReactNode } from 'react';
import { View, Dimensions } from 'react-native';

interface Props {
  disabled?: boolean;
  delay?: number;
  onChange: (isVisible: boolean) => void;
  children: ReactNode;
}

interface State {
  rectTop: number;
  rectBottom: number;
  rectWidth?: number;
}

export class InViewPort extends Component<Props, State> {
  private interval: ReturnType<typeof setInterval> | null = null;
  private myview: View | null = null;
  private lastValue: boolean | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { rectTop: 0, rectBottom: 0 };
  }

  componentDidMount() {
    if (!this.props.disabled) {
      this.startWatching();
    }
  }

  componentWillUnmount() {
    this.stopWatching();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.disabled && !this.props.disabled) {
      this.lastValue = null;
      this.startWatching();
    } else if (!prevProps.disabled && this.props.disabled) {
      this.stopWatching();
    }
  }

  private startWatching() {
    if (this.interval) {
      return;
    }
    this.interval = setInterval(() => {
      if (!this.myview) {
        return;
      }
      this.myview.measure((x, y, width, height, pageX, pageY) => {
        this.setState({
          rectTop: pageY,
          rectBottom: pageY + height,
          rectWidth: pageX + width,
        });
      });
      this.isInViewPort();
    }, this.props.delay || 100);
  }

  private stopWatching() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private isInViewPort() {
    const window = Dimensions.get('window');
    const isVisible =
      this.state.rectBottom !== 0 &&
      this.state.rectTop >= 0 &&
      this.state.rectBottom <= window.height &&
      this.state.rectWidth !== undefined &&
      this.state.rectWidth <= window.width;
    if (this.lastValue !== isVisible) {
      this.lastValue = isVisible;
      this.props.onChange(isVisible);
    }
  }

  render() {
    return (
      <View
        collapsable={false}
        ref={component => {
          this.myview = component;
        }}
        {...this.props}
      >
        {this.props.children}
      </View>
    );
  }
}