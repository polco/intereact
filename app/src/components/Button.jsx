import React from 'react';
import classNames from 'classnames';
import plug from 'spur-plug';
import ButtonPlugin from 'spur-button-plugin';

class Button extends React.Component {
  onPress() {
    this.setState({ pressed: true });
  }

  onRelease() {
    this.setState({ pressed: false });
  }

  render() {
    return (
      <div className={classNames( pressed: this.state.pressed )}>{this.props.children}</div>
    )
  }
}

export default plug({ button: ButtonPlugin }, Button);
