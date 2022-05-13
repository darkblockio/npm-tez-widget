import React, { useState, useEffect } from "react"
import { Header, Panel, Player, utils, widgetMachine } from "@darkblock.io/shared-components"
import "./db.css"
import { useMachine } from "@xstate/react"

const platform = "Tezos"

const TezosDarkblockWidget = ({
  contractAddress,
  tokenId,
  wa = null,
  cb = null,
  config = {
    customCssClass: "",
    debug: false,
    imgViewer: {
      showRotationControl: true,
      autoHideControls: true,
      controlsFadeDelay: true,
    },
  },
}) => {
  const [state, send] = useMachine(() => widgetMachine(tokenId, contractAddress, platform))
  const [address, setAddress] = useState(null)
  const [mediaURL, setMediaURL] = useState("")
  const [epochSignature, setEpochSignature] = useState(null)

  const callback = (state) => {
    if (config.debug) console.log("Callback function called from widget. State: ", state)

    if (typeof cb !== "function") return

    try {
      cb(state)
    } catch (e) {
      console.log("Callback function error: ", e)
    }
  }

  useEffect(() => {
    callback(state.value)

    if (state.value === "idle") {
      send({ type: "FETCH_ARWEAVE" })
    }

    if (state.value === "started" && wa && wa.getActiveAccount) {
      // console.log("started")
      // send({ type: "CONNECT_WALLET" })
      const connectWallet = async () => {
        const activeAccount = await wa.getActiveAccount()
        if (activeAccount) {
          // If defined, the user is connected to a wallet.
          // You can now do an operation request, sign request, or send another permission request to switch wallet
          setAddress(activeAccount.address)
          console.log("address: ", address)
          send({ type: "CONNECT_WALLET" })
        }
      }

      connectWallet()
    }

    if (state.value === "wallet_connected") {
      // send({ type: "SIGN" })
    }

    if (state.value === "signing") {
      authenticate(wa)
    }

    if (state.value === "authenticated") {
      send({ type: "DECRYPT" })
    }

    if (state.value === "decrypting") {
      // setMediaURL(
      //   utils.getProxyAsset(
      //     state.context.artId,
      //     epochSignature,
      //     state.context.tokenId,
      //     state.context.contractAddress,
      //     null,
      //     platform
      //   )
      // )
      // setTimeout(() => {
      //   send({ type: "SUCCESS" })
      // }, 1000)
    }

    if (state.value === "display") {
    }
  }, [state.value])

  const authenticate = async (wa) => {
    console.log("wa: ", wa, address)
  }

  return (
    <div className={config.customCssClass ? `DarkblockWidget-App ${config.customCssClass}` : `DarkblockWidget-App`}>
      <>
        {state.value === "display" ? (
          <Player mediaType={state.context.display.fileFormat} mediaURL={mediaURL} config={config.imgViewer} />
        ) : (
          <Header state={state} authenticate={() => send({ type: "SIGN" })} />
        )}
        <Panel state={state} />
        {config.debug && <p>{state.value}</p>}
      </>
    </div>
  )
}

export default TezosDarkblockWidget
