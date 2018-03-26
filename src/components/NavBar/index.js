import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { FormattedMessage, injectIntl } from 'react-intl';
import { AppBar, Toolbar, Badge, Button, withStyles } from 'material-ui';
import classNames from 'classnames';
import { Link } from './components/Link/index';
import { NavLink } from './components/NavLink/index';
import { RouterPath, AppLocation, EventStatus } from '../../constants';
import styles from './styles';

@injectIntl
@withStyles(styles, { withTheme: true })
@connect((state, props) => ({
  ...state.App.toJS(),
  actionableItemCount: state.Graphql.get('actionableItemCount'),
}), (dispatch, props) => ({
}))
export default class NavBar extends React.PureComponent {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    walletAddresses: PropTypes.array.isRequired,
    actionableItemCount: PropTypes.object,
    totalQtum: PropTypes.number.isRequired,
    langHandler: PropTypes.func,
    appLocation: PropTypes.string.isRequired,
  };

  static defaultProps = {
    actionableItemCount: undefined,
    langHandler: undefined,
  };

  render() {
    const { classes, appLocation } = this.props;

    return (
      <AppBar position="fixed" className={classes.navBar}>
        <Toolbar className={classes.navBarWrapper}>
          <NavSection>
            <Link to={RouterPath.qtumPrediction}>
              <img
                src="http://res.cloudinary.com/dd1ixvdxn/image/upload/c_scale,h_38/v1514426750/logo_en_oa4ewt.svg"
                alt="bodhi-logo"
                className={classes.navBarLogo}
              />
            </Link>
            <NavLink to={RouterPath.qtumPrediction}>
              <Button
                data-index={EventStatus.Bet}
                className={classNames(
                  classes.navEventsButton,
                  appLocation === AppLocation.qtumPrediction || appLocation === AppLocation.bet ? 'selected' : '',
                )}
              >
                <FormattedMessage id="navbar.qtumPrediction" defaultMessage="QTUM Prediction" />
              </Button>
            </NavLink>
            <NavLink to={RouterPath.botCourt}>
              <Button
                data-index={EventStatus.Vote}
                className={classNames(
                  classes.navEventsButton,
                  appLocation === AppLocation.botCourt || appLocation === AppLocation.vote ? 'selected' : '',
                )}
              >
                <FormattedMessage id="navbar.botCourt" defaultMessage="BOT Court" />
              </Button>
            </NavLink>
          </NavSection>
          <NavSection>
            <NavLink to="/my-wallet">
              <Button className={classes.navBarWalletButton}>
                <i className={classNames('icon', 'iconfont', 'icon-ic_wallet', classes.navBarWalletIcon)}></i>
                {`${this.getTotalQTUM()} QTUM / ${this.getTotalBOT()} BOT`}
              </Button>
            </NavLink>
            <Button onClick={this.props.langHandler} className={`${classes.dark} ${classes.sides}`}>
              <FormattedMessage id="language.select" defaultMessage="中文" />
            </Button>
            {this.renderActivitiesButtonWithBadge()}
          </NavSection>
        </Toolbar>
      </AppBar>
    );
  }

  renderCurrentTabArrow = (currentPath) => {
    const {
      classes,
      match,
    } = this.props;

    return (
      <img
        src="/images/nav-arrow.png"
        alt="nav-arrow"
        className={
          classNames(
            classes.navArrow,
            currentPath === RouterPath.myWallet || currentPath === RouterPath.set ? 'right' : ''
          )
        }
      />
    );
  };

  renderActivitiesButtonWithBadge = () => {
    const {
      classes,
      match,
      appLocation,
      actionableItemCount,
    } = this.props;

    if (actionableItemCount.totalCount > 0) {
      return (
        <NavLink to={RouterPath.set}>
          <Badge badgeContent={actionableItemCount.totalCount} color="secondary">
            <Button className={`${classes.navEventsButton} ${classes.dark}`}>
              <FormattedMessage id="navBar.activities" defaultMessage="My Activities" />
            </Button>
          </Badge>
        </NavLink>
      );
    }

    return (
      <NavLink to={RouterPath.set}>
        <Button className={`${classes.navEventsButton} ${classes.dark}`}>
          <FormattedMessage id="navBar.activities" defaultMessage="My Activities" />
        </Button>
      </NavLink>
    );
  };

  getTotalQTUM = () => {
    const { walletAddresses } = this.props;

    let total = 0;
    if (walletAddresses && walletAddresses.length) {
      total = _.sumBy(walletAddresses, (wallet) => wallet.qtum ? wallet.qtum : 0);
    }

    return total.toFixed(2);
  };

  getTotalBOT = () => {
    const { walletAddresses } = this.props;

    let total = 0;
    if (walletAddresses && walletAddresses.length) {
      total = _.sumBy(walletAddresses, (wallet) => wallet.bot ? wallet.bot : 0);
    }

    return total.toFixed(2);
  };
}

const NavSection = withStyles(styles)(({ classes, ...props }) => <div {...props} className={classes.navSection} />);
