import React, { PropTypes } from 'react';
import Progress from '../../../components/uielements/progress';

export default class SingleProgressWidget extends React.PureComponent {
  render() {
    const {
      label, percent, barHeight, status, info, fontColor, barColor,
    } = this.props;

    const wrapperStyle = { marginTop: '18px', marginBottom: '18px' };

    const titleStyle = {
      color: fontColor,
      fontSize: '16px',
      fontWeight: 300,
    };

    return (
      <div className="isoSingleProgressBar" style={wrapperStyle}>
        <h3 style={titleStyle}>{label}</h3>
        <Progress
          className={barColor}
          percent={percent}
          strokeWidth={barHeight}
          status={status}
          showInfo={info}
        />
      </div>
    );
  }
}

SingleProgressWidget.propTypes = {
  label: PropTypes.string,
  percent: PropTypes.number,
  barHeight: PropTypes.number,
  status: PropTypes.string,
  info: PropTypes.bool,
  fontColor: PropTypes.string,
  barColor: PropTypes.string,
};

SingleProgressWidget.defaultProps = {
  label: 'Single Progress Label',
  percent: 100,
  barHeight: 8,
  status: 'active',
  info: false,
  fontColor: '#000',
  barColor: '',
};