import { Map } from 'immutable';
import _ from 'lodash';

import { AppLocation, Token, SortBy } from '../../constants';
import { getDefaultPath } from '../../helpers/urlSync';
import { satoshiToDecimal } from '../../helpers/utility';
import actions, { getView } from './actions';

const preKeys = getDefaultPath();

const initState = new Map({
  collapsed: !(window.innerWidth > 1220),
  view: getView(window.innerWidth),
  height: window.innerHeight,
  current: preKeys,
  appLocation: AppLocation.qtumPrediction,
  walletAddresses: [],
  lastUsedAddress: '',
  syncPercent: 0,
  syncBlockNum: 0,
  syncBlockTime: 0,
  totalQtum: 0,
  walletUnlockDialogVisibility: false,
  walletEncrypted: false,
  walletUnlockedUntil: 0,
  pendingTxsSnackbarVisible: true,
  createEventDialogVisible: false,
});

export default function appReducer(state = initState, action) {
  switch (action.type) {
    case actions.TOGGLE_ALL: {
      if (state.get('view') !== action.view || action.height !== state.height) {
        const height = action.height ? action.height : state.height;
        return state
          .set('collapsed', action.collapsed)
          .set('view', action.view)
          .set('height', height);
      }
      return state;
    }
    case actions.SET_APP_LOCATION: {
      return state.set('appLocation', action.location);
    }
    case actions.SET_LAST_USED_ADDRESS: {
      return state.set('lastUsedAddress', action.address);
    }
    case actions.SYNC_INFO_RETURN: {
      if (action.error) {
        return state.set('syncInfoError', action.error);
      }

      // Process address balances to decimals
      let newAddresses = [];
      _.each(action.syncInfo.addressBalances, (addressObj) => {
        newAddresses.push({
          address: addressObj.address,
          qtum: satoshiToDecimal(addressObj.qtum),
          bot: satoshiToDecimal(addressObj.bot),
        });
      });

      // Sort by qtum balance
      newAddresses = _.orderBy(newAddresses, ['qtum'], [SortBy.Descending.toLowerCase()]);

      // Set a default selected address if there was none selected before
      let lastUsedAddress = state.get('lastUsedAddress');
      if (_.isEmpty(lastUsedAddress) && !_.isEmpty(newAddresses)) {
        lastUsedAddress = newAddresses[0].address;
      }

      const totalQtum = _.sumBy(newAddresses, (addressObj) => addressObj.qtum ? addressObj.qtum : 0);

      return state
        .set('syncPercent', action.syncInfo.syncPercent)
        .set('syncBlockNum', action.syncInfo.syncBlockNum)
        .set('syncBlockTime', Number(action.syncInfo.syncBlockTime))
        .set('walletAddresses', newAddresses)
        .set('lastUsedAddress', lastUsedAddress)
        .set('totalQtum', totalQtum);
    }
    case actions.GET_INSIGHT_TOTALS_RETURN: {
      return state.set('averageBlockTime', action.value.result.time_between_blocks);
    }
    case actions.TOGGLE_WALLET_UNLOCK_DIALOG: {
      return state.set('walletUnlockDialogVisibility', action.isVisible);
    }
    case actions.CHECK_WALLET_ENCRYPTED_RETURN: {
      if (action.error) {
        return state.set('errorApp', action.error);
      }
      return state.set('walletEncrypted', action.value);
    }
    case actions.UNLOCK_WALLET_RETURN: {
      if (action.error) {
        return state.set('errorApp', action.error);
      }
      return state.set('walletUnlockedUntil', action.value);
    }
    case actions.CLEAR_ERROR_APP: {
      return state.set('errorApp', undefined);
    }
    case actions.TOGGLE_PENDING_TXS_SNACKBAR: {
      return state.set('pendingTxsSnackbarVisible', action.isVisible);
    }
    case actions.TOGGLE_CREATE_EVENT_DIALOG: {
      return state.set('createEventDialogVisible', action.isVisible);
    }
    case actions.SUBTRACT_FROM_BALANCE: {
      const newAddresses = state.get('walletAddresses');
      const addressObj = _.find(newAddresses, { address: action.address });
      if (addressObj) {
        switch (action.token) {
          case Token.Qtum: {
            addressObj.qtum -= action.amount;
            break;
          }
          case Token.Bot: {
            addressObj.bot -= action.amount;
            break;
          }
          default: {
            throw new Error(`Invalid token type: ${action.token}`);
          }
        }
      }
      
      return state.set('walletAddresses', newAddresses)
    }
    default: {
      return state;
    }
  }
}
