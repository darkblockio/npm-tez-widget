import { char2Bytes } from "@taquito/utils"

const signTezosData = async (data, wallet) => {
  const activeAccount = await wallet.client.getActiveAccount()
  let address = null
  let permissions = null
  let signature = null

  if (activeAccount) {
    address = activeAccount.address
  } else {
    await wallet.clearActiveAccount()
    permissions = await wallet.client.requestPermissions()
    address = permissions.address
  }

  const formattedInput = [
    'Tezos Signed Message:',
    '\n\n',
    data,
  ].join(' ');

  const bytes = char2Bytes(formattedInput)
  const payloadBytes = '050100' + char2Bytes('' + bytes.length) + bytes

  const payload = {
    signingType: "micheline",
    payload: payloadBytes,
    sourceAddress: address,
  }

  return new Promise((resolve, reject) => {
    try {
      const signData = async () => {
        const signedPayload = await wallet.client.requestSignPayload(payload)
        signature = encodeURIComponent(signedPayload.signature)

        if (!signedPayload) {
          reject("error signing")
        } else {
          resolve(signature)
        }
      }
      signData()
    } catch (err) {
      reject(err)
    }
  })
}

export default signTezosData
