import React, { useState, useEffect } from "react"
import { Header, Panel, Player, utils, widgetMachine } from "@darkblock.io/shared-components"
import "./db.css"
import { useMachine } from "@xstate/react"
import { char2Bytes } from "@taquito/utils"
import { SigningType } from "@airgap/beacon-sdk"

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
  const [key, setKey] = useState(null)
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
      console.log("started sdfsdfsdfa", wa.connectionStatus)
      // send({ type: "CONNECT_WALLET" })
      const connectWallet = async () => {
        const activeAccount = await wa.getActiveAccount()

        if (activeAccount) {
          // If defined, the user is connected to a wallet.
          // You can now do an operation request, sign request, or send another permission request to switch wallet
          setAddress(activeAccount.address)
          setKey(activeAccount.publicKey)
          console.log("Got active account", activeAccount.address)
          console.log("Got active account", activeAccount.publicKey)
          send({ type: "CONNECT_WALLET" })
        } else {
          try {
            const permissions = await wa.requestPermissions()
            setAddress(permissions.address)
            setKey(permissions.publicKey)
            console.log("Got permissions", permissions.address)
            console.log("Got permissions", permissions.publicKey)
          } catch (e) {
            console.log("Got error: ", e)
          }
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
      setMediaURL(
        utils.getProxyAsset(
          state.context.artId,
          epochSignature,
          state.context.tokenId,
          state.context.contractAddress,
          null,
          platform,
          key
        )
      )
      setTimeout(() => {
        send({ type: "SUCCESS" })
      }, 1000)
    }

    if (state.value === "display") {
    }
  }, [state.value])

  const authenticate = async (wa) => {
    let signature = null
    let epoch = Date.now()
    let data = epoch + key
    let payloadBytes = "0501" + char2Bytes(data)
    let ownerDataWithOwner

    const payload = {
      signingType: SigningType.MICHELINE,
      payload: payloadBytes,
      sourceAddress: address,
    }

    try {
      ownerDataWithOwner = await utils.getOwner(contractAddress, tokenId, platform, address)

      if (
        !ownerDataWithOwner ||
        !ownerDataWithOwner.owner_address ||
        ownerDataWithOwner.owner_address.toLowerCase() !== address.toLowerCase()
      ) {
        send({ type: "FAIL" })
      } else {
        const signedPayload = await wa.requestSignPayload(payload)
        signature = encodeURIComponent(signedPayload.signature) + "_Tezos"
        console.log(signature)
        setEpochSignature(epoch + "_" + signature)
        console.log(epochSignature)
        send({ type: "SUCCESS" })
      }
    } catch (e) {
      console.log(e)
      signature ? send({ type: "FAIL" }) : send({ type: "CANCEL" })
    }
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
        <p>{address}</p>
      </>
    </div>
  )
}

export default TezosDarkblockWidget
