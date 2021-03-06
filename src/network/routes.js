const AUTHORITY = '127.0.0.1:19947';
const HTTP_ROUTE = `http://${AUTHORITY}`;
const WS_ROUTE = `ws://${AUTHORITY}`;

const QTUM_EXPLORER = {
  dev: 'https://testexplorer.berycoin.com',
  prod: 'https://explorer.berycoin.com',
}[process.env.REACT_APP_ENV];
const BASE_INSIGHT = `${QTUM_EXPLORER}/insight-api`;

export default {
  graphql: {
    http: `${HTTP_ROUTE}/graphql`,
    subs: `${WS_ROUTE}/subscriptions`,
  },
  api: {
    getWalletInfo: `${HTTP_ROUTE}/get-wallet-info`,
    unlockWallet: `${HTTP_ROUTE}/wallet-passphrase`,
    eventEscrowAmount: `${HTTP_ROUTE}/event-escrow-amount`,
    winnings: `${HTTP_ROUTE}/winnings`,
    betBalances: `${HTTP_ROUTE}/bet-balances`,
    voteBalances: `${HTTP_ROUTE}/vote-balances`,
    validateAddress: `${HTTP_ROUTE}/validate-address`,
    encryptWallet: `${HTTP_ROUTE}/encrypt-wallet`,
    backupWallet: `${HTTP_ROUTE}/backup-wallet`,
    importWallet: `${HTTP_ROUTE}/import-wallet`,
    transactionCost: `${HTTP_ROUTE}/transaction-cost`,
  },
  insight: {
    totals: `${BASE_INSIGHT}/statistics/total`,
  },
  explorer: {
    tx: 'https://qtumhost/tx',
  },
};
