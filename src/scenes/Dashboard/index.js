/* eslint react/no-array-index-key: 0, no-nested-ternary:0 */ // Disable "Do not use Array index in keys" for options since they dont have unique identifier

import React, { PropTypes } from 'react';
import { Row, Col, Icon } from 'antd';
import { connect } from 'react-redux';
import _ from 'lodash';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';

import IsoWidgetsWrapper from '../Widgets/widgets-wrapper';
import BottomButtonWidget from '../Widgets/bottom-button';
import SingleProgressWidget from '../Widgets/progress/progress-single';
import ReportsWidget from '../Widgets/report/report-widget';
import appActions from '../../redux/App/actions';
import graphqlActions from '../../redux/Graphql/actions';
import TopActions from './components/TopActions/index';
import { Token, OracleStatus, SortBy } from '../../constants';
import { getLocalDateTimeString } from '../../helpers/utility';

const TAB_BET = 0;
const TAB_SET = 1;
const TAB_VOTE = 2;
const TAB_FINALIZE = 3;
const TAB_WITHDRAW = 4;
const DEFAULT_TAB_INDEX = TAB_BET;
const MAX_DISPLAY_OPTIONS = 3;
const COL_PER_ROW = { // Specify how many col in each row
  xs: 1,
  sm: 3,
  md: 3,
  lg: 4,
  xl: 4,
  xxl: 4,
};
const ROW_GUTTER = {
  xs: 0,
  sm: 16, // Set gutter to 16 + 8 * n, with n being a natural number
  md: 24,
  lg: 24,
  xl: 32,
  xxl: 32,
};

const messages = defineMessages({
  Bet: {
    id: 'dashboard.Bet',
    defaultMessage: 'Bet',
  },
  Set: {
    id: 'dashboard.Set',
    defaultMessage: 'Set',
  },
  Vote: {
    id: 'dashboard.Vote',
    defaultMessage: 'Vote',
  },
  Finalize: {
    id: 'dashboard.Finalize',
    defaultMessage: 'Finalize',
  },
  Withdraw: {
    id: 'dashboard.Withdraw',
    defaultMessage: 'Withdraw',
  },
  betend: {
    id: 'dashboard.betend',
    defaultMessage: 'Betting ends',
  },
  resultsetend: {
    id: 'dashboard.resultsetend',
    defaultMessage: 'Result setting ends',
  },
  voteend: {
    id: 'dashboard.voteend',
    defaultMessage: 'Voting ends',
  },
  voteended: {
    id: 'dashboard.voteended',
    defaultMessage: 'Voting ended',
  },
  raise: {
    id: 'str.raise',
    defaultMessage: 'Raised',
  },
  end: {
    id: 'str.end',
    defaultMessage: 'Ended',
  },
  pbet: {
    id: 'bottombutton.placebet',
    defaultMessage: 'Place Bet',
  },
  pset: {
    id: 'bottombutton.setresult',
    defaultMessage: 'Set Result',
  },
  pvote: {
    id: 'bottombutton.vote',
    defaultMessage: 'Place Vote',
  },
  pfinal: {
    id: 'bottombutton.final',
    defaultMessage: 'Finalize Result',
  },
});

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentWillMount() {
    this.executeGraphRequest(this.props.tabIndex);
  }

  componentWillReceiveProps(nextProps) {
    const {
      tabIndex,
      sortBy,
      syncBlockNum,
    } = nextProps;

    if (tabIndex !== this.props.tabIndex
      || sortBy !== this.props.sortBy
      || syncBlockNum !== this.props.syncBlockNum) {
      this.executeGraphRequest(tabIndex, sortBy);
    }
  }

  render() {
    const { tabIndex, getTopicsReturn, getOraclesReturn } = this.props;
    const topics = getTopicsReturn;
    const oracles = getOraclesReturn;

    let rowItems;
    switch (tabIndex) {
      case TAB_BET:
      case TAB_SET:
      case TAB_VOTE:
      case TAB_FINALIZE: {
        if (oracles.length) {
          rowItems = this.renderOracles(oracles, tabIndex);
        } else {
          rowItems = this.renderEmptyList();
        }

        break;
      }
      case TAB_WITHDRAW: {
        if (topics.length) {
          rowItems = this.renderTopics(topics);
        } else {
          rowItems = this.renderEmptyList();
        }

        break;
      }
      default: {
        throw new RangeError(`Invalid tab position ${tabIndex}`);
      }
    }

    return (
      <div>
        <TopActions />
        <Row
          gutter={28}
          justify="center"
        >
          {rowItems}
        </Row>
      </div>
    );
  }

  executeGraphRequest(tabIndex, sortBy) {
    const {
      getTopics,
      getOracles,
    } = this.props;

    const sortDirection = sortBy || SortBy.Ascending;

    switch (tabIndex) {
      case TAB_BET: {
        getOracles(
          [
            { token: Token.Qtum, status: OracleStatus.Voting },
          ],
          { field: 'endTime', direction: sortDirection },
        );
        break;
      }
      case TAB_SET: {
        getOracles(
          [
            { token: Token.Qtum, status: OracleStatus.WaitResult },
            { token: Token.Qtum, status: OracleStatus.OpenResultSet },
          ],
          { field: 'resultSetEndTime', direction: sortDirection },
        );
        break;
      }
      case TAB_VOTE: {
        getOracles(
          [
            { token: Token.Bot, status: OracleStatus.Voting },
          ],
          { field: 'endTime', direction: sortDirection },
        );
        break;
      }
      case TAB_FINALIZE: {
        getOracles(
          [
            { token: Token.Bot, status: OracleStatus.WaitResult },
          ],
          { field: 'endTime', direction: sortDirection },
        );
        break;
      }
      case TAB_WITHDRAW: {
        getTopics(
          [
            { status: OracleStatus.Withdraw },
          ],
          { field: 'blockNum', direction: sortDirection },
        );
        break;
      }
      default: {
        throw new RangeError(`Invalid tab position ${tabIndex}`);
      }
    }
  }

  renderEmptyList() {
    return (
      <div className="event-empty">
        <p><Icon className="event-empty-icon" type="calendar" /></p>
        <p>No Event at Current Status</p>
      </div>
    );
  }

  renderOracles(oracles, tabIndex) {
    // Calculate grid number for Col attribute
    const colWidth = {};
    Object.keys(COL_PER_ROW).forEach((key) => {
      colWidth[key] = 24 / COL_PER_ROW[key];
    });

    const rowItems = [];
    _.each(oracles, (oracle) => {
      let endText;
      let buttonText;
      switch (tabIndex) {
        case TAB_BET: {
          endText = `${this.props.intl.formatMessage(messages.betend)} ${getLocalDateTimeString(oracle.endTime)}`;
          buttonText = this.props.intl.formatMessage(messages.pbet);
          break;
        }
        case TAB_SET: {
          endText = `${this.props.intl.formatMessage(messages.resultsetend)} ${getLocalDateTimeString(oracle.resultSetEndTime)}`;
          buttonText = this.props.intl.formatMessage(messages.pset);
          break;
        }
        case TAB_VOTE: {
          endText = `${this.props.intl.formatMessage(messages.voteend)} ${getLocalDateTimeString(oracle.endTime)}`;
          buttonText = this.props.intl.formatMessage(messages.pvote);
          break;
        }
        case TAB_FINALIZE: {
          endText = `${this.props.intl.formatMessage(messages.voteended)} ${getLocalDateTimeString(oracle.endTime)}`;
          buttonText = this.props.intl.formatMessage(messages.pfinal);
          break;
        }
        default: {
          throw new RangeError(`Invalid tab position ${tabIndex}`);
        }
      }

      const totalBalance = _.sum(oracle.amounts);
      const raisedString = `${this.props.intl.formatMessage(messages.raise)}: ${totalBalance.toFixed(2)} ${oracle.token}`;

      let displayOptions = [];
      // Determine what options showing in progress bars
      if (oracle.token === Token.Bot) {
        displayOptions = _.filter(oracle.options, (option, index) => {
          // If index of option is in optionsIdx array
          if (oracle.optionIdxs.indexOf(index) >= 0) {
            return option;
          }

          return false;
        });
      } else {
        displayOptions = _.map(oracle.options, _.clone);
      }

      // Trim options array to only MAX_DISPLAY_OPTIONS (3) elements
      if (!_.isEmpty(displayOptions) && displayOptions.length > MAX_DISPLAY_OPTIONS) {
        displayOptions = displayOptions.slice(0, MAX_DISPLAY_OPTIONS);
      }

      const threshold = oracle.consensusThreshold;

      // Constructing opitons elements
      let optionsEle = null;

      if (!_.isEmpty(displayOptions)) {
        if (oracle.token === Token.Bot) {
          optionsEle = displayOptions.map((result, index) => (
            <SingleProgressWidget
              key={`option${index}`}
              label={result}
              percent={threshold === 0 ?
                threshold : _.round((oracle.amounts[oracle.optionIdxs[index]] / threshold) * 100)}
              barHeight={12}
              fontColor="#4A4A4A"
            />
          ));
        } else {
          optionsEle = displayOptions.map((result, index) => (
            <SingleProgressWidget
              key={`option${index}`}
              label={result}
              percent={totalBalance === 0 ? totalBalance : _.round((oracle.amounts[index] / totalBalance) * 100)}
              barHeight={12}
              fontColor="#4A4A4A"
            />
          ));
        }
      }

      // Make sure length of options element array is MAX_DISPLAY_OPTIONS (3) so that every card has the same height
      // Ideally there should a be loop in case MAX_DISPLAY_OPTIONS is greater than 3
      if (optionsEle && optionsEle.length < MAX_DISPLAY_OPTIONS) {
        for (let i = optionsEle.length; i < MAX_DISPLAY_OPTIONS; i += 1) {
          optionsEle.push(<div
            key={`option-placeholder-${i}`}
            style={{ height: '48px', marginTop: '18px', marginBottom: '18px' }}
          ></div>);
        }
      }

      // Constructing Card element on the right
      const oracleEle = (
        <Col
          xs={colWidth.xs}
          sm={colWidth.sm}
          xl={colWidth.xl}
          key={oracle.address}
          style={{ marginBottom: '24px' }}
        >
          <IsoWidgetsWrapper>
            {/* Report Widget */}
            <ReportsWidget
              label={oracle.name}
              details={[raisedString, endText]}
            >
              {optionsEle}
            </ReportsWidget>
            <BottomButtonWidget
              pathname={`/oracle/${oracle.topicAddress}/${oracle.address}`}
              text={buttonText}
            />
          </IsoWidgetsWrapper>
        </Col>
      );

      rowItems.push(oracleEle);
    });

    return rowItems;
  }

  renderTopics(topicEvents) {
    // Calculate grid number for Col attribute
    const colWidth = {};

    Object.keys(COL_PER_ROW).forEach((key) => {
      colWidth[key] = 24 / COL_PER_ROW[key];
    });

    const rowItems = [];

    _.each(topicEvents, (topic) => {
      const qtumTotal = _.sum(topic.qtumAmount);
      const botTotal = _.sum(topic.botAmount);

      const raisedString = `${this.props.intl.formatMessage(messages.raise)}: ${qtumTotal.toFixed(2)} ${Token.Qtum}, ${botTotal.toFixed(2)} ${Token.Bot}`;
      const endText = this.props.intl.formatMessage(messages.end);

      let optionBalances = _.map(topic.options, (opt, idx) => {
        const qtumAmount = topic.qtumAmount[idx];
        const botAmount = topic.botAmount[idx];

        return {
          name: opt,
          value: `${qtumAmount} ${Token.Qtum}, ${botAmount} ${Token.Bot}`,
          percent: qtumTotal === 0 ? qtumTotal : _.round((qtumAmount / qtumTotal) * 100),
          secondaryPercent: botTotal === 0 ? botTotal : _.round((botAmount / botTotal) * 100),
        };
      });

      // Trim options array to only MAX_DISPLAY_OPTIONS (3) elements
      if (!_.isEmpty(optionBalances) && optionBalances.length > MAX_DISPLAY_OPTIONS) {
        optionBalances = optionBalances.slice(0, MAX_DISPLAY_OPTIONS);
      }

      // Constructing opitons elements
      let optionsEle = null;

      if (!_.isEmpty(optionBalances)) {
        optionsEle = optionBalances.map((item, index) => (
          <SingleProgressWidget
            key={`option${index}`}
            label={item.name}
            percent={item.percent}
            barHeight={12}
            fontColor="#4A4A4A"
            barColor={topic.resultIdx === index ? '' : 'grey'}
            secondaryPercent={item.secondaryPercent}
            secondaryBarHeight={item.secondaryBarHeight}
          />
        ));
      }

      // Make sure length of options element array is MAX_DISPLAY_OPTIONS (3) so that every card has the same height
      // Ideally there should a be loop in case MAX_DISPLAY_OPTIONS is greater than 3
      if (optionsEle && optionsEle.length < MAX_DISPLAY_OPTIONS) {
        for (let i = optionsEle.length; i < MAX_DISPLAY_OPTIONS; i += 1) {
          optionsEle.push(<div
            key={`option-placeholder-${i}`}
            style={{ height: '72px', marginTop: '18px', marginBottom: '18px' }}
          ></div>);
        }
      }

      const topicEle = (
        <Col xs={colWidth.xs} sm={colWidth.sm} xl={colWidth.xl} key={topic.address} style={{ marginBottom: '24px' }}>
          <IsoWidgetsWrapper>
            {/* Report Widget */}
            <ReportsWidget
              label={topic.name}
              details={[raisedString, endText]}
            >
              {optionsEle}
            </ReportsWidget>

            <BottomButtonWidget
              pathname={`/topic/${topic.address}`}
              text={<FormattedMessage id="bottombutton.withdraw" defaultMessage="Withdraw" />}
            />
          </IsoWidgetsWrapper>
        </Col>
      );

      rowItems.push(topicEle);
    });
    return rowItems;
  }
}

Dashboard.propTypes = {
  getTopics: PropTypes.func,
  getTopicsReturn: PropTypes.array,
  getOracles: PropTypes.func,
  getOraclesReturn: PropTypes.array,
  tabIndex: PropTypes.number,
  sortBy: PropTypes.string,
  syncBlockNum: PropTypes.number,
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

Dashboard.defaultProps = {
  getTopics: undefined,
  getTopicsReturn: [],
  getOracles: undefined,
  getOraclesReturn: [],
  tabIndex: DEFAULT_TAB_INDEX,
  sortBy: undefined,
  syncBlockNum: undefined,
};

const mapStateToProps = (state) => ({
  getTopicsReturn: state.Graphql.get('getTopicsReturn'),
  getOraclesReturn: state.Graphql.get('getOraclesReturn'),
  tabIndex: state.Dashboard.get('tabIndex'),
  sortBy: state.Dashboard.get('sortBy'),
  syncBlockNum: state.App.get('syncBlockNum'),
});

function mapDispatchToProps(dispatch) {
  return {
    getTopics: (filters, orderBy) => dispatch(graphqlActions.getTopics(filters, orderBy)),
    getOracles: (filters, orderBy) => dispatch(graphqlActions.getOracles(filters, orderBy)),
  };
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(Dashboard));