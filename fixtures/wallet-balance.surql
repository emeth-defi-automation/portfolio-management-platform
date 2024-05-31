DEFINE TABLE wallet_balance SCHEMAFULL PERMISSIONS NONE;
DEFINE FIELD timestamp ON wallet_balance TYPE datetime;
DEFINE FIELD blockNumber ON wallet_balance TYPE string;
DEFINE FIELD walletValue ON wallet_balance TYPE string;
DEFINE FIELD walletId ON wallet_balance TYPE any;
DEFINE FIELD tokenSymbol ON wallet_balance TYPE string;