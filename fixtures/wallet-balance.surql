DEFINE TABLE walletBalance SCHEMAFULL PERMISSIONS NONE;
DEFINE FIELD timestamp ON walletBalance TYPE datetime;
DEFINE FIELD blockNumber ON walletBalance TYPE string;
DEFINE FIELD walletValue ON walletBalance TYPE string;
DEFINE FIELD walletId ON walletBalance TYPE string;
DEFINE FIELD tokenSymbol ON walletBalance TYPE string;