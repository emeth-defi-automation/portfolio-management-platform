DEFINE TABLE wallet SCHEMALESS;
DEFINE FIELD address ON TABLE wallet TYPE string;
DEFINE FIELD chainId ON TABLE wallet TYPE number;
DEFINE FIELD isExecutable ON TABLE wallet TYPE bool;
DEFINE FIELD nativeBalance ON TABLE wallet TYPE string;
DEFINE INDEX walletAddressIndex ON TABLE wallet COLUMNS address, chainId UNIQUE;