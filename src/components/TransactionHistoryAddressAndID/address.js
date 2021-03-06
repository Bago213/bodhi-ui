import React from 'react';
import PropTypes from 'prop-types';
import { TableCell } from 'material-ui/Table';
import { FormattedMessage, injectIntl } from 'react-intl';
import { withStyles } from 'material-ui/styles';

import styles from './styles';

const TransactionHistoryAddress = ({ classes, transaction }) => (
  <TableCell padding="dense" className={classes.txidRow}>
    <div className={classes.txidWrapper}>
      <div className={classes.txidLabel}>
        <FormattedMessage id="str.addressUsed" defaultMessage="Address Used" />
      </div>
      <div>
        {transaction.senderAddress}
      </div>
    </div>
  </TableCell>
);

TransactionHistoryAddress.propTypes = {
  classes: PropTypes.object.isRequired,
  transaction: PropTypes.object.isRequired,
};

export default injectIntl(withStyles(styles, { withTheme: true })(TransactionHistoryAddress));
