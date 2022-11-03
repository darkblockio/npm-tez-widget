import React, { useState, useEffect } from "react"
import { Stack, utils, widgetMachine } from "@darkblock.io/shared-components"
import { useMachine } from "@xstate/react"
import { char2Bytes } from "@taquito/utils"

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
  dev = false,
}) => {
  const [state, send] = useMachine(() => widgetMachine(tokenId, contractAddress, platform, dev))
  const [address, setAddress] = useState(null)
  const [keyAddress, setKeyAddress] = useState(null)
  const [mediaURL, setMediaURL] = useState("")
  const [stackMediaURLs, setStackMediaURLs] = useState("")
  const [epochSignature, setEpochSignature] = useState(null)

  const callback = (state) => {
    if (config.debug) console.log("Callback function called from widget. State: ", state)

    if (typeof cb !== "function") return

    try {
      cb(state)
    } catch (e) {
      console.error("Callback function error: ", e)
    }
  }

  useEffect(() => {
    callback(state.value)

    if (!wa) {
      send({ type: "NO_WALLET" })
    } else {
      if (state.value === "idle") {
        send({ type: "FETCH_ARWEAVE" })
      }

      if (state.value === "started" && wa) {
        // send({ type: "CONNECT_WALLET" })
        const connectWallet = async () => {
          let tezAddress = null
          let tezPublicKey = null

          const activeAccount = await wa.client.getActiveAccount()
          if (!activeAccount) {
            await wa.clearActiveAccount()
            let permissions = await wa.client.requestPermissions()
            tezAddress = permissions.address
            tezPublicKey = permissions.publicKey
          } else {
            tezAddress = activeAccount.address
            tezPublicKey = activeAccount.publicKey
          }

          setAddress(tezAddress)
          setKeyAddress(tezPublicKey)

          send({ type: "CONNECT_WALLET" })
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
            keyAddress
          )
        )

        let arrTemp = []

        state.context.display.stack.map((db) => {
          arrTemp.push(
            utils.getProxyAsset(
              db.artId,
              epochSignature,
              state.context.tokenId,
              state.context.contractAddress,
              null,
              platform,
              keyAddress
            )
          )
        })

        setStackMediaURLs(arrTemp)

        setTimeout(() => {
          send({ type: "SUCCESS" })
        }, 1000)
      }

      if (state.value === "display") {
      }
    }
  }, [state.value])

  const authenticate = async (wa) => {
    let signature = null
    let epoch = Date.now()

    let permissions = await wa.client.requestPermissions()
    if (!permissions) {
      await wa.clearActiveAccount()
      permissions = await wa.client.requestPermissions()
    }

    setAddress(permissions.address)
    setKeyAddress(permissions.publicKey)

    let data = epoch + permissions.publicKey
    let payloadBytes = "0501" + char2Bytes(data)
    let ownerDataWithOwner

    const payload = {
      signingType: "micheline",
      payload: payloadBytes,
      sourceAddress: address,
    }

    try {
      ownerDataWithOwner = await utils.getOwner(contractAddress, tokenId, platform, address, dev)

      if (
        !ownerDataWithOwner ||
        !ownerDataWithOwner.owner_address ||
        ownerDataWithOwner.owner_address.toLowerCase() !== address.toLowerCase()
      ) {
        send({ type: "FAIL" })
      } else {
        const signedPayload = await wa.client.requestSignPayload(payload)
        signature = encodeURIComponent(signedPayload.signature) + "_Tezos"
        setEpochSignature(epoch + "_" + signature)
        send({ type: "SUCCESS" })
      }
    } catch (e) {
      console.error(e)
      signature ? send({ type: "FAIL" }) : send({ type: "CANCEL" })
    }
  }

  return <Stack state={state} authenticate={() => send({ type: "SIGN" })} urls={stackMediaURLs} config={config} />
}

export default TezosDarkblockWidget
