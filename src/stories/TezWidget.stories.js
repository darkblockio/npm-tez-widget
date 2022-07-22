import React, { useEffect, useState } from "react"
import { storiesOf } from "@storybook/react"
import { TezosToolkit } from "@taquito/taquito"
import { BeaconWallet } from "@taquito/beacon-wallet"
import TezosDarkblockWidget from "../lib/TezWidget"

const stories = storiesOf("Tezos Darkblock Widget tester", module)

const cb = (param1) => {
  // console.log('cb', param1)
}

stories.add("App", () => {
  const Widget = () => {
    const [wallet, setWallet] = useState(null)
    const Tezos = new TezosToolkit("https://mainnet-tezos.giganode.io")
    const [loaded, setLoaded] = useState(false)

    const tezosWallet = new BeaconWallet({
      name: "darkblock.io",
    })
    Tezos.setWalletProvider(tezosWallet)

    useEffect(async () => {
      try {
        await tezosWallet.clearActiveAccount()
        Tezos.setWalletProvider(tezosWallet)
        setWallet(tezosWallet)
        setLoaded(true)
      } catch (error) {
        console.log("error", error)
        setWallet(null)
        setLoaded(true)
      }
    }, [])

    return (
      <div>
        {loaded && (
          <TezosDarkblockWidget
            contractAddress="KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS"
            tokenId="68015"
            wa={wallet}
            cb={cb}
            config={{
              customCssClass: "",
              debug: true,
              imgViewer: {
                showRotationControl: true,
                autoHideControls: true,
                controlsFadeDelay: true,
              },
            }}
          />
        )}
      </div>
    )
  }

  return <Widget />
})
